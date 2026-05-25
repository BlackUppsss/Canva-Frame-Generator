import type { GetDataTableRequest, GetDataTableResponse, } from "@canva/intents/data";
import { appError, completeDataTable, outdatedSourceRef, remoteRequestFailed, } from "src/utils/fetch_result";
import { DATA_SOURCES } from "./data_sources/collection";
import { DataAPIError } from "./data_source";
export const buildDataTableResult = async (request: GetDataTableRequest, authToken?: string): Promise<GetDataTableResponse> => {
    const source = JSON.parse(request.dataSourceRef.source);
    const rowLimit = request.limit.row - 1;
    const dataHandler = DATA_SOURCES.find((handler) => handler.matchSource(source));
    if (!dataHandler) {
        return outdatedSourceRef();
    }
    try {
        const dataTable = await dataHandler.fetchAndBuildTable(source, authToken || "", rowLimit, request.signal);
        if (dataTable.rows.length === 0) {
            return appError("No results found.");
        }
        return completeDataTable(dataTable);
    }
    catch (error) {
        if (error instanceof DataAPIError) {
            return remoteRequestFailed();
        }
        return appError(error instanceof Error ? error.message : "An unknown error occurred");
    }
};
