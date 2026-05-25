import type { PublishSettingsSettingsUiContext, RenderSettingsUiRequest, } from "@canva/intents/content";
import { Box, FormField, MultilineInput, Rows, Scrollable, Text, } from "@canva/app-ui-kit";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import type { PublishSettings } from "./types";
export const SettingUi = ({ updatePublishSettings, registerOnContextChange, }: RenderSettingsUiRequest) => {
    const intl = useIntl();
    const [settings, setSettings] = useState<PublishSettings>({
        caption: "",
    });
    const [settingsUiContext, setSettingsUiContext] = useState<PublishSettingsSettingsUiContext | null>(null);
    useEffect(() => {
        const dispose = registerOnContextChange({
            onContextChange: (context) => {
                if (context.reason !== "publish_settings")
                    return;
                setSettingsUiContext(context);
            },
        });
        return dispose;
    }, [registerOnContextChange]);
    function setAndPropagateSettings(updatedSettings: PublishSettings) {
        setSettings(updatedSettings);
        updatePublishSettings({
            publishRef: JSON.stringify(updatedSettings),
            validityState: validatePublishRef(updatedSettings),
        });
    }
    return (<Scrollable>
      <Box paddingY="2u" paddingEnd="2u">
        <Rows spacing="2u">
          <Text>{settingsUiContext?.outputType.displayName}</Text>
          <FormField label={intl.formatMessage({
            defaultMessage: "Caption",
            description: "Label for the caption input field in publish settings",
        })} control={(props) => (<MultilineInput {...props} value={settings.caption} onChange={(caption) => setAndPropagateSettings({ ...settings, caption })} placeholder={intl.formatMessage({
                defaultMessage: "Write a caption for your listing post...",
                description: "Placeholder text for publish caption input",
            })}/>)}/>
        </Rows>
      </Box>
    </Scrollable>);
};
function validatePublishRef(settings: PublishSettings) {
    if (settings.caption.length === 0) {
        return "invalid_missing_required_fields" as const;
    }
    return "valid" as const;
}
