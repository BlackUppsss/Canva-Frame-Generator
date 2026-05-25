import { getTemporaryUrl, upload } from "@canva/asset";
import { appProcess } from "@canva/platform";
import * as React from "react";
import { useSelection } from "@canva/app-hooks";
export const SelectedImageOverlay = () => {
    const selection = useSelection("image");
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const originalImageRef = React.useRef<HTMLImageElement | null>(null);
    React.useEffect(() => {
        const initializeCanvas = async () => {
            try {
                const draft = await selection.read();
                const [image] = draft.contents;
                if (!image) {
                    return;
                }
                const { url } = await getTemporaryUrl({
                    type: "image",
                    ref: image.ref,
                });
                const img = await downloadImage(url);
                originalImageRef.current = img;
                const { canvas, context } = getCanvas(canvasRef.current);
                canvas.width = img.width;
                canvas.height = img.height;
                context.drawImage(img, 0, 0, img.width, img.height);
                appProcess.broadcastMessage({ isImageReady: true });
            }
            catch {
                appProcess.broadcastMessage({ isImageReady: false });
            }
        };
        initializeCanvas();
    }, [selection]);
    React.useEffect(() => {
        appProcess.registerOnMessage(async (sender, message) => {
            if (typeof message !== "object" ||
                message == null ||
                !("action" in message)) {
                return;
            }
            try {
                const { canvas, context } = getCanvas(canvasRef.current);
                switch (message.action) {
                    case "invert":
                        context.filter = "invert(100%)";
                        context.drawImage(canvas, 0, 0);
                        break;
                    case "blur":
                        context.filter = "blur(3px)";
                        context.drawImage(canvas, 0, 0);
                        break;
                    case "reset":
                        if (originalImageRef.current) {
                            context.filter = "none";
                            context.clearRect(0, 0, canvas.width, canvas.height);
                            context.drawImage(originalImageRef.current, 0, 0);
                        }
                        break;
                    default:
                        break;
                }
            }
            catch {
            }
        });
    }, []);
    React.useEffect(() => {
        return void appProcess.current.setOnDispose(async (context) => {
            try {
                if (context.reason === "completed") {
                    const { canvas } = getCanvas(canvasRef.current);
                    const dataUrl = canvas.toDataURL("image/png", 1.0);
                    const asset = await upload({
                        type: "image",
                        mimeType: "image/png",
                        url: dataUrl,
                        thumbnailUrl: dataUrl,
                        aiDisclosure: "none",
                    });
                    const draft = await selection.read();
                    const [image] = draft.contents;
                    if (!image) {
                        return;
                    }
                    image.ref = asset.ref;
                    await draft.save();
                }
                appProcess.broadcastMessage({ isImageReady: false });
            }
            catch {
            }
        });
    }, [selection]);
    return (<canvas ref={canvasRef} style={{
            width: "100%",
            height: "100%",
            display: "block",
        }}/>);
};
const downloadImage = async (url: string): Promise<HTMLImageElement> => {
    const response = await fetch(url, { mode: "cors" });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image could not be loaded"));
        img.src = objectUrl;
    });
    URL.revokeObjectURL(objectUrl);
    return img;
};
const getCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) {
        throw new Error("HTMLCanvasElement does not exist");
    }
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("CanvasRenderingContext2D does not exist");
    }
    return { canvas, context };
};
