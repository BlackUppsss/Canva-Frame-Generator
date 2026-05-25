import { prepareDesignEditor } from "@canva/intents/design";
import designEditor, { render } from "./intents/design_editor";
if (document.getElementById("root")) {
    render();
}
try {
    prepareDesignEditor(designEditor);
}
catch {
}
