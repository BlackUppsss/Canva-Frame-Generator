export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const SUPPORTED_FILE_EXTENSIONS = [".png", ".svg"] as const;
export const SUPPORTED_MIME_TYPES = ["image/png", "image/svg+xml"] as const;
export const ERROR_MESSAGES = {
    unsupportedFile: "Only PNG and SVG files are supported.",
    fileTooLarge: "File size is too large. Maximum size is 5 MB.",
    recommendedInput: "Please upload a transparent PNG or a clean SVG file.",
    pngNoTransparency: "This PNG has no transparent area. Please upload a transparent PNG.",
    svgTooComplex: "This SVG is too complex. Try converting text/strokes to outlines first.",
    nativeFrameUnavailable: "Native Canva frame mode is not available yet. Inserted as vector instead.",
    readFailed: "Unable to read the uploaded file. Please try another file.",
    conversionFailed: "Unable to convert this file into a vector shape.",
    insertFailed: "Unable to insert the generated shape into your Canva design.",
    exportFailed: "Unable to export the generated shape.",
} as const;
export const WARNING_MESSAGES = {
    complexSvgFeature: "This SVG contains complex features. Convert text, strokes, filters, masks, and clip paths to outlines for best results.",
    lowTransparency: "This PNG has very little transparent area, so tracing may not produce a useful frame candidate.",
    vectorFallback: "Native Canva frame support depends on the Canva Apps SDK. This result will be inserted as a vector fallback unless native frame support is confirmed.",
} as const;
