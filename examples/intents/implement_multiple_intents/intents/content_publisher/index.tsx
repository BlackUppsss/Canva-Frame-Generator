import type { ContentPublisherIntent, GetPublishConfigurationResponse, PublishContentRequest, PublishContentResponse, RenderPreviewUiRequest, RenderSettingsUiRequest, } from "@canva/intents/content";
import { createRoot } from "react-dom/client";
import "@canva/app-ui-kit/styles.css";
import { AppUiProvider, Box, Button } from "@canva/app-ui-kit";
import { Rows, Text } from "@canva/app-ui-kit";
import * as styles from "styles/components.css";
import { requestOpenExternalUrl } from "@canva/platform";
async function getPublishConfiguration(): Promise<GetPublishConfigurationResponse> {
    return {
        status: "completed",
        outputTypes: [
            {
                id: "post",
                displayName: "Output type: Post",
                mediaSlots: [
                    {
                        id: "media",
                        displayName: "Media",
                        fileCount: { exact: 1 },
                        accepts: {
                            image: {
                                format: "png",
                                aspectRatio: { min: 4 / 5, max: 1.91 / 1 },
                            },
                        },
                    },
                ],
            },
        ],
    };
}
function renderSettingsUi(request: RenderSettingsUiRequest) {
    const root = createRoot(document.getElementById("root") as Element);
    const openDocs = async () => {
        await requestOpenExternalUrl({
            url: "https://www.canva.dev/docs/apps/content-publisher/",
        });
    };
    root.render(<AppUiProvider>
      <div className={styles.scrollContainer}>
        <Rows spacing="2u">
          <Text>
            This is the content publisher intent portion of the app. Here you
            would render an interface for controlling the publishing settings.
          </Text>
          <Button variant="primary" onClick={openDocs}>
            Open Content Publisher Intent docs
          </Button>
        </Rows>
      </div>
    </AppUiProvider>);
}
function renderPreviewUi(request: RenderPreviewUiRequest) {
    const root = createRoot(document.getElementById("root") as Element);
    const previewWidth = 400 + 32 + 2;
    root.render(<AppUiProvider>
      <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" width="full" height="full">
        <div style={{ width: previewWidth }}>
          <Box display="flex" alignItems="center" justifyContent="center" background="surface" borderRadius="large" padding="2u" border="standard">
            <Rows spacing="2u">
              <Text>
                This is the content publisher intent portion of the app. Here
                you would render a preview for visualizing how the design would
                appear in the publishing platform.
              </Text>
            </Rows>
          </Box>
        </div>
      </Box>
    </AppUiProvider>);
}
async function publishContent(request: PublishContentRequest): Promise<PublishContentResponse> {
    return {
        status: "completed",
        externalId: "1234567890",
        externalUrl: "https://example.com/posts/1234567890",
    };
}
const contentPublisher: ContentPublisherIntent = {
    renderSettingsUi,
    renderPreviewUi,
    getPublishConfiguration,
    publishContent,
};
export default contentPublisher;
