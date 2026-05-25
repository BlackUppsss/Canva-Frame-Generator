import type { PngAnalysisResult } from "./types";
import { WARNING_MESSAGES } from "src/constants/errors";
function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const url = URL.createObjectURL(file);
        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Unable to load PNG image."));
        };
        image.src = url;
    });
}
export async function analyzePngTransparency(file: File): Promise<PngAnalysisResult> {
    const image = await loadImageFromFile(file);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
        throw new Error("Canvas is not available in this browser.");
    }
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const totalPixels = imageData.data.length / 4;
    let transparentPixels = 0;
    let hasAlpha = false;
    for (let i = 3; i < imageData.data.length; i += 4) {
        const alpha = imageData.data[i] ?? 255;
        if (alpha < 255) {
            hasAlpha = true;
        }
        if (alpha < 16) {
            transparentPixels += 1;
        }
    }
    const transparentRatio = totalPixels === 0 ? 0 : transparentPixels / totalPixels;
    const warning = !hasAlpha
        ? "This PNG has no transparent area. Please upload a transparent PNG."
        : transparentRatio < 0.02
            ? WARNING_MESSAGES.lowTransparency
            : undefined;
    return {
        hasAlpha,
        transparentRatio,
        width: canvas.width,
        height: canvas.height,
        isSuitableForTracing: hasAlpha && transparentRatio >= 0.02,
        warning,
    };
}
