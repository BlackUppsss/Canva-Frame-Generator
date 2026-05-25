import type { OutputType, PreviewMedia, RenderPreviewUiInvocationContext, } from "@canva/intents/content";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { parsePublishSettings } from "./types";
import * as styles from "./preview_ui.css";
import { Box, Text, Rows, Columns, Column, Avatar, Placeholder, TextPlaceholder, ImageCard, } from "@canva/app-ui-kit";
import type { Preview } from "@canva/intents/content";
import { isImagePreviewReady, type PublishSettings } from "./types";
const username = "username";
const IMAGE_WIDTH = 400;
interface PreviewUiProps {
    invocationContext: RenderPreviewUiInvocationContext;
    registerOnPreviewChange: (callback: (opts: {
        previewMedia: PreviewMedia[];
        outputType: OutputType;
        publishRef?: string;
    }) => void) => () => void;
}
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
      {outputType?.id === "post" && (<PostPreview previewMedia={previewMedia} settings={publishSettings}/>)}
    </Box>);
};
interface PreviewProps {
    previewMedia: PreviewMedia[] | undefined;
    settings: PublishSettings | undefined;
}
export const PostPreview = ({ previewMedia, settings }: PreviewProps) => {
    const isLoading = !previewMedia;
    const caption = settings?.caption;
    const previewWidth = 400 + 32 + 2;
    return (<div style={{ width: previewWidth }}>
      <Box display="flex" alignItems="center" justifyContent="center" background="surface" borderRadius="large" padding="2u" border="standard">
        <Rows spacing="2u">
          <UserInfo isLoading={isLoading}/>
          <ImagePreview previewMedia={previewMedia}/>
          <Caption isLoading={isLoading} caption={caption}/>
        </Rows>
      </Box>
    </div>);
};
const UserInfo = ({ isLoading }: {
    isLoading: boolean;
}) => {
    return (<Columns spacing="1u" alignY="center">
      <Column width="content">
        <Box className={styles.avatar}>
          <Avatar name={username}/>
        </Box>
      </Column>
      <Column width="content">
        {isLoading ? (<div className={styles.textPlaceholder}>
            <TextPlaceholder size="medium"/>
          </div>) : (<Text size="small" variant="bold">
            {username}
          </Text>)}
      </Column>
    </Columns>);
};
const Caption = ({ isLoading, caption, }: {
    isLoading: boolean;
    caption: string | undefined;
}) => {
    return (<>
      {isLoading ? (<div className={styles.textPlaceholder}>
          <TextPlaceholder size="medium"/>
        </div>) : (caption && (<Text lineClamp={2} size="small">
            {caption}
          </Text>))}
    </>);
};
const ImagePreview = ({ previewMedia, }: {
    previewMedia: PreviewMedia[] | undefined;
}) => {
    const isLoading = !previewMedia;
    const media = previewMedia?.find((media) => media.mediaSlotId === "media");
    const fullWidth = (media?.previews.length ?? 1) * IMAGE_WIDTH;
    return (<Box borderRadius="large" className={styles.imageContainer}>
      {isLoading || !media?.previews.length ? (<div className={styles.imagePlaceholder}>
          <Placeholder shape="rectangle"/>
        </div>) : (<div className={styles.imageRow} style={{ width: fullWidth }}>
          {media?.previews
                .filter((p) => p.kind !== "email")
                .map((p) => {
                return (<div key={p.id} className={styles.image}>
                  <PreviewRenderer preview={p}/>
                </div>);
            })}
        </div>)}
    </Box>);
};
const PreviewRenderer = ({ preview }: {
    preview: Preview;
}) => {
    if (preview.kind === "email") {
        return null;
    }
    const intl = useIntl();
    if (preview.status === "loading") {
        return (<ImageStatusText text={intl.formatMessage({
                defaultMessage: "Loading...",
                description: "Loading state text shown while image preview is loading",
            })}/>);
    }
    if (preview.status === "error") {
        return (<ImageStatusText text={intl.formatMessage({
                defaultMessage: "Error loading preview",
                description: "Error message shown when image preview fails to load",
            })}/>);
    }
    if (isImagePreviewReady(preview)) {
        return (<ImageCard alt={intl.formatMessage({
                defaultMessage: "Image preview {id}",
                description: "Alt text for image preview thumbnails",
            }, { id: preview.id })} thumbnailUrl={preview.url}/>);
    }
    return (<Box width="full" height="full" padding="2u" display="flex" alignItems="center" justifyContent="center">
      <Text size="medium" tone="tertiary" alignment="center">
        {intl.formatMessage({
            defaultMessage: "Preview not available",
            description: "Fallback text shown when preview type is not supported",
        })}
      </Text>
    </Box>);
};
const ImageStatusText = ({ text }: {
    text: string;
}) => (<Box width="full" height="full" padding="2u" display="flex" alignItems="center" justifyContent="center">
    <Text size="medium" tone="tertiary" alignment="center">
      {text}
    </Text>
  </Box>);
