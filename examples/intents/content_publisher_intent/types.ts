import type { Preview } from "@canva/intents/content";
export interface PublishSettings {
    caption: string;
}
export function parsePublishSettings(publishRef?: string): PublishSettings | undefined {
    if (!publishRef)
        return undefined;
    try {
        return JSON.parse(publishRef) as PublishSettings;
    }
    catch {
        return undefined;
    }
}
export function isImagePreviewReady(preview: Preview): preview is Preview & {
    kind: "image";
    status: "ready";
    url: string;
} {
    return (preview.kind === "image" && preview.status === "ready" && "url" in preview);
}
