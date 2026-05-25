import "@canva/app-ui-kit/styles.css";
import type { DesignEditorIntent } from "@canva/intents/design";
import { AppUiProvider } from "@canva/app-ui-kit";
import { createRoot } from "react-dom/client";
import { Button, Rows, Text } from "@canva/app-ui-kit";
import { requestOpenExternalUrl } from "@canva/platform";
import * as styles from "styles/components.css";
async function render() {
    const root = createRoot(document.getElementById("root") as Element);
    const openDocs = async () => {
        await requestOpenExternalUrl({
            url: "https://www.canva.dev/docs/apps/design-editor/",
        });
    };
    root.render(<AppUiProvider>
      <div className={styles.scrollContainer}>
        <Rows spacing="2u">
          <Text>This is the design editor intent portion of the app.</Text>
          <Button variant="primary" onClick={openDocs}>
            Open Design Editor Intent docs
          </Button>
        </Rows>
      </div>
    </AppUiProvider>);
}
const designEditor: DesignEditorIntent = { render };
export default designEditor;
