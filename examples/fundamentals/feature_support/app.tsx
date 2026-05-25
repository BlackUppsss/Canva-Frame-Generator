import { addElementAtPoint, addPage } from "@canva/design";
import { useState } from "react";
import * as styles from "styles/components.css";
import { useFeatureSupport } from "@canva/app-hooks";
import { HomePage } from "./home";
import { InteractionPage } from "./interaction";
type AppPage = "home" | "interaction";
export const App = () => {
    const [appPage, setAppPage] = useState<AppPage>("home");
    const isSupported = useFeatureSupport();
    const isInteractionSupported = isSupported(addElementAtPoint, addPage);
    const renderPage = (page: AppPage) => {
        switch (page) {
            case "home":
                return (<HomePage enterInteractionPage={() => setAppPage("interaction")}/>);
            case "interaction":
                return (<InteractionPage goBack={() => setAppPage("home")} isInteractionSupported={isInteractionSupported}/>);
            default:
                return;
        }
    };
    return <div className={styles.scrollContainer}>{renderPage(appPage)}</div>;
};
