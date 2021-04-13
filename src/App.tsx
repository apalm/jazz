import "./App.css";
import * as React from "react";
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "react-query";
import { ToastContainer } from "react-toastify";
import { DataServiceProvider, useDataService } from "./shared/useDataService";
import { TrackQueueProvider, useTrackQueue } from "./shared/useTrackQueue";
import { AudioProvider } from "./shared/useAudio";
import { formatDocumentTitle } from "./shared/formatDocumentTitle";
import { DocumentTitle } from "./components/lib/DocumentTitle";
import { init, DataService } from "./shared/DataService";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AudioPlayer } from "./components/AudioPlayer";
import { connectorTypeList } from "./shared/connectorTypeList";
import { Nav, NavItem } from "./components/lib/Nav";
import { FullScreenLoading } from "./components/FullScreenLoading";
import { ErrorMessage } from "./components/ErrorMessage";
import { showToast } from "./components/lib/Toast";
import * as cs from "./shared/colorScheme";
import { ThenArg } from "./lib/ThenArg";
import { IConnector } from "./shared/IConnector";
import { IconSettings } from "./icons/IconSettings";
import { IconMusicNote } from "./icons/IconMusicNote";
import { NoConnectedAccounts } from "./components/NoConnectedAccounts";
import { defaultColorScheme } from "./config";
import styles from "./App.module.css";

const NotFound = React.lazy(() => import("./screens/404/404"));
const Settings = React.lazy(() => import("./screens/Settings/Settings"));
const Queue = React.lazy(() => import("./screens/Queue/Queue"));
const O = React.lazy(() => import("./screens/O/O"));
const Songs = React.lazy(() => import("./screens/Songs/Songs"));
const Albums = React.lazy(() => import("./screens/Albums/Albums"));
const Album = React.lazy(() => import("./screens/Album/Album"));
const Artists = React.lazy(() => import("./screens/Artists/Artists"));
const Artist = React.lazy(() => import("./screens/Artist/Artist"));

type TRouteConfig = {
  path: string;
  exact?: boolean;
  title: string;
  component: any;
  Route: any;
  RouteChildren: (x: TRouteConfig) => any;
};

function RouteChildren(x: TRouteConfig) {
  return (
    <React.Suspense fallback={<FullScreenLoading />}>
      <x.component />
    </React.Suspense>
  );
}

function RouteChildrenLibrary(x: TRouteConfig) {
  const queryClient = useQueryClient();
  const connectorList: any = queryClient.getQueryData(["connectorList"]);
  return (
    <React.Suspense fallback={<FullScreenLoading />}>
      {connectorList == null || connectorList.length === 0 ? (
        <NoConnectedAccounts />
      ) : (
        <x.component />
      )}
    </React.Suspense>
  );
}

export const routes: Array<TRouteConfig> = [
  {
    path: "/settings",
    title: "Settings",
    component: Settings,
    Route,
    RouteChildren: RouteChildren,
  },
  {
    path: "/queue",
    title: "Queue",
    component: Queue,
    Route,
    RouteChildren: RouteChildren,
  },
  {
    path: "/o",
    title: "Working...",
    component: O,
    Route,
    RouteChildren: RouteChildren,
  },
  {
    path: "/albums",
    title: "Albums",
    component: Albums,
    Route,
    RouteChildren: RouteChildrenLibrary,
  },
  {
    path: "/albums/:id",
    title: "Album",
    component: Album,
    Route,
    RouteChildren: RouteChildren,
  },
  {
    path: "/artists",
    title: "Artists",
    component: Artists,
    Route,
    RouteChildren: RouteChildrenLibrary,
  },
  {
    path: "/artists/:id",
    title: "Artist",
    component: Artist,
    Route,
    RouteChildren: RouteChildren,
  },
  {
    path: "/songs",
    title: "Songs",
    component: Songs,
    Route,
    RouteChildren: RouteChildrenLibrary,
  },
];

export const KEY_COLOR_SCHEME = "COLOR_SCHEME";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <App1 />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

