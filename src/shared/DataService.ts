import { openDB, DBSchema, IDBPDatabase } from "idb";
import { v4 as uuidv4 } from "uuid";
import * as mm from "music-metadata-browser";
// @ts-ignore
import ColorThief from "colorthief";
import { connectorTypeList } from "./connectorTypeList";
import { IConnector } from "./IConnector";
import { getDataUri } from "../lib/getDataUri";
import { Unarray } from "../lib/Unarray";

const KEY_STATE = "STATE";

const dbName = "jazz";

export async function init() {
  const db = await openDB<AppDB>(dbName, 1, {
    upgrade(db) {
      db.createObjectStore("connectorType", { autoIncrement: false });
      db.createObjectStore("connector", { autoIncrement: false });
      db.createObjectStore("state", { autoIncrement: false });
      const albumStore = db.createObjectStore("album", {
        autoIncrement: false,
      });
      const artistStore = db.createObjectStore("artist", {
        autoIncrement: false,
      });
      const trackStore = db.createObjectStore("track", {
        autoIncrement: false,
      });
      db.createObjectStore("genre", { autoIncrement: false });

      albumStore.createIndex("albumsort", "albumsort");
      albumStore.createIndex("artistId", "artistId");
      artistStore.createIndex("artistsort", "artistsort");
      trackStore.createIndex("albumId", "albumId");
      trackStore.createIndex("artistId", "artistId");
      trackStore.createIndex("connectorId", "connectorId");
    },
  });
  const tx = db.transaction(["connectorType"], "readwrite");
  const connectorTypeStore = tx.objectStore("connectorType");
  await Promise.all(
    connectorTypeList.map((connectorType) => {
      const { connectorTypeClass, logo, ...rest } = connectorType;
      return connectorTypeStore.put(rest, rest.id);
    })
  );
  await tx.done;
  return new DataService(db);
}

export class DataService {
  db: IDBPDatabase<AppDB>;
  static isImporting: boolean = false;

  constructor(db: IDBPDatabase<AppDB>) {
    this.db = db;
  }

  async import(input: { connectors: Array<IConnector>; onUpdate: () => void }) {
    try {
      DataService.isImporting = true;
      const { connectors, onUpdate } = input;
      for (let connector of connectors) {
        const colorThief = new ColorThief();

        for (let _id of await connector.getTrackIdList()) {
          if (
            !!(await this.getTrackByInternalIdAndConnectorId(
              _id,
              connector.getId()
            ))
          ) {
            // Already exists
            continue;
          }

          const blob = await connector.downloadTrack({ id: _id });
          const metadata = await mm.parseBlob(blob, { duration: true });

          const genreFirst = metadata.common.genre?.[0];
          let genreId =
            genreFirst == null
              ? null
              : (await this.getGenreByName(genreFirst))?.id ?? null;

          let artistId = (await this.getArtistByName(metadata.common.artist))
            ?.id;

          let albumId = (await this.getAlbumByName(metadata.common.album))?.id;

          const pictureList = metadata.common.picture;
          let color: string | undefined = undefined;
          if (albumId == null) {
            if (pictureList?.[0] != null) {
              const src = getDataUri(
                pictureList[0].format,
                Buffer.from(pictureList[0].data).toString("base64")
              );
              const img = await loadImage({ src, width: 50, height: 50 });
              const colorResult = await colorThief.getColor(img);
              color = `rgb(${colorResult.join(", ")})`;
            }
          }

          const tx = this.db.transaction(
            ["genre", "artist", "album", "track"],
            "readwrite"
          );

          const genreStore = tx.objectStore("genre");
          const artistStore = tx.objectStore("artist");
          const albumStore = tx.objectStore("album");
          const trackStore = tx.objectStore("track");

          if (genreId == null && genreFirst) {
            genreId = uuidv4();
            await genreStore.put(
              { id: genreId, name: genreFirst, createdAt: new Date() },
              genreId
            );
          }

          if (artistId == null) {
            artistId = uuidv4();
            await artistStore.put(
              {
                id: artistId,
                name: metadata.common.artist,
                artistsort:
                  metadata.common.artistsort ?? metadata.common.artist,
                createdAt: new Date(),
              },
              artistId
            );
          }

          if (albumId == null) {
            albumId = uuidv4();
            await albumStore.put(
              {
                id: albumId,
                name: metadata.common.album,
                artistId,
                year: metadata.common.year,
                pictureList,
                trackCount: metadata.common.track.of,
                label: metadata.common.label,
                copyright: metadata.common.copyright,
                color,
                albumsort: metadata.common.albumsort ?? metadata.common.album,
                createdAt: new Date(),
              },
              albumId
            );
          }

          const trackId = uuidv4();
          await trackStore.put(
            {
              id: trackId,
              _id,
              connectorId: connector.getId(),
              title: metadata.common.title,
              artistId,
              albumId,
              genreId,
              year: metadata.common.year,
              number: metadata.common.track.no,
              duration: metadata.format.duration,
              createdAt: new Date(),
            },
            trackId
          );

          await tx.done;

          onUpdate();
        }
      }
    } finally {
      DataService.isImporting = false;
    }
  }

