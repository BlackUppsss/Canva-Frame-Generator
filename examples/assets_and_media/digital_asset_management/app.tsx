import { SearchableListView } from "@canva/app-components";
import { Box } from "@canva/app-ui-kit";
import "@canva/app-ui-kit/styles.css";
import { useConfig } from "./config";
import { findResources } from "./adapter";
import * as styles from "./index.css";
export function App() {
    const config = useConfig();
    return (<Box className={styles.rootWrapper} height="full">
      
      <SearchableListView config={config} findResources={findResources} saveExportedDesign={(exportedDesignUrl: string, containerId: string | undefined, designTitle: string | undefined) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.info(`Saving file "${designTitle}" from ${exportedDesignUrl} to ${config.serviceName} container id: ${containerId}`);
                    resolve({ success: true });
                }, 1000);
            });
        }}/>
    </Box>);
}
