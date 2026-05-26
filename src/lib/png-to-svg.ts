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

function isVisibleForegroundPath(path: SVGPathElement): boolean {
    const opacity = Number.parseFloat(path.getAttribute("opacity") ?? "1");
    const fill = path.getAttribute("fill") ?? "";
    return opacity > 0 && !fill.includes("rgb(0,0,0)") && !fill.includes("rgb(0, 0, 0)");
}

function cleanTracedSvg(svg: string): string {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    Array.from(doc.querySelectorAll("path")).forEach((path) => {
        if (!isVisibleForegroundPath(path)) {
            path.remove();
            return;
        }
        path.setAttribute("fill", "#ffffff");
        path.setAttribute("stroke", "#ffffff");
        path.setAttribute("opacity", "1");
    });
    return new XMLSerializer().serializeToString(doc.documentElement);
}

function extractPathData(svg: string): string[] {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    return Array.from(doc.querySelectorAll("path"))
        .filter(isVisibleForegroundPath)
        .map((path) => path.getAttribute("d"))
        .filter((path): path is string => Boolean(path));
}

function getPixelIndex(x: number, y: number, width: number): number {
    return y * width + x;
}

function getColorDistance(data: Uint8ClampedArray, firstPixelIndex: number, secondPixelIndex: number): number {
    const firstDataIndex = firstPixelIndex * 4;
    const secondDataIndex = secondPixelIndex * 4;
    const redDiff = (data[firstDataIndex] ?? 0) - (data[secondDataIndex] ?? 0);
    const greenDiff = (data[firstDataIndex + 1] ?? 0) - (data[secondDataIndex + 1] ?? 0);
    const blueDiff = (data[firstDataIndex + 2] ?? 0) - (data[secondDataIndex + 2] ?? 0);
    const alphaDiff = (data[firstDataIndex + 3] ?? 255) - (data[secondDataIndex + 3] ?? 255);
    return Math.sqrt(redDiff * redDiff + greenDiff * greenDiff + blueDiff * blueDiff + alphaDiff * alphaDiff);
}

function findBackgroundMask(imageData: ImageData, tolerance: number): Uint8Array {
    const { data, width, height } = imageData;
    const background = new Uint8Array(width * height);
    const queue: number[] = [];
    const enqueue = (x: number, y: number, seedPixelIndex: number) => {
        const pixelIndex = getPixelIndex(x, y, width);
        if (background[pixelIndex]) {
            return;
        }
        if (getColorDistance(data, pixelIndex, seedPixelIndex) > tolerance) {
            return;
        }
        background[pixelIndex] = 1;
        queue.push(pixelIndex);
    };
    for (let x = 0; x < width; x += 1) {
        enqueue(x, 0, getPixelIndex(x, 0, width));
        enqueue(x, height - 1, getPixelIndex(x, height - 1, width));
    }
    for (let y = 0; y < height; y += 1) {
        enqueue(0, y, getPixelIndex(0, y, width));
        enqueue(width - 1, y, getPixelIndex(width - 1, y, width));
    }
    for (let readIndex = 0; readIndex < queue.length; readIndex += 1) {
        const pixelIndex = queue[readIndex] as number;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        const neighbors: Array<[number, number]> = [
            [x - 1, y],
            [x + 1, y],
            [x, y - 1],
            [x, y + 1],
        ];
        for (const [neighborX, neighborY] of neighbors) {
            if (neighborX < 0 || neighborY < 0 || neighborX >= width || neighborY >= height) {
                continue;
            }
            enqueue(neighborX, neighborY, pixelIndex);
        }
    }
    return background;
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
    const backgroundMask = findBackgroundMask(imageData, settings.threshold);
    for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
            const pixelIndex = getPixelIndex(x, y, canvas.width);
            const dataIndex = pixelIndex * 4;
            const isForeground = settings.invertMask ? backgroundMask[pixelIndex] === 1 : backgroundMask[pixelIndex] === 0;
            const value = isForeground ? 255 : 0;
            imageData.data[dataIndex] = value;
            imageData.data[dataIndex + 1] = value;
            imageData.data[dataIndex + 2] = value;
            imageData.data[dataIndex + 3] = isForeground ? 255 : 0;
        }
    }
    const imageTracer = require("imagetracerjs") as ImageTracerLike;
    const tracedSvg = imageTracer.imagedataToSVG(imageData, {
        ltres: settings.smoothness,
        qtres: settings.smoothness,
        pathomit: 8,
        colorsampling: 0,
        numberofcolors: 2,
        mincolorratio: 0,
        colorquantcycles: 3,
        scale: 1,
    });
    const svg = cleanTracedSvg(tracedSvg);
    return {
        svg,
        pathData: extractPathData(svg),
        viewBox: `0 0 ${canvas.width} ${canvas.height}`,
        width: canvas.width,
        height: canvas.height,
    };
}
