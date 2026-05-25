import { prepareDesignEditor } from "@canva/intents/design";
import designEditor, { render } from "./intents/design_editor";
prepareDesignEditor(designEditor);
if (document.getElementById("root")) {
    render();
}
