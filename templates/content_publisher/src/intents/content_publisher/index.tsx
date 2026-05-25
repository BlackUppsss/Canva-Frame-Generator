import { AppI18nProvider, initIntl } from "@canva/app-i18n-kit";
import { AppUiProvider } from "@canva/app-ui-kit";
import type { ContentPublisherIntent, GetPublishConfigurationResponse, PublishContentRequest, PublishContentResponse, RenderPreviewUiRequest, RenderSettingsUiRequest, } from "@canva/intents/content";
import { createRoot } from "react-dom/client";
import "@canva/app-ui-kit/styles.css";
import { PreviewUi } from "./preview_ui";
import { SettingsUi } from "./settings_ui";
const intl = initIntl();
function renderSettingsUi(request: RenderSettingsUiRequest) {
    const root = createRoot(document.getElementById("root") as Element);
    root.render(<AppI18nProvider>
      <AppUiProvider>
        <SettingsUi {...request}/>
      </AppUiProvider>
    </AppI18nProvider>);
}
function renderPreviewUi(request: RenderPreviewUiRequest) {
    const root = createRoot(document.getElementById("root") as Element);
    root.render(<AppI18nProvider>
      <AppUiProvider>
        <PreviewUi {...request}/>
      </AppUiProvider>
    </AppI18nProvider>);
}
async function getPublishConfiguration(): Promise<GetPublishConfigurationResponse> {
    return {
        status: "completed",
        outputTypes: [
            {
                id: "post",
                displayName: intl.formatMessage({
                    defaultMessage: "Feed Post",
                    description: "Label for publishing format shown in the output type dropdown",
                }),
                mediaSlots: [
                    {
                        id: "media",
                        displayName: intl.formatMessage({
                            defaultMessage: "Media",
                            description: "Label for the media upload slot",
                        }),
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
async function publishContent(request: PublishContentRequest): Promise<PublishContentResponse> {
    return {
        status: "completed",
        externalId: "1234567890",
        externalUrl: "todo_update_with_your_url",
    };
}
const contentPublisher: ContentPublisherIntent = {
    renderSettingsUi,
    renderPreviewUi,
    getPublishConfiguration,
    publishContent,
};
export default contentPublisher;
