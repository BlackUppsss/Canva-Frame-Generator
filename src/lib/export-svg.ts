export function downloadSvg(svg: string, fileName = "canva-frame-generator.svg"): void {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
}
export async function copySvgToClipboard(svg: string): Promise<void> {
    await navigator.clipboard.writeText(svg);
}
