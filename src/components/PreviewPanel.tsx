import { Button, Rows, Text } from "@canva/app-ui-kit";
import { useState } from "react";
import type { FrameCandidate } from "src/lib/types";
import * as styles from "styles/components.css";
type PreviewPanelProps = {
    originalPreviewUrl?: string;
    candidate?: FrameCandidate;
};
export function PreviewPanel({ originalPreviewUrl, candidate }: PreviewPanelProps) {
    const [mode, setMode] = useState<"original" | "converted">("converted");
    const previewSvg = candidate?.optimizedSvg ?? candidate?.normalizedSvg;
    return (<Rows spacing="1u">
      <Text variant="bold">Preview the generated shape.</Text>
      <div className={styles.previewToolbar}>
        <Button variant={mode === "original" ? "primary" : "secondary"} onClick={() => setMode("original")}>
          Original
        </Button>
        <Button variant={mode === "converted" ? "primary" : "secondary"} onClick={() => setMode("converted")}>
          Converted
        </Button>
      </div>
      <div className={styles.previewBox}>
        {mode === "original" && originalPreviewUrl && (<img className={styles.previewMedia} src={originalPreviewUrl} alt="Original upload preview"/>)}
        {mode === "converted" && previewSvg && (<div className={styles.previewMedia} dangerouslySetInnerHTML={{ __html: previewSvg }}/>)}
        {!originalPreviewUrl && !previewSvg && (<Text size="small" tone="tertiary">Upload a file to see the preview.</Text>)}
      </div>
    </Rows>);
}