  async addConnector(value: Omit<AppDB["connector"]["value"], "id">) {
    const id = uuidv4();
    const record = { ...value, id };
    return this.db.put("connector", record, id);
  }

  async removeConnectorAndLinkedRecords(id: AppDB["connector"]["key"]) {
    const trackList = await this.db.getAllFromIndex("track", "connectorId", id);

    const tx = this.db.transaction(
      ["artist", "album", "track", "connector"],
      "readwrite"
    );

    const artistStore = tx.objectStore("artist");
    const albumStore = tx.objectStore("album");
    const trackStore = tx.objectStore("track");
    const connectorStore = tx.objectStore("connector");

    await Promise.all([
      ...trackList.flatMap((track) => [
        artistStore.delete(track.artistId),
        albumStore.delete(track.albumId),
        trackStore.delete(track.id),
      ]),
      connectorStore.delete(id),
    ]);

    await tx.done;
  }

  async replaceConnector(value: AppDB["connector"]["value"]) {
    return this.db.put("connector", value, value.id);
  }

  async getConnectorList() {
    return this.db
      .getAllKeys("connector")
      .then((xs) => Promise.all(xs.map((x) => this.loadConnector(x))));
  }

  async getState() {
    return this.db.get("state", KEY_STATE);
  }

  async setState(value: AppDB["state"]["value"]) {
    return this.db.put("state", value, KEY_STATE);
  }

  async setStateVolume(value: AppDB["state"]["value"]["volume"]) {
    const current = this.getState();
    const next = { ...current, volume: value };
    return this.db.put("state", next, KEY_STATE);
  }

  async getTrackList(input?: { limit?: number; offset?: number | null }) {
    const limit = input?.limit ?? 100;
    const offset = input?.offset ?? 0;

    let cursor = await this.db.transaction("track").store.openCursor();

    if (offset > 0 && cursor != null) {
      await cursor.advance(offset);
    }

    let idList: Array<AppDB["track"]["key"]> = [];
    while (
      cursor != null &&
      // Peek to see if there's a next page
      idList.length < limit + 1
    ) {
      idList.push(cursor.key);
      cursor = await cursor.continue();
    }

    const hasNextPage = idList.length === limit + 1;
    // Because we peeked
    idList.pop();
    const results = await Promise.all(idList.map((x) => this.loadTrack(x)));

    return {
      results,
      pagination: {
        hasNextPage,
        offsetEnd: hasNextPage ? offset + results.length : null,
      },
    };
  }

  async getTrack(id: AppDB["track"]["key"]) {
    return this.loadTrack(id);
  }

