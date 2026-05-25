import { Button, Rows, Text } from "@canva/app-ui-kit";
import { useRef, useState } from "react";
import { ERROR_MESSAGES, MAX_UPLOAD_SIZE_BYTES, SUPPORTED_FILE_EXTENSIONS, SUPPORTED_MIME_TYPES, } from "src/constants/errors";
import * as styles from "styles/components.css";
function isSupportedFile(file: File): boolean {
    const lowerName = file.name.toLowerCase();
    return (SUPPORTED_MIME_TYPES.includes(file.type as never) ||
        SUPPORTED_FILE_EXTENSIONS.some((extension) => lowerName.endsWith(extension)));
}
function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
type FileDropzoneProps = {
    file?: File;
    onFileAccepted: (file: File) => void;
    onError: (message: string) => void;
};
export function FileDropzone({ file, onFileAccepted, onError }: FileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const handleFile = (nextFile?: File) => {
        if (!nextFile) {
            return;
        }
        if (!isSupportedFile(nextFile)) {
            onError(ERROR_MESSAGES.unsupportedFile);
            return;
        }
        if (nextFile.size > MAX_UPLOAD_SIZE_BYTES) {
            onError(ERROR_MESSAGES.fileTooLarge);
            return;
        }
        onFileAccepted(nextFile);
    };
    return (<div className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""}`} onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
        }} onDragLeave={() => setIsDragging(false)} onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFile(event.dataTransfer.files[0]);
        }}>
      <Rows spacing="1u">
        <Text variant="bold">Upload a transparent PNG or SVG.</Text>
        <Text size="small" tone="tertiary">
          Drag and drop your file here, or choose a file from your computer.
        </Text>
        <Button variant="secondary" onClick={() => inputRef.current?.click()} stretch>
          Choose PNG or SVG
        </Button>
        <input ref={inputRef} className={styles.hiddenInput} type="file" accept=".png,.svg,image/png,image/svg+xml" onChange={(event) => handleFile(event.target.files?.[0])}/>
        {file && (<div className={styles.fileMeta}>
            <Text size="small">Name: {file.name}</Text>
            <Text size="small">Size: {formatBytes(file.size)}</Text>
            <Text size="small">Type: {file.type || "Unknown"}</Text>
          </div>)}
      </Rows>
    </div>);
}
