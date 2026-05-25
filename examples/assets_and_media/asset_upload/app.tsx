import { Alert, Button, Rows, Text } from "@canva/app-ui-kit";
import { upload } from "@canva/asset";
import { addAudioTrack, addElementAtCursor, addElementAtPoint, } from "@canva/design";
import * as styles from "styles/components.css";
import { useFeatureSupport } from "@canva/app-hooks";
export const App = () => {
    const isSupported = useFeatureSupport();
    const addElement = [addElementAtPoint, addElementAtCursor].find((fn) => isSupported(fn));
    const importAndAddImage = async () => {
        if (!addElement) {
            return;
        }
        const image = await upload({
            type: "image",
            mimeType: "image/jpeg",
            url: "https://www.canva.dev/example-assets/image-import/image.jpg",
            thumbnailUrl: "https://www.canva.dev/example-assets/image-import/thumbnail.jpg",
            width: 540,
            height: 720,
            aiDisclosure: "none",
        });
        await addElement({
            type: "image",
            ref: image.ref,
            altText: {
                text: "a photo of buildings by the water",
                decorative: undefined,
            },
        });
        await image.whenUploaded();
        console.log("Upload complete!");
    };
    const importAndAddVideo = async () => {
        if (!addElement) {
            return;
        }
        const queuedVideo = await upload({
            type: "video",
            mimeType: "video/mp4",
            url: "https://www.canva.dev/example-assets/video-import/video.mp4",
            thumbnailImageUrl: "https://www.canva.dev/example-assets/video-import/thumbnail-image.jpg",
            thumbnailVideoUrl: "https://www.canva.dev/example-assets/video-import/thumbnail-video.mp4",
            width: 405,
            height: 720,
            aiDisclosure: "none",
        });
        await addElement({
            type: "video",
            ref: queuedVideo.ref,
            altText: {
                text: "a video of building with yellow spinning wheel",
                decorative: undefined,
            },
        });
        await queuedVideo.whenUploaded();
        console.log("Upload complete!");
    };
    const importAndAddAudio = async () => {
        const queuedAudio = await upload({
            type: "audio",
            mimeType: "audio/mp3",
            url: "https://www.canva.dev/example-assets/audio-import/audio.mp3",
            durationMs: 86047,
            title: "Example audio",
            aiDisclosure: "none",
        });
        await addAudioTrack({
            ref: queuedAudio.ref,
        });
        await queuedAudio.whenUploaded();
        console.log("Upload complete!");
    };
    return (<div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <Text>
          This example demonstrates how apps can import video, audio and image
          assets into Canva.
        </Text>
        <Rows spacing="1.5u">
          <Button onClick={importAndAddImage} variant="secondary" disabled={!addElement} tooltipLabel={!addElement
            ? "This feature is not supported in the current page"
            : undefined} stretch>
            Import image
          </Button>
          <Button onClick={importAndAddVideo} variant="secondary" disabled={!addElement} tooltipLabel={!addElement
            ? "This feature is not supported in the current page"
            : undefined} stretch>
            Import video
          </Button>
          <Button onClick={importAndAddAudio} variant="secondary" disabled={!isSupported(addAudioTrack)} tooltipLabel={!isSupported(addAudioTrack)
            ? "This feature is not supported in the current page"
            : undefined} stretch>
            Import audio
          </Button>
        </Rows>
        {!isSupported(addAudioTrack) && <UnsupportedAlert />}
      </Rows>
    </div>);
};
const UnsupportedAlert = () => (<Alert tone="warn">
    Sorry, the required feature (addAudioTrack) is not supported in the current
    design.
  </Alert>);
