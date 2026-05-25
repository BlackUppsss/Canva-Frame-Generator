import { LoadingIndicator } from "@canva/app-ui-kit";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { APIResponseItem, DataSourceConfig, DataSourceHandler, } from "../../api/data_source";
import { DATA_SOURCES } from "../../api/data_sources/collection";
import { useAppContext } from "../../context/use_app_context";
import { Paths } from "../../routes/paths";
import { isDataRefEmpty, isLaunchedWithError, isOutdatedSource, } from "../../utils/data_params";
const parseDataSource = (source: string) => {
    try {
        return source ? JSON.parse(source) : undefined;
    }
    catch {
        return undefined;
    }
};
export const Entrypoint = () => {
    const navigate = useNavigate();
    const context = useAppContext();
    const { request, setAppError, setDataSourceHandler } = context;
    useEffect(() => {
        let navigateTo: Paths | undefined;
        if (isDataRefEmpty(request)) {
            navigateTo = Paths.DATA_SOURCE_SELECTION;
        }
        else if (isOutdatedSource(request) || isLaunchedWithError(request)) {
            setAppError("The data source configuration needs to be updated.");
            navigateTo = Paths.DATA_SOURCE_SELECTION;
        }
        else {
            const dataRef = request.invocationContext.dataSourceRef;
            const parsedSource = parseDataSource(dataRef?.source ?? "");
            if (parsedSource) {
                const dataHandler = DATA_SOURCES.find((handler) => handler.matchSource(parsedSource));
                if (dataHandler) {
                    setDataSourceHandler(dataHandler as unknown as DataSourceHandler<DataSourceConfig, APIResponseItem>);
                    dataHandler.sourceConfig = parsedSource;
                    navigateTo = Paths.DATA_SOURCE_CONFIG;
                }
            }
        }
        navigate(navigateTo || Paths.DATA_SOURCE_SELECTION);
    }, [request]);
    return <LoadingIndicator />;
};
