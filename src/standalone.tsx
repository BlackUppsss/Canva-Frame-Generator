import { useState } from "react";
import { createRoot } from "react-dom/client";
import { analyzePngTransparency } from "./lib/png-analyzer";
import { tracePngToSvg } from "./lib/png-to-svg";
import { parseSvg } from "./lib/svg-parser";
import { optimizeSvg } from "./lib/optimize-svg";
import { copySvgToClipboard, downloadSvg } from "./lib/export-svg";
import { downloadPdf } from "./lib/export-pdf";
import type { FrameCandidate, ProcessingStatus, TraceSettings } from "./lib/types";

function App() {
    const [file, setFile] = useState<File>();
    const [candidate, setCandidate] = useState<FrameCandidate>();
    const [status, setStatus] = useState<ProcessingStatus>("idle");
    const [message, setMessage] = useState<string>();
    const [error, setError] = useState<string>();
    const [settings, setSettings] = useState<TraceSettings>({
        threshold: 128,
        smoothness: 1,
        invertMask: false,
        outputMode: "auto",
    });

    async function processFile(inputFile: File, currentSettings = settings) {
        setStatus("loading");
        setMessage(undefined);
        setError(undefined);
        try {
            const originalPreviewUrl = URL.createObjectURL(inputFile);
            let resultCandidate: FrameCandidate;
            if (inputFile.type === "image/svg+xml" || inputFile.name.toLowerCase().endsWith(".svg")) {
                const text = await inputFile.text();
                const parsed = parseSvg(text);
                const optimized = await optimizeSvg(parsed.normalizedSvg);
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
                    outputMode: currentSettings.outputMode === "auto" ? "vector" : currentSettings.outputMode,
                    warnings: parsed.warnings,
                };
                if (parsed.warnings.length) {
                    setMessage(parsed.warnings.join(" "));
                }
            }
            else {
                const analysis = await analyzePngTransparency(inputFile);
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
                    outputMode: currentSettings.outputMode === "auto" ? "vector" : currentSettings.outputMode,
                    warnings: analysis.warning ? [analysis.warning] : [],
                };
                if (analysis.warning) {
                    setMessage(analysis.warning);
                }
            }
            setCandidate(resultCandidate);
            setStatus("success");
        }
        catch (caughtError) {
            setStatus("error");
            setError(caughtError instanceof Error ? caughtError.message : "Failed to process file.");
        }
    }

    function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }
        if (!(selectedFile.type === "image/png" || selectedFile.type === "image/svg+xml" || selectedFile.name.toLowerCase().endsWith(".svg"))) {
            setError("Please upload a PNG or SVG file.");
            return;
        }
        setFile(selectedFile);
        processFile(selectedFile);
    }

    function updateThreshold(value: number) {
        const nextSettings = { ...settings, threshold: value };
        setSettings(nextSettings);
        if (file) {
            processFile(file, nextSettings);
        }
    }

    function updateSmoothness(value: number) {
        const nextSettings = { ...settings, smoothness: value };
        setSettings(nextSettings);
        if (file) {
            processFile(file, nextSettings);
        }
    }

    const svg = candidate?.optimizedSvg || candidate?.normalizedSvg;

    return <main style={{ maxWidth: 920, margin: "0 auto", padding: 24, fontFamily: "Arial, sans-serif", color: "#1f2937" }}>
        <section style={{ marginBottom: 24 }}>
            <h1 style={{ marginBottom: 8 }}>Canva Frame Generator</h1>
            <p style={{ marginTop: 0, color: "#6b7280" }}>Convert PNG or SVG files into downloadable SVG/PDF assets. Canva insertion is available only inside Canva Apps.</p>
        </section>

        <section style={{ border: "2px dashed #d1d5db", borderRadius: 16, padding: 24, marginBottom: 20, background: "#f9fafb" }}>
            <input type="file" accept="image/png,image/svg+xml,.svg" onChange={onFileChange} />
            {file && <p>Selected: <strong>{file.name}</strong></p>}
        </section>

        {candidate?.sourceType === "png" && <section style={{ display: "grid", gap: 12, marginBottom: 20 }}>
            <label>Trace threshold: {settings.threshold}</label>
            <input type="range" min="1" max="255" value={settings.threshold} onChange={(event) => updateThreshold(Number(event.target.value))} />
            <label>Smoothness: {settings.smoothness}</label>
            <input type="range" min="0" max="5" step="0.5" value={settings.smoothness} onChange={(event) => updateSmoothness(Number(event.target.value))} />
        </section>}

        {status === "loading" && <p>Processing file...</p>}
        {message && <p style={{ padding: 12, borderRadius: 8, background: "#ecfdf5", color: "#047857" }}>{message}</p>}
        {error && <p style={{ padding: 12, borderRadius: 8, background: "#fef2f2", color: "#b91c1c" }}>{error}</p>}

        {candidate && svg && <section style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
                <div>
                    <h2>Original</h2>
                    <img src={candidate.originalPreviewUrl} alt="Original preview" style={{ maxWidth: "100%", border: "1px solid #e5e7eb", borderRadius: 12 }} />
                </div>
                <div>
                    <h2>Converted SVG</h2>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16, minHeight: 220 }} dangerouslySetInnerHTML={{ __html: svg }} />
                </div>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => downloadSvg(svg, `${candidate.originalFileName.replace(/\.[^.]+$/, "")}.svg`)}>Download SVG</button>
                <button onClick={() => downloadPdf(svg, `${candidate.originalFileName.replace(/\.[^.]+$/, "")}.pdf`)}>Download PDF</button>
                <button onClick={() => copySvgToClipboard(svg).then(() => setMessage("SVG copied to clipboard."))}>Copy SVG</button>
            </div>
        </section>}
    </main>;
}

const rootElement = document.getElementById("root");
if (rootElement) {
    createRoot(rootElement).render(<App />);
}
