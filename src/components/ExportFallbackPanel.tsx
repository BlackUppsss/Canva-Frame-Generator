import { Button, Rows, Text } from "@canva/app-ui-kit";
import { copySvgToClipboard, downloadSvg } from "src/lib/export-svg";
import { downloadPdf } from "src/lib/export-pdf";
import type { FrameCandidate } from "src/lib/types";
type ExportFallbackPanelProps = {
    candidate?: FrameCandidate;
    onStatus: (message: string) => void;
    onError: (message: string) => void;
};
export function ExportFallbackPanel({ candidate, onStatus, onError }: ExportFallbackPanelProps) {
    const svg = candidate?.optimizedSvg ?? candidate?.normalizedSvg;
    const baseName = candidate?.originalFileName.replace(/\.[^.]+$/, "") || "canva-frame-generator";
    return (<Rows spacing="1u">
      <Text variant="bold">Fallback export</Text>
      <Text size="small" tone="tertiary">
        If native Canva frame mode is unavailable, download the generated SVG or PDF.
      </Text>
      <Button disabled={!svg} variant="secondary" onClick={() => svg && downloadSvg(svg, `${baseName}.svg`)} stretch>
        Download SVG
      </Button>
      <Button disabled={!svg} variant="secondary" onClick={() => svg && downloadPdf(svg, `${baseName}.pdf`)} stretch>
        Download PDF
      </Button>
      <Button disabled={!svg} variant="secondary" onClick={async () => {
            try {
                if (svg) {
                    await copySvgToClipboard(svg);
                    onStatus("SVG code copied to clipboard.");
                }
            }
            catch {
                onError("Unable to copy SVG code to clipboard.");
            }
        }} stretch>
        Copy SVG code
      </Button>
    </Rows>);
}
