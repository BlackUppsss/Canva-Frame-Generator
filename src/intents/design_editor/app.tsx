import { Rows, Text, Title, Box } from "@canva/app-ui-kit";
import { useState } from "react";
import * as styles from "styles/components.css";
import { FileDropzone } from "src/components/FileDropzone";
import { PreviewPanel } from "src/components/PreviewPanel";
import { SettingsPanel } from "src/components/SettingsPanel";
import { InsertButton } from "src/components/InsertButton";
import { ExportFallbackPanel } from "src/components/ExportFallbackPanel";
import { ErrorMessage } from "src/components/ErrorMessage";
import type { FrameCandidate, TraceSettings, ProcessingStatus } from "src/lib/types";
import { parseSvg } from "src/lib/svg-parser";
import { analyzePngTransparency } from "src/lib/png-analyzer";
import { tracePngToSvg } from "src/lib/png-to-svg";
import { optimizeSvg } from "src/lib/optimize-svg";
export const App = () => {
    const [file, setFile] = useState<File>();
    const [candidate, setCandidate] = useState<FrameCandidate>();
    const [status, setStatus] = useState<ProcessingStatus>("idle");
    const [errorMessage, setErrorMessage] = useState<string>();
    const [statusMessage, setStatusMessage] = useState<string>();
    const [settings, setSettings] = useState<TraceSettings>({
        threshold: 220,
        smoothness: 1,
        invertMask: false,
        outputMode: "auto",
    });
    const clearMessages = () => {
        setErrorMessage(undefined);
        setStatusMessage(undefined);
    };
    const processFile = async (inputFile: File, currentSettings: TraceSettings) => {
        clearMessages();
        setStatus("loading");
        try {
            let resultCandidate: FrameCandidate;
            const originalPreviewUrl = URL.createObjectURL(inputFile);
            if (inputFile.type === "image/svg+xml" || inputFile.name.toLowerCase().endsWith(".svg")) {
                const text = await inputFile.text();
                const parsed = parseSvg(text);
                const optimized = await optimizeSvg(parsed.normalizedSvg);
                if (parsed.warnings.length > 0) {
                    setErrorMessage(parsed.warnings.join(" "));
                }
                resultCandidate = {
                    id: Math.random().toString(36).slice(2),
                    sourceType: "svg",
                    originalFileName: inputFile.name,
                    originalPreviewUrl,
                    normalizedSvg: parsed.normalizedSvg,
                    optimizedSvg: optimized,
                    pathData: parsed.paths,
                    viewBox: parsed.viewBox,
                    width: parsed.width ?? 512,
                    height: parsed.height ?? 512,
                    outputMode: currentSettings.outputMode === "auto" ? "native-frame" : currentSettings.outputMode as any,
                    warnings: parsed.warnings,
                };
            }
            else {
                const analysis = await analyzePngTransparency(inputFile);
                if (analysis.warning) {
                    setErrorMessage(analysis.warning);
                }
                const trace = await tracePngToSvg(inputFile, currentSettings);
                const optimized = await optimizeSvg(trace.svg);
                resultCandidate = {
                    id: Math.random().toString(36).slice(2),
                    sourceType: "png",
                    originalFileName: inputFile.name,
                    originalPreviewUrl,
                    normalizedSvg: trace.svg,
                    optimizedSvg: optimized,
                    pathData: trace.pathData,
                    viewBox: trace.viewBox,
                    width: trace.width,
                    height: trace.height,
                    outputMode: currentSettings.outputMode === "auto" ? "native-frame" : currentSettings.outputMode as any,
                    warnings: analysis.warning ? [analysis.warning] : [],
                };
            }
            setCandidate(resultCandidate);
            setStatus("success");
        }
        catch (error) {
            console.error(error);
            setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred during processing.");
            setStatus("error");
        }
    };
    const handleFileAccepted = (acceptedFile: File) => {
        setFile(acceptedFile);
        processFile(acceptedFile, settings);
    };
    const handleSettingsChange = (newSettings: TraceSettings) => {
        setSettings(newSettings);
        if (file) {
            processFile(file, newSettings);
        }
    };
    return (<div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <Box paddingBottom="1u">
          <Title size="medium">Canva Frame Generator</Title>
          <Text size="small" tone="tertiary">
            Convert PNGs and SVGs into Canva frames or vectors.
          </Text>
        </Box>

        <ErrorMessage message={errorMessage}/>
        {statusMessage && (<div style={{ padding: "8px", backgroundColor: "#e8f5e9", borderRadius: "4px", color: "#2e7d32" }}>
            <Text size="small">{statusMessage}</Text>
          </div>)}

        <FileDropzone file={file} onFileAccepted={handleFileAccepted} onError={setErrorMessage}/>

        {status === "loading" && <Text>Processing file...</Text>}

        {candidate && (<>
            <PreviewPanel originalPreviewUrl={candidate.originalPreviewUrl} candidate={candidate}/>

            {candidate.sourceType === "png" && (<SettingsPanel settings={settings} onChange={handleSettingsChange}/>)}

            <InsertButton candidate={candidate} onStatus={(msg) => setStatusMessage(msg)} onError={(msg) => setErrorMessage(msg)}/>

            <ExportFallbackPanel candidate={candidate} onStatus={(msg) => setStatusMessage(msg)} onError={(msg) => setErrorMessage(msg)}/>
          </>)}
      </Rows>
    </div>);
};
