import { useAppContext } from "src/context/use_app_context";
export const DataSourceConfig = () => {
    const { dataSourceHandler } = useAppContext();
    if (!dataSourceHandler) {
        return undefined;
    }
    return dataSourceHandler.configPage(dataSourceHandler.sourceConfig);
};
