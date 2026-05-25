import "@canva/app-ui-kit/styles.css";
import type { DataConnectorIntent, GetDataTableRequest, GetDataTableResponse, RenderSelectionUiRequest, } from "@canva/intents/data";
import { auth } from "@canva/user";
import { createRoot } from "react-dom/client";
import { buildDataTableResult } from "../../api/fetch_data_table";
import { scope } from "../../api/oauth";
import { App } from "./app";
const dataConnector: DataConnectorIntent = {
    getDataTable: async (params: GetDataTableRequest): Promise<GetDataTableResponse> => {
        const oauth = auth.initOauth();
        const token = await oauth.getAccessToken({ scope });
        return buildDataTableResult(params, token?.token);
    },
    renderSelectionUi: async (request: RenderSelectionUiRequest) => {
        function render() {
            const root = createRoot(document.getElementById("root") as Element);
            root.render(<App request={request}/>);
        }
        render();
        if (module.hot) {
            module.hot.accept("./app", render);
            module.hot.accept(["../../api/fetch_data_table", "../../api/oauth"], render);
        }
    },
};
export default dataConnector;
