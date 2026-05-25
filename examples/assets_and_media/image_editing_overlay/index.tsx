import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import "@canva/app-ui-kit/styles.css";
import { App } from "./app";
import type { DesignEditorIntent } from "@canva/intents/design";
import { prepareDesignEditor } from "@canva/intents/design";
async function render() {
    const root = createRoot(document.getElementById("root") as Element);
    root.render(<AppUiProvider>
      <App />
    </AppUiProvider>);
}
const designEditor: DesignEditorIntent = { render };
prepareDesignEditor(designEditor);
if (module.hot) {
    module.hot.accept("./app", render);
}
