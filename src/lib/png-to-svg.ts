import type { TraceResult, TraceSettings } from "./types";
type ImageTracerLike = {
    imagedataToSVG: (imageData: ImageData, options?: Record<string, unknown>) => string;
};
declare const require: (name: string) => unknown;
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
function extractPathData(svg: string): string[] {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    return Array.from(doc.querySelectorAll("path"))
        .map((path) => path.getAttribute("d"))
        .filter((path): path is string => Boolean(path));
}
export async function tracePngToSvg(file: File, settings: TraceSettings): Promise<TraceResult> {
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
    for (let i = 0; i < imageData.data.length; i += 4) {
        const red = imageData.data[i] ?? 0;
        const green = imageData.data[i + 1] ?? 0;
        const blue = imageData.data[i + 2] ?? 0;
        const alpha = imageData.data[i + 3] ?? 255;
        const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
        const maskValue = alpha < 255 ? Math.min(alpha, luminance) : luminance;
        const value = settings.invertMask ? 255 - maskValue : maskValue;
        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = value >= settings.threshold ? 255 : 0;
    }
    const imageTracer = require("imagetracerjs") as ImageTracerLike;
    const svg = imageTracer.imagedataToSVG(imageData, {
        ltres: settings.smoothness,
        qtres: settings.smoothness,
        pathomit: 8,
        colorsampling: 0,
        numberofcolors: 2,
        mincolorratio: 0,
        colorquantcycles: 3,
        scale: 1,
    });
    return {
        svg,
        pathData: extractPathData(svg),
        viewBox: `0 0 ${canvas.width} ${canvas.height}`,
        width: canvas.width,
        height: canvas.height,
    };
}