function App1() {
  const colorScheme =
    window.localStorage.getItem(KEY_COLOR_SCHEME) ?? defaultColorScheme;
  const dataServiceInitResult = useQuery(["dataService"], () => init());
  const _dataService = dataServiceInitResult?.data;
  const connectorListResult = useQuery(
    ["connectorList"],
    () => _dataService!.getConnectorList(),
    { enabled: !!_dataService }
  );
  const stateResult = useQuery(["state"], () => _dataService!.getState(), {
    enabled: !!_dataService,
  });
  React.useEffect(() => {
    if (colorScheme === cs.valueDark) {
      cs.setDark();
    } else {
      cs.setLight();
    }
  }, [colorScheme]);
  if (
    dataServiceInitResult.status === "loading" ||
    connectorListResult.status === "loading" ||
    stateResult.status === "loading"
  ) {
    return <FullScreenLoading />;
  }
  if (
    dataServiceInitResult.status === "error" ||
    dataServiceInitResult.data === undefined ||
    connectorListResult.status === "error" ||
    connectorListResult.data === undefined
    // Ignore stateResult errors; not critical
  ) {
    return <ErrorMessage error={dataServiceInitResult.error} />;
  }
  const dataService = dataServiceInitResult.data;
  const state = stateResult.data;
  const connectorClassList = connectorListResult.data.map((connector) => {
    const connectorType = connectorTypeList.find(
      (x) => x.id === connector.connectorTypeId
    )!;
    return new connectorType.connectorTypeClass(connector);
  });
  return (
    <DataServiceProvider dataService={dataService}>
      <TrackQueueProvider>
        <App2 connectorClassList={connectorClassList} state={state} />
      </TrackQueueProvider>
    </DataServiceProvider>
  );
}

function App2(props: {
  connectorClassList: Array<IConnector>;
  state: ThenArg<ReturnType<ThenArg<ReturnType<typeof init>>["getState"]>>;
}) {
  const { connectorClassList, state } = props;
  const queryClient = useQueryClient();
  const tq = useTrackQueue();
  const { dataService } = useDataService();
  const trackCurrent = tq.state.trackCurrent;
  const connector =
    trackCurrent == null
      ? null
      : connectorClassList.find((x) => x.getId() === trackCurrent?.connectorId);
  const src =
    trackCurrent == null || connector == null
      ? ""
      : connector.getTrackUrl({ id: trackCurrent._id });
  React.useEffect(() => {
    run();
    async function run() {
      try {
        if (DataService.isImporting || !navigator.onLine) {
          return;
        }
        await dataService.import({
          connectors: connectorClassList,
          onUpdate: () => {
            queryClient.refetchQueries({ active: true });
          },
        });
      } catch (e) {
        showToast(e.message, { type: "error" });
      }
    }
  }, [dataService, connectorClassList, queryClient]);
  return (
    <AudioProvider src={src} volume={state?.volume ?? 1}>
      <BrowserRouter>
        <div className={styles.layout}>
          <header className={styles.header}>
            <Link to="/" className={styles.logoLink}>
              <IconMusicNote />
            </Link>
            <Nav>
              {[
                { to: "/albums", text: "Albums" },
                { to: "/artists", text: "Artists" },
                { to: "/songs", text: "Songs" },
              ].map((x, i) => (
                <NavItem key={i} to={x.to} exact={false}>
                  {x.text}
                </NavItem>
              ))}
            </Nav>
            <div>
              <Link to="/settings" className={styles.settingsLink}>
                <IconSettings />
              </Link>
            </div>
          </header>
          <div className={styles.content}>
            <React.Suspense fallback={<FullScreenLoading />}>
              <Route exact path="/">
                <Redirect to="/albums" />
              </Route>
              <Switch>
                {routes.map((x, i) => (
                  <x.Route key={i} exact={x.exact ?? true} path={x.path}>
                    <DocumentTitle>
                      {formatDocumentTitle(x.title)}
                    </DocumentTitle>
                    <x.RouteChildren {...x} />
                  </x.Route>
                ))}
                <Route>
                  <NotFound />
                </Route>
              </Switch>
            </React.Suspense>
          </div>
          <AudioPlayer />
        </div>
      </BrowserRouter>
    </AudioProvider>
  );
}
