import type { ParsedSvgResult } from "./types";
import { WARNING_MESSAGES } from "src/constants/errors";
const SVG_NS = "http://www.w3.org/2000/svg";
function numberAttr(element: Element, name: string): number | undefined {
    const value = element.getAttribute(name);
    if (!value) {
        return undefined;
    }
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}
function rectToPath(element: Element): string {
    const x = numberAttr(element, "x") ?? 0;
    const y = numberAttr(element, "y") ?? 0;
    const width = numberAttr(element, "width") ?? 0;
    const height = numberAttr(element, "height") ?? 0;
    return `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`;
}
function circleToPath(element: Element): string {
    const cx = numberAttr(element, "cx") ?? 0;
    const cy = numberAttr(element, "cy") ?? 0;
    const r = numberAttr(element, "r") ?? 0;
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;
}
function ellipseToPath(element: Element): string {
    const cx = numberAttr(element, "cx") ?? 0;
    const cy = numberAttr(element, "cy") ?? 0;
    const rx = numberAttr(element, "rx") ?? 0;
    const ry = numberAttr(element, "ry") ?? 0;
    return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
}
function pointsToPath(element: Element, close: boolean): string {
    const points = element.getAttribute("points")?.trim();
    if (!points) {
        return "";
    }
    const normalized = points.replace(/,/g, " ").split(/\s+/).map(Number);
    const commands: string[] = [];
    for (let i = 0; i < normalized.length; i += 2) {
        const x = normalized[i];
        const y = normalized[i + 1];
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            continue;
        }
        commands.push(`${commands.length === 0 ? "M" : "L"} ${x} ${y}`);
    }
    if (close && commands.length > 0) {
        commands.push("Z");
    }
    return commands.join(" ");
}
function getDimensions(svg: SVGSVGElement): {
    width?: number;
    height?: number;
} {
    return {
        width: numberAttr(svg, "width"),
        height: numberAttr(svg, "height"),
    };
}
function getViewBox(svg: SVGSVGElement, width?: number, height?: number): string {
    const viewBox = svg.getAttribute("viewBox");
    if (viewBox) {
        return viewBox;
    }
    return `0 0 ${width ?? 512} ${height ?? 512}`;
}
export function parseSvg(input: string): ParsedSvgResult {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, "image/svg+xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
        throw new Error(parseError.textContent || "Invalid SVG file.");
    }
    const svg = doc.documentElement as unknown as SVGSVGElement;
    if (!svg || svg.tagName.toLowerCase() !== "svg") {
        throw new Error("Uploaded file is not a valid SVG.");
    }
    const warnings: string[] = [];
    const complexSelectors = ["text", "image", "clipPath", "mask", "filter", "foreignObject"];
    if (complexSelectors.some((selector) => svg.querySelector(selector))) {
        warnings.push(WARNING_MESSAGES.complexSvgFeature);
    }
    const paths: string[] = [];
    svg.querySelectorAll("path").forEach((path) => {
        const d = path.getAttribute("d");
        if (d) {
            paths.push(d);
        }
    });
    svg.querySelectorAll("rect").forEach((element) => paths.push(rectToPath(element)));
    svg.querySelectorAll("circle").forEach((element) => paths.push(circleToPath(element)));
    svg.querySelectorAll("ellipse").forEach((element) => paths.push(ellipseToPath(element)));
    svg.querySelectorAll("polygon").forEach((element) => paths.push(pointsToPath(element, true)));
    svg.querySelectorAll("polyline").forEach((element) => paths.push(pointsToPath(element, false)));
    const { width, height } = getDimensions(svg);
    const viewBox = getViewBox(svg, width, height);
    const normalizedSvg = `<svg xmlns="${SVG_NS}" viewBox="${viewBox}">${paths
        .filter(Boolean)
        .map((path) => `<path d="${path}" fill="currentColor"/>`)
        .join("")}</svg>`;
    return {
        viewBox,
        width,
        height,
        paths: paths.filter(Boolean),
        rawSvg: input,
        normalizedSvg,
        warnings,
    };
}
