import { Rows, Select, Text } from "@canva/app-ui-kit";
import type { OutputModeSetting, TraceSettings } from "src/lib/types";
type SettingsPanelProps = {
    settings: TraceSettings;
    onChange: (settings: TraceSettings) => void;
};
export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
    return (<Rows spacing="1u">
      <Text variant="bold">Settings</Text>
      <label>
        <Text size="small">Background tolerance: {settings.threshold}</Text>
        <input type="range" min="1" max="255" value={settings.threshold} onChange={(event) => onChange({ ...settings, threshold: Number(event.target.value) })}/>
      </label>
      <label>
        <Text size="small">Smoothness: {settings.smoothness}</Text>
        <input type="range" min="0.1" max="5" step="0.1" value={settings.smoothness} onChange={(event) => onChange({ ...settings, smoothness: Number(event.target.value) })}/>
      </label>
      <label>
        <input type="checkbox" checked={settings.invertMask} onChange={(event) => onChange({ ...settings, invertMask: event.target.checked })}/>{" "}
        <Text size="small">Use background as frame</Text>
      </label>
      <Select value={settings.outputMode} onChange={(value) => onChange({ ...settings, outputMode: value as OutputModeSetting })} options={[
            { value: "auto", label: "Auto" },
            { value: "vector", label: "Vector" },
            { value: "pdf-fallback", label: "PDF fallback" },
        ]}/>
    </Rows>);
}
