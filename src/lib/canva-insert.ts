import { addElementAtPoint } from "@canva/design";
import type { FrameCandidate, InsertResult } from "./types";
function parseViewBoxString(viewBoxString: string) {
    const parts = viewBoxString.split(/\s+/).map(Number);
    if (parts.length === 4 && parts.every(Number.isFinite)) {
        return {
            left: parts[0] as number,
            top: parts[1] as number,
            width: parts[2] as number,
            height: parts[3] as number,
        };
    }
    return { left: 0, top: 0, width: 512, height: 512 };
}
export async function insertCandidateToDesign(candidate: FrameCandidate): Promise<InsertResult> {
    const viewBox = parseViewBoxString(candidate.viewBox);
    if (candidate.outputMode === "pdf-fallback") {
        return {
            success: false,
            mode: "pdf-fallback",
            message: "Please use the fallback export panel to download your frame.",
        };
    }
    try {
        await addElementAtPoint({
            type: "shape",
            paths: candidate.pathData.map((d) => ({
                d,
                fill: {
                    dropTarget: true,
                    color: "#e8e8e8",
                },
            })),
            viewBox,
        });
        return {
            success: true,
            mode: "native-frame",
            message: "Successfully inserted as a Canva frame.",
        };
    }
    catch (error) {
        console.error("Failed to insert native frame:", error);
        try {
            await addElementAtPoint({
                type: "shape",
                paths: candidate.pathData.map((d) => ({
                    d,
                    fill: {
                        dropTarget: false,
                        color: "#cccccc",
                    },
                })),
                viewBox,
            });
            return {
                success: true,
                mode: "vector",
                message: "Inserted as a vector shape. Native frame might not be supported.",
            };
        }
        catch (fallbackError) {
            console.error("Failed fallback vector insertion:", fallbackError);
            return {
                success: false,
                mode: "vector",
                message: "Failed to insert the shape into the design.",
            };
        }
    }
}