  async getAlbumList(input?: { limit?: number; offset?: number | null }) {
    const limit = input?.limit ?? 100;
    const offset = input?.offset ?? 0;

    let cursor = await this.db
      .transaction("album")
      .store.index("albumsort")
      .openCursor();

    if (offset > 0 && cursor != null) {
      await cursor.advance(offset);
    }

    let idList: Array<AppDB["album"]["key"]> = [];
    while (
      cursor != null &&
      // Peek to see if there's a next page
      idList.length < limit + 1
    ) {
      idList.push(cursor.value.id);
      cursor = await cursor.continue();
    }

    const hasNextPage = idList.length === limit + 1;
    // Because we peeked
    idList.pop();
    const results = await Promise.all(idList.map((x) => this.loadAlbum(x)));

    return {
      results,
      pagination: {
        hasNextPage,
        offsetEnd: hasNextPage ? offset + results.length : null,
      },
    };
  }

  async getAlbum(id: AppDB["album"]["key"]) {
    return this.loadAlbum(id);
  }

  async getArtistList(input?: { limit?: number; offset?: number | null }) {
    const limit = input?.limit ?? 100;
    const offset = input?.offset ?? 0;

    let cursor = await this.db
      .transaction("artist")
      .store.index("artistsort")
      .openCursor();

    if (offset > 0 && cursor != null) {
      await cursor.advance(offset);
    }

    let idList: Array<AppDB["artist"]["key"]> = [];
    while (
      cursor != null &&
      // Peek to see if there's a next page
      idList.length < limit + 1
    ) {
      idList.push(cursor.value.id);
      cursor = await cursor.continue();
    }

    const hasNextPage = idList.length === limit + 1;
    // Because we peeked
    idList.pop();
    const results = await Promise.all(idList.map((x) => this.loadArtist(x)));

    return {
      results,
      pagination: {
        hasNextPage,
        offsetEnd: hasNextPage ? offset + results.length : null,
      },
    };
  }

  async getArtist(id: AppDB["artist"]["key"]) {
    return this.loadArtist(id);
  }

  async getAlbumListForArtist(id: AppDB["artist"]["key"]) {
    return this.db
      .getAllKeysFromIndex("album", "artistId", id)
      .then((xs) => Promise.all(xs.map((x) => this.loadAlbum(x))))
      .then((xs) => xs.sort((a, b) => -1 * ((a.year ?? 0) - (b.year ?? 0))));
  }

  async getTrackListForAlbum(id: AppDB["album"]["key"]) {
    return this.db
      .getAllKeysFromIndex("track", "albumId", id)
      .then((xs) => Promise.all(xs.map((x) => this.loadTrack(x))))
      .then((xs) => xs.sort((a, b) => (a.number ?? 0) - (b.number ?? 0)));
  }

  async getTrackListForArtist(id: AppDB["artist"]["key"]) {
    return this.db
      .getAllKeysFromIndex("track", "artistId", id)
      .then((xs) => Promise.all(xs.map((x) => this.loadTrack(x))))
      .then((xs) => xs.sort((a, b) => (a.number ?? 0) - (b.number ?? 0)));
  }

  private async loadConnector(id: AppDB["connector"]["key"]) {
    const x = await this.db.get("connector", id);
    if (x == null) {
      throw new Error("Not found: " + id);
    }
    const connectorType = (await this.db.get(
      "connectorType",
      x.connectorTypeId
    ))!;
    return { ...x, connectorType };
  }

  private async loadTrack(id: AppDB["track"]["key"]) {
    const x = await this.db.get("track", id);
    if (x == null) {
      throw new Error("Not found: " + id);
    }
    const artist = await this.loadArtist(x.artistId);
    const album = await this.loadAlbum(x.albumId);
    return { ...x, artist, album };
  }

  private async loadAlbum(id: AppDB["album"]["key"]) {
    const x = await this.db.get("album", id);
    if (x == null) {
      throw new Error("Not found: " + id);
    }
    const artist = await this.loadArtist(x.artistId);
    return { ...x, artist };
  }

  private async loadArtist(id: AppDB["artist"]["key"]) {
    const x = await this.db.get("artist", id);
    if (x == null) {
      throw new Error("Not found: " + id);
    }
    return x;
  }

