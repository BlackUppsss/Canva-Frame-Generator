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

function isTransparentPath(path: SVGPathElement): boolean {
    const opacity = Number.parseFloat(path.getAttribute("opacity") ?? "1");
    return opacity <= 0;
}

function isTracerBackgroundPath(path: SVGPathElement): boolean {
    const fill = path.getAttribute("fill") ?? "";
    return fill.includes("rgb(0,0,0)") || fill.includes("rgb(0, 0, 0)");
}

function isVisibleForegroundPath(path: SVGPathElement): boolean {
    return !isTransparentPath(path) && !isTracerBackgroundPath(path);
}

function cleanTracedSvg(svg: string): string {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    Array.from(doc.querySelectorAll("path")).forEach((path) => {
        if (!isVisibleForegroundPath(path)) {
            path.remove();
            return;
        }
        path.setAttribute("fill", "#000000");
        path.setAttribute("stroke", "#000000");
        path.setAttribute("opacity", "1");
    });
    return new XMLSerializer().serializeToString(doc.documentElement);
}

function extractPathData(svg: string): string[] {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    return Array.from(doc.querySelectorAll("path"))
        .filter((path) => !isTransparentPath(path))
        .map((path) => path.getAttribute("d"))
        .filter((path): path is string => Boolean(path));
}

function getPixelIndex(x: number, y: number, width: number): number {
    return y * width + x;
}

function isDarkOutlinePixel(data: Uint8ClampedArray, pixelIndex: number): boolean {
    const dataIndex = pixelIndex * 4;
    const red = data[dataIndex] ?? 255;
    const green = data[dataIndex + 1] ?? 255;
    const blue = data[dataIndex + 2] ?? 255;
    const alpha = data[dataIndex + 3] ?? 255;
    const luminance = 0.299 * red + 0.587 * green + 0.114 * blue;
    return alpha > 32 && luminance < 170;
}

function dilateMask(mask: Uint8Array, width: number, height: number, radius: number): Uint8Array {
    let current = mask;
    for (let iteration = 0; iteration < radius; iteration += 1) {
        const next = new Uint8Array(current);
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const pixelIndex = getPixelIndex(x, y, width);
                if (!current[pixelIndex]) {
                    continue;
                }
                for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
                    for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
                        const neighborX = x + offsetX;
                        const neighborY = y + offsetY;
                        if (neighborX < 0 || neighborY < 0 || neighborX >= width || neighborY >= height) {
                            continue;
                        }
                        next[getPixelIndex(neighborX, neighborY, width)] = 1;
                    }
                }
            }
        }
        current = next;
    }
    return current;
}

function findOutsideMask(wallMask: Uint8Array, width: number, height: number): Uint8Array {
    const outside = new Uint8Array(width * height);
    const queue: number[] = [];
    const enqueue = (x: number, y: number) => {
        const pixelIndex = getPixelIndex(x, y, width);
        if (outside[pixelIndex] || wallMask[pixelIndex]) {
            return;
        }
        outside[pixelIndex] = 1;
        queue.push(pixelIndex);
    };
    for (let x = 0; x < width; x += 1) {
        enqueue(x, 0);
        enqueue(x, height - 1);
    }
    for (let y = 0; y < height; y += 1) {
        enqueue(0, y);
        enqueue(width - 1, y);
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
            enqueue(neighborX, neighborY);
        }
    }
    return outside;
}

function buildClosedPuzzleMask(imageData: ImageData, closeRadius: number): Uint8Array {
    const { data, width, height } = imageData;
    const outline = new Uint8Array(width * height);
    for (let pixelIndex = 0; pixelIndex < outline.length; pixelIndex += 1) {
        outline[pixelIndex] = isDarkOutlinePixel(data, pixelIndex) ? 1 : 0;
    }
    const wallMask = dilateMask(outline, width, height, closeRadius);
    const outsideMask = findOutsideMask(wallMask, width, height);
    const shapeMask = new Uint8Array(width * height);
    for (let pixelIndex = 0; pixelIndex < shapeMask.length; pixelIndex += 1) {
        shapeMask[pixelIndex] = outsideMask[pixelIndex] ? 0 : 1;
    }
    return shapeMask;
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
    const closeRadius = Math.max(2, Math.min(18, Math.round(settings.threshold / 4)));
    const shapeMask = buildClosedPuzzleMask(imageData, closeRadius);
    for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
            const pixelIndex = getPixelIndex(x, y, canvas.width);
            const dataIndex = pixelIndex * 4;
            const isShape = settings.invertMask ? !shapeMask[pixelIndex] : Boolean(shapeMask[pixelIndex]);
            imageData.data[dataIndex] = isShape ? 255 : 0;
            imageData.data[dataIndex + 1] = isShape ? 255 : 0;
            imageData.data[dataIndex + 2] = isShape ? 255 : 0;
            imageData.data[dataIndex + 3] = isShape ? 255 : 0;
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
