import { Box } from "@canva/app-ui-kit";
import type { OutputType, PreviewMedia, RenderPreviewUiInvocationContext, } from "@canva/intents/content";
import { useEffect, useState } from "react";
import * as styles from "../../../styles/preview_ui.css";
import { PostPreview } from "./post_preview";
import { parsePublishSettings } from "./types";
interface PreviewUiProps {
    invocationContext: RenderPreviewUiInvocationContext;
    registerOnPreviewChange: (callback: (opts: {
        previewMedia: PreviewMedia[];
        outputType: OutputType;
        publishRef?: string;
    }) => void) => () => void;
}
const username = "username";
export const PreviewUi = ({ invocationContext, registerOnPreviewChange, }: PreviewUiProps) => {
    const [previewData, setPreviewData] = useState<{
        previewMedia?: PreviewMedia[];
        outputType?: OutputType;
        publishRef?: string;
    } | null>(invocationContext
        ? {
            previewMedia: (invocationContext?.previewMedia as PreviewMedia[]) || [],
            outputType: (invocationContext?.outputType as OutputType) || undefined,
            publishRef: invocationContext?.publishRef,
        }
        : null);
    useEffect(() => {
        const dispose = registerOnPreviewChange((data) => {
            setPreviewData(data);
        });
        return dispose;
    }, [registerOnPreviewChange]);
    const { previewMedia, publishRef, outputType } = previewData ?? {};
    const publishSettings = parsePublishSettings(publishRef);
    return (<Box className={styles.container} display="flex" alignItems="center" justifyContent="center" flexDirection="column" width="full" height="full">
      {outputType?.id === "post" && (<PostPreview previewMedia={previewMedia} settings={publishSettings} username={username}/>)}
    </Box>);
};
