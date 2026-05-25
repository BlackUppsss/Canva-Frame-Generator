import type { ContentPublisherIntent, GetPublishConfigurationResponse, PublishContentRequest, PublishContentResponse, RenderPreviewUiRequest, RenderSettingsUiRequest, } from "@canva/intents/content";
import { prepareContentPublisher } from "@canva/intents/content";
import { createRoot } from "react-dom/client";
import "@canva/app-ui-kit/styles.css";
import { AppUiProvider } from "@canva/app-ui-kit";
import { AppI18nProvider, initIntl } from "@canva/app-i18n-kit";
import { PreviewUi } from "./preview_ui";
import { SettingUi } from "./setting_ui";
const intl = initIntl();
function renderSettingsUi(request: RenderSettingsUiRequest) {
    const root = createRoot(document.getElementById("root") as Element);
    root.render(<AppI18nProvider>
      <AppUiProvider>
        <SettingUi {...request}/>
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
        externalUrl: "https://example.com/posts/1234567890",
    };
}
const contentPublisher: ContentPublisherIntent = {
    renderSettingsUi,
    renderPreviewUi,
    getPublishConfiguration,
    publishContent,
};
prepareContentPublisher(contentPublisher);
