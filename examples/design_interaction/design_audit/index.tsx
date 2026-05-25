import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import { App } from "./app";
import "@canva/app-ui-kit/styles.css";
function render() {
    const root = createRoot(document.getElementById("root") as Element);
    root.render(<AppUiProvider>
      <App />
    </AppUiProvider>);
}
render();
if (module.hot) {
    module.hot.accept("./app", render);
}