  private async getTrackByInternalIdAndConnectorId(
    _id: AppDB["track"]["value"]["_id"],
    connectorId: AppDB["track"]["value"]["connectorId"]
  ) {
    let cursor = await this.db.transaction("track").store.openCursor();
    while (cursor != null) {
      if (
        cursor.value._id === _id &&
        cursor.value.connectorId === connectorId
      ) {
        return cursor.value;
      }
      cursor = await cursor.continue();
    }
    return null;
  }

  private async getArtistByName(name: AppDB["artist"]["value"]["name"]) {
    let cursor = await this.db.transaction("artist").store.openCursor();
    while (cursor != null) {
      if (cursor.value.name === name) {
        return cursor.value;
      }
      cursor = await cursor.continue();
    }
    return null;
  }

  private async getAlbumByName(name: AppDB["album"]["value"]["name"]) {
    let cursor = await this.db.transaction("album").store.openCursor();
    while (cursor != null) {
      if (cursor.value.name === name) {
        return cursor.value;
      }
      cursor = await cursor.continue();
    }
    return null;
  }

  private async getGenreByName(name: AppDB["genre"]["value"]["name"]) {
    let cursor = await this.db.transaction("genre").store.openCursor();
    while (cursor != null) {
      if (cursor.value.name === name) {
        return cursor.value;
      }
      cursor = await cursor.continue();
    }
    return null;
  }
}

async function loadImage(input: {
  src: string;
  width: number;
  height: number;
}) {
  let img: HTMLImageElement | undefined;
  const { src, width, height } = input;
  const imageLoadPromise = new Promise((resolve) => {
    img = new Image();
    img.onload = resolve;
    img.src = src;
    img.width = width;
    img.height = height;
  });
  await imageLoadPromise;
  return img!;
}

// TODO: trackOffline
interface AppDB extends DBSchema {
  connectorType: {
    key: string;
    value: {
      id: string;
      name: string;
    };
  };
  connector: {
    key: string;
    value: {
      id: string;
      connectorTypeId: AppDB["connectorType"]["key"];
      data: any;
      path: string;
      createdAt: Date;
    };
  };
  state: {
    key: string;
    value: {
      volume: number;
    };
  };
  genre: {
    key: string;
    value: {
      id: string;
      name: Unarray<NonNullable<mm.IAudioMetadata["common"]["genre"]>>;
      createdAt: Date;
    };
  };
  album: {
    key: string;
    value: {
      id: string;
      name: mm.IAudioMetadata["common"]["album"];
      year: mm.IAudioMetadata["common"]["year"];
      artistId: AppDB["artist"]["key"];
      pictureList: mm.IAudioMetadata["common"]["picture"];
      trackCount: mm.IAudioMetadata["common"]["track"]["of"];
      label: mm.IAudioMetadata["common"]["label"];
      copyright: mm.IAudioMetadata["common"]["copyright"];
      color: string | undefined;
      albumsort: mm.IAudioMetadata["common"]["albumsort"];
      createdAt: Date;
    };
    indexes: { albumsort: string; artistId: string };
  };
  artist: {
    key: string;
    value: {
      id: string;
      name: mm.IAudioMetadata["common"]["artist"];
      artistsort: mm.IAudioMetadata["common"]["artistsort"];
      createdAt: Date;
    };
    indexes: { artistsort: string };
  };
  track: {
    key: string;
    value: {
      id: string;
      // The ID of the track in the connected account (e.g. Dropbox)
      _id: string;
      connectorId: string;
      title: mm.IAudioMetadata["common"]["title"];
      albumId: AppDB["album"]["key"];
      artistId: AppDB["artist"]["key"];
      genreId: AppDB["genre"]["key"] | null;
      year: mm.IAudioMetadata["common"]["year"];
      number: mm.IAudioMetadata["common"]["track"]["no"];
      duration: mm.IAudioMetadata["format"]["duration"];
      createdAt: Date;
    };
    indexes: { albumId: string; artistId: string; connectorId: string };
  };
}
