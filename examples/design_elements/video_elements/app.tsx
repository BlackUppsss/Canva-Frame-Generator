import { Box, Button, FormField, Grid, VideoCard, Rows, Text, } from "@canva/app-ui-kit";
import React from "react";
import * as styles from "styles/components.css";
import { upload } from "@canva/asset";
import { addElementAtCursor, addElementAtPoint } from "@canva/design";
import { useFeatureSupport } from "@canva/app-hooks";
type ExampleStaticVideo = {
    title: string;
    url: string;
    thumbnailImageUrl: string;
    thumbnailVideoUrl: string;
};
const STATIC_VIDEOS: Record<string, ExampleStaticVideo> = {
    building: {
        title: "Pinwheel on building",
        url: "https://www.canva.dev/example-assets/video-import/video.mp4",
        thumbnailImageUrl: "https://www.canva.dev/example-assets/video-import/thumbnail-image.jpg",
        thumbnailVideoUrl: "https://www.canva.dev/example-assets/video-import/thumbnail-video.mp4",
    },
    beach: {
        title: "A beautiful beach scene",
        url: "https://www.canva.dev/example-assets/video-import/beach-video.mp4",
        thumbnailImageUrl: "https://www.canva.dev/example-assets/video-import/beach-thumbnail-image.jpg",
        thumbnailVideoUrl: "https://www.canva.dev/example-assets/video-import/beach-thumbnail-video.mp4",
    },
};
export const App = () => {
    const [selected, setSelected] = React.useState("building");
    const [isLoading, setIsLoading] = React.useState(false);
    const isSupported = useFeatureSupport();
    const addElement = [addElementAtPoint, addElementAtCursor].find((fn) => isSupported(fn));
    const items = Object.entries(STATIC_VIDEOS).map(([key, value]) => {
        const { title, thumbnailImageUrl, thumbnailVideoUrl } = value;
        return {
            key,
            title,
            thumbnailImageUrl,
            thumbnailVideoUrl,
            active: selected === key,
            onClick: () => {
                setSelected(key);
            },
        };
    });
    const addVideo = React.useCallback(async () => {
        if (!addElement) {
            return;
        }
        setIsLoading(true);
        try {
            const item = STATIC_VIDEOS[selected];
            if (!item) {
                throw new Error(`Unknown video: ${selected}`);
            }
            const { ref } = await upload({
                type: "video",
                mimeType: "video/mp4",
                url: item.url,
                thumbnailImageUrl: item.thumbnailImageUrl,
                thumbnailVideoUrl: item.thumbnailVideoUrl,
                aiDisclosure: "none",
            });
            await addElement({
                type: "video",
                ref,
                altText: {
                    text: item.title,
                    decorative: undefined,
                },
            });
        }
        finally {
            setIsLoading(false);
        }
    }, [selected, addElement]);
    return (<div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          This example demonstrates how apps can add video elements to a design.
        </Text>
        <FormField label="Select a video" control={(props) => (<Box {...props} padding="1u">
              <Grid columns={2} spacing="1.5u">
                {items.map((item) => (<VideoCard ariaLabel="Add video to design" key={item.key} mimeType="video/mp4" thumbnailUrl={item.thumbnailImageUrl} thumbnailHeight={150} videoPreviewUrl={item.thumbnailVideoUrl} onClick={item.onClick} selectable={true} selected={item.active} borderRadius="standard"/>))}
              </Grid>
            </Box>)}/>
        <Button variant="primary" disabled={!addElement} tooltipLabel={!addElement
            ? "This feature is not supported in the current page"
            : undefined} loading={isLoading} onClick={addVideo} stretch>
          Add element
        </Button>
      </Rows>
    </div>);
};
