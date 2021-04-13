import * as React from "react";
import { init } from "./DataService";
import { ThenArg } from "../lib/ThenArg";

export function useDataService() {
  return React.useContext(DataServiceContext);
}

export function DataServiceProvider(props: T & { children: React.ReactNode }) {
  const { children, dataService } = props;
  return (
    <DataServiceContext.Provider value={{ dataService }}>
      {children}
    </DataServiceContext.Provider>
  );
}

type T = { dataService: ThenArg<ReturnType<typeof init>> };

const DataServiceContext = React.createContext<T>({
  // @ts-ignore
  dataService: null,
});
