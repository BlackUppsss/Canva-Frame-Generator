import type { DataConnectorIntent, RenderSelectionUiRequest, GetDataTableRequest, GetDataTableResponse, } from "@canva/intents/data";
import { prepareDataConnector } from "@canva/intents/data";
import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import { SelectionUI } from "./selection_ui";
import "@canva/app-ui-kit/styles.css";
import { getRealEstateData } from "./data";
async function getDataTable(request: GetDataTableRequest): Promise<GetDataTableResponse> {
    try {
        const dataTable = await getRealEstateData(request);
        return {
            status: "completed",
            dataTable,
            metadata: {
                description: "Sydney construction project sales in each release stage",
                providerInfo: { name: "Demo Sales API" },
            },
        };
    }
    catch {
        return {
            status: "app_error",
            message: "Failed to process data request",
        };
    }
}
async function renderSelectionUi(request: RenderSelectionUiRequest) {
    const root = createRoot(document.getElementById("root") as Element);
    root.render(<AppUiProvider>
      <SelectionUI {...request}/>
    </AppUiProvider>);
}
const dataConnector: DataConnectorIntent = {
    getDataTable,
    renderSelectionUi,
};
prepareDataConnector(dataConnector);
