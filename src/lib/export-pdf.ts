import { jsPDF } from "jspdf";

type SvgSize = {
    width: number;
    height: number;
};

function readSvgSize(svg: string): SvgSize {
    const parser = new DOMParser();
    const document = parser.parseFromString(svg, "image/svg+xml");
    const svgElement = document.querySelector("svg");
    const fallbackSize = 512;
    if (!svgElement) {
        return { width: fallbackSize, height: fallbackSize };
    }
    const width = Number.parseFloat(svgElement.getAttribute("width") ?? "");
    const height = Number.parseFloat(svgElement.getAttribute("height") ?? "");
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        return { width, height };
    }
    const viewBox = svgElement.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number);
    const viewBoxWidth = viewBox?.[2];
    const viewBoxHeight = viewBox?.[3];
    if (viewBox && viewBox.length === 4 && viewBox.every(Number.isFinite) && viewBoxWidth && viewBoxHeight && viewBoxWidth > 0 && viewBoxHeight > 0) {
        return { width: viewBoxWidth, height: viewBoxHeight };
    }
    return { width: fallbackSize, height: fallbackSize };
}

function loadImage(source: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Unable to render SVG for PDF export."));
        image.src = source;
    });
}

export async function downloadPdf(svg: string, fileName = "canva-frame-generator.pdf"): Promise<void> {
    const { width, height } = readSvgSize(svg);
    const scale = Math.min(4, Math.max(2, 2048 / Math.max(width, height)));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("Unable to create PDF render canvas.");
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
        const image = await loadImage(url);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pageWidth = width;
        const pageHeight = height;
        const pdf = new jsPDF({
            unit: "pt",
            format: [pageWidth, pageHeight],
            orientation: pageWidth > pageHeight ? "landscape" : "portrait",
        });
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageWidth, pageHeight);
        pdf.save(fileName);
    }
    finally {
        URL.revokeObjectURL(url);
    }
}
