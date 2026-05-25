import "@canva/app-ui-kit/styles.css";
import { AppI18nProvider } from "@canva/app-i18n-kit";
import { AppUiProvider } from "@canva/app-ui-kit";
import type { DataConnectorIntent, GetDataTableRequest, GetDataTableResponse, RenderSelectionUiRequest, } from "@canva/intents/data";
import { createRoot } from "react-dom/client";
import { SelectionUi } from "./selection_ui";
import { getListingsDataTable } from "./data_table";
async function getDataTable(request: GetDataTableRequest): Promise<GetDataTableResponse> {
    const { signal } = request;
    if (signal.aborted) {
        return {
            status: "app_error",
            message: "The data fetch operation was cancelled.",
        };
    }
    try {
        const dataTable = getListingsDataTable(request);
        return {
            status: "completed",
            dataTable,
            metadata: {
                description: "Real estate property listings",
                providerInfo: { name: "Real Estate MLS" },
            },
        };
    }
    catch {
        return {
            status: "app_error",
            message: "Failed to fetch listing data.",
        };
    }
}
async function renderSelectionUi(request: RenderSelectionUiRequest) {
    const root = createRoot(document.getElementById("root") as Element);
    root.render(<AppI18nProvider>
      <AppUiProvider>
        <SelectionUi {...request}/>
      </AppUiProvider>
    </AppI18nProvider>);
}
const dataConnector: DataConnectorIntent = {
    getDataTable,
    renderSelectionUi,
};
export default dataConnector;
if (module.hot) {
    module.hot.accept("./selection_ui");
}
