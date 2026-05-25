import type { DataConnectorIntent, GetDataTableRequest, GetDataTableResponse, RenderSelectionUiRequest, } from "@canva/intents/data";
import { createRoot } from "react-dom/client";
import { AppUiProvider, Rows, Text } from "@canva/app-ui-kit";
import * as styles from "styles/components.css";
async function getDataTable(request: GetDataTableRequest): Promise<GetDataTableResponse> {
    const { signal } = request;
    if (signal.aborted) {
        return {
            status: "app_error",
            message: "The data fetch operation was cancelled.",
        };
    }
    return {
        status: "completed",
        dataTable: {
            rows: [{ cells: [{ type: "string", value: "Fetched data" }] }],
        },
    };
}
async function renderSelectionUi(request: RenderSelectionUiRequest): Promise<void> {
    const root = createRoot(document.getElementById("root") as Element);
    root.render(<AppUiProvider>
      <div className={styles.scrollContainer}>
        <Rows spacing="2u">
          <Text>
            This is the data connector intent portion of the app. Here you would
            render an interface for controlling the data table.
          </Text>
        </Rows>
      </div>
    </AppUiProvider>);
}
const dataConnector: DataConnectorIntent = {
    getDataTable,
    renderSelectionUi,
};
export default dataConnector;
