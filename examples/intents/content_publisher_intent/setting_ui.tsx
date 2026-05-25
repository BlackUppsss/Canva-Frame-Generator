import type { PublishSettingsSettingsUiContext, RenderSettingsUiRequest, } from "@canva/intents/content";
import { FormField, Rows, Text, TextInput } from "@canva/app-ui-kit";
import { useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import * as styles from "styles/components.css";
import type { PublishSettings } from "./types";
import { parsePublishSettings } from "./types";
export const SettingUi = ({ invocationContext, updatePublishSettings, registerOnContextChange, }: RenderSettingsUiRequest) => {
    const intl = useIntl();
    const [settings, setSettings] = useState<PublishSettings>(parsePublishSettings(invocationContext?.publishRef) ??
        ({ caption: "" } as PublishSettings));
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
    const setAndPropagateSettings = useCallback((updatedSettings: PublishSettings) => {
        setSettings(updatedSettings);
        updatePublishSettings({
            publishRef: JSON.stringify(updatedSettings),
            validityState: validatePublishRef(updatedSettings),
        });
    }, [updatePublishSettings]);
    return (<div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>{settingsUiContext?.outputType.displayName}</Text>
        <FormField label={intl.formatMessage({
            defaultMessage: "Caption",
            description: "Label for the caption input field in publish settings",
        })} control={(props) => (<TextInput {...props} value={settings.caption} onChange={(caption) => setAndPropagateSettings({ ...settings, caption })}/>)}/>
      </Rows>
    </div>);
};
const validatePublishRef = (publishRef: PublishSettings) => {
    if (publishRef.caption.length === 0) {
        return "invalid_missing_required_fields";
    }
    return "valid";
};
