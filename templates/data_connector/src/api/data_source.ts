import type { DataTable } from "@canva/intents/data";
import type { JSX } from "react";
import { type DataTableColumn, toDataTable } from "src/utils/data_table";
export interface DataSourceConfig {
    schema: string;
}
export interface APIResponseItem {
    id: string;
}
export class DataAPIError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "APIError";
    }
}
export class DataSourceHandler<T extends DataSourceConfig, R extends APIResponseItem> {
    schema: string;
    constructor(public sourceConfig: T, public columns: DataTableColumn<R>[], public fetchData: (source: T, authToken: string, rowLimit: number, signal: AbortSignal | undefined) => Promise<R[]>, public selectionPage: () => JSX.Element, public configPage: (sourceConfig: T) => JSX.Element) {
        this.schema = sourceConfig.schema;
    }
    matchSource(source: DataSourceConfig): source is T {
        return source.schema === this.schema;
    }
    async fetchAndBuildTable(source: T, authToken: string, rowLimit: number, signal: AbortSignal | undefined): Promise<DataTable> {
        let apiData: R[];
        try {
            apiData = await this.fetchData(source, authToken || "", rowLimit, signal);
        }
        catch {
            throw new DataAPIError("Failed to fetch data from API");
        }
        return toDataTable(apiData, this.columns, rowLimit);
    }
}
