export type SourceType = "png" | "svg";
export type OutputMode = "native-frame" | "vector" | "image" | "pdf-fallback";
export type OutputModeSetting = "auto" | "vector" | "pdf-fallback";
export type ProcessingStatus = "idle" | "loading" | "success" | "error";
export type ParsedSvgResult = {
    viewBox: string;
    width?: number;
    height?: number;
    paths: string[];
    rawSvg: string;
    normalizedSvg: string;
    warnings: string[];
};
export type PngAnalysisResult = {
    hasAlpha: boolean;
    transparentRatio: number;
    width: number;
    height: number;
    isSuitableForTracing: boolean;
    warning?: string;
};
export type TraceSettings = {
    threshold: number;
    smoothness: number;
    invertMask: boolean;
    outputMode: OutputModeSetting;
};
export type TraceResult = {
    svg: string;
    pathData: string[];
    viewBox: string;
    width: number;
    height: number;
};
export type FrameCandidate = {
    id: string;
    sourceType: SourceType;
    originalFileName: string;
    originalPreviewUrl: string;
    normalizedSvg: string;
    optimizedSvg?: string;
    pathData: string[];
    viewBox: string;
    width: number;
    height: number;
    outputMode: OutputMode;
    warnings: string[];
};
export type ConversionError = {
    code: string;
    message: string;
};
export type ConversionResult = {
    success: boolean;
    candidate?: FrameCandidate;
    error?: ConversionError;
};
export type InsertResult = {
    success: boolean;
    mode: OutputMode;
    message: string;
};
