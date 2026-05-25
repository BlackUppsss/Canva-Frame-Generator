import { auth } from "@canva/user";
import { POLLING_INTERVAL_IN_SECONDS } from "src/config";
export interface ImageType {
    label: string;
    fullsize: {
        width: number;
        height: number;
        url: string;
    };
    thumbnail: {
        width: number;
        height: number;
        url: string;
    };
}
interface ImageGenerationResult {
    images: ImageType[];
    credits: number;
}
interface ImageGenerationJobStatusResponse {
    status: "completed" | "processing";
    images: ImageType[];
    credits: number;
}
interface QueueImageGenerationResponse {
    jobId: string;
}
interface RemainingCreditsResult {
    credits: number;
}
const endpoints = {
    queueImageGeneration: "/api/queue-image-generation",
    getImageGenerationJobStatus: "/api/job-status",
    cancelImageGenerationJob: "/api/job-status/cancel",
    getRemainingCredits: "/api/credits",
    purchaseCredits: "/api/purchase-credits",
};
export const queueImageGeneration = async ({ prompt, numberOfImages, }: {
    prompt: string;
    numberOfImages: number;
}): Promise<QueueImageGenerationResponse> => {
    const url = new URL(endpoints.queueImageGeneration, BACKEND_HOST);
    url.searchParams.append("count", numberOfImages.toString());
    url.searchParams.append("prompt", prompt);
    const result: QueueImageGenerationResponse = await sendRequest(url);
    return result;
};
export const getImageGenerationJobStatus = async ({ jobId, }: {
    jobId: string;
}): Promise<ImageGenerationResult> => {
    const url = new URL(endpoints.getImageGenerationJobStatus, BACKEND_HOST);
    url.searchParams.append("jobId", jobId);
    const maxAttempts = 10;
    let attempts = 0;
    while (attempts < maxAttempts) {
        try {
            const response = (await sendRequest(url)) as ImageGenerationJobStatusResponse;
            if (response.status === "completed") {
                return { images: response.images, credits: response.credits };
            }
            else if (response.status === "processing") {
                await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL_IN_SECONDS * 1000));
                attempts++;
            }
            else if (response.status === "cancelled") {
                throw new Error("Job not found");
            }
        }
        catch (error) {
            throw new Error(`Error while polling job status ${error}`);
        }
    }
    throw new Error("Maximum polling attempts reached");
};
export const cancelImageGenerationJob = async (jobId: string): Promise<void> => {
    const url = new URL(endpoints.cancelImageGenerationJob, BACKEND_HOST);
    url.searchParams.append("jobId", jobId);
    try {
        await sendRequest(url, {
            method: "POST",
        });
    }
    catch {
        throw new Error("Failed to cancel job.");
    }
};
export const getRemainingCredits = async (): Promise<RemainingCreditsResult> => {
    const url = new URL(endpoints.getRemainingCredits, BACKEND_HOST);
    const result: RemainingCreditsResult = await sendRequest(url);
    return result;
};
export const purchaseCredits = async (): Promise<RemainingCreditsResult> => {
    const url = new URL(endpoints.purchaseCredits, BACKEND_HOST);
    const result: RemainingCreditsResult = await sendRequest(url, {
        method: "POST",
    });
    return result;
};
const sendRequest = async <T>(url: URL, options?: RequestInit): Promise<T> => {
    const userToken = await auth.getCanvaUserToken();
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${userToken}`,
            ...options?.headers,
        },
        ...options,
    });
    if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
    }
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return (await res.json()) as T;
    }
    else {
        return (await res.text()) as unknown as T;
    }
};
