import "@canva/app-ui-kit/styles.css";
import { AppI18nProvider, initIntl } from "@canva/app-i18n-kit";
import { AppUiProvider } from "@canva/app-ui-kit";
import type { ContentPublisherIntent, GetPublishConfigurationResponse, PublishContentRequest, PublishContentResponse, RenderPreviewUiRequest, RenderSettingsUiRequest, } from "@canva/intents/content";
import { createRoot } from "react-dom/client";
import { SettingUi } from "./setting_ui";
import { PreviewUi } from "./preview_ui";
const intl = initIntl();
async function getPublishConfiguration(): Promise<GetPublishConfigurationResponse> {
    return {
        status: "completed",
        outputTypes: [
            {
                id: "listing",
                displayName: intl.formatMessage({
                    defaultMessage: "Listing Post",
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
async function publishContent(_request: PublishContentRequest): Promise<PublishContentResponse> {
    return {
        status: "completed",
        externalId: `listing-${Date.now()}`,
        externalUrl: "https://example.com/listings/published",
    };
}
const contentPublisher: ContentPublisherIntent = {
    renderSettingsUi,
    renderPreviewUi,
    getPublishConfiguration,
    publishContent,
};
export default contentPublisher;
if (module.hot) {
    module.hot.accept(["./setting_ui", "./preview_ui"]);
}
