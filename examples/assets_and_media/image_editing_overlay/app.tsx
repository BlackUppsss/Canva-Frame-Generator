import { appProcess } from "@canva/platform";
import { ObjectPanel } from "./object_panel";
import { SelectedImageOverlay } from "./overlay";
export const App = () => {
    const context = appProcess.current.getInfo();
    if (context.surface === "object_panel") {
        return <ObjectPanel />;
    }
    if (context.surface === "selected_image_overlay") {
        return <SelectedImageOverlay />;
    }
    throw new Error(`Invalid surface: ${context.surface}`);
};
