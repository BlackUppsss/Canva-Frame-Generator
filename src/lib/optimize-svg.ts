export async function optimizeSvg(svg: string): Promise<string> {
    return svg
        .replace(/<!--([\s\S]*?)-->/g, "")
        .replace(/<\?xml[\s\S]*?\?>/gi, "")
        .replace(/<!doctype[\s\S]*?>/gi, "")
        .replace(/\s{2,}/g, " ")
        .replace(/>\s+</g, "><")
        .trim();
}
