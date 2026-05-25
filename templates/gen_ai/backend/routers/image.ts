import express from "express";
interface ImageResponse {
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
const imageUrls: ImageResponse[] = [
    {
        fullsize: {
            width: 1280,
            height: 853,
            url: "https://images.pexels.com/photos/1145720/pexels-photo-1145720.jpeg?auto=compress&cs=tinysrgb&w=1280&h=853&dpr=2",
        },
        thumbnail: {
            width: 640,
            height: 427,
            url: "https://images.pexels.com/photos/1145720/pexels-photo-1145720.jpeg?auto=compress&cs=tinysrgb&w=640&h=427&dpr=2",
        },
    },
    {
        fullsize: {
            width: 1280,
            height: 853,
            url: "https://images.pexels.com/photos/4010108/pexels-photo-4010108.jpeg?auto=compress&cs=tinysrgb&w=1280&h=863&dpr=2",
        },
        thumbnail: {
            width: 640,
            height: 427,
            url: "https://images.pexels.com/photos/4010108/pexels-photo-4010108.jpeg?auto=compress&cs=tinysrgb&w=640&h=427&dpr=2",
        },
    },
    {
        fullsize: {
            width: 1280,
            height: 853,
            url: "https://images.pexels.com/photos/1327496/pexels-photo-1327496.jpeg?auto=compress&cs=tinysrgb&w=1280&h=853&dpr=2",
        },
        thumbnail: {
            width: 640,
            height: 427,
            url: "https://images.pexels.com/photos/1327496/pexels-photo-1327496.jpeg?auto=compress&cs=tinysrgb&w=640&h=427&dpr=2",
        },
    },
    {
        fullsize: {
            width: 1280,
            height: 853,
            url: "https://images.pexels.com/photos/4693135/pexels-photo-4693135.jpeg?auto=compress&cs=tinysrgb&w=1280&h=853&dpr=2",
        },
        thumbnail: {
            width: 640,
            height: 427,
            url: "https://images.pexels.com/photos/4693135/pexels-photo-4693135.jpeg?auto=compress&cs=tinysrgb&w=640&h=427&dpr=2",
        },
    },
];
export const createImageRouter = () => {
    const enum Routes {
        CREDITS = "/api/credits",
        PURCHASE_CREDITS = "/api/purchase-credits",
        QUEUE_IMAGE_GENERATION = "/api/queue-image-generation",
        JOB_STATUS = "/api/job-status",
        CANCEL_JOB = "/api/job-status/cancel"
    }
    const router = express.Router();
    const jobQueue: {
        jobId: string;
        prompt: string;
        timeoutId: NodeJS.Timeout;
    }[] = [];
    const completedJobs: Record<string, ImageResponse[]> = {};
    const cancelledJobs: {
        jobId: string;
    }[] = [];
    let credits = 10;
    const CREDITS_IN_BUNDLE = 10;
    router.get(Routes.CREDITS, async (req, res) => {
        res.status(200).send({
            credits,
        });
    });
    router.post(Routes.PURCHASE_CREDITS, async (req, res) => {
        credits += CREDITS_IN_BUNDLE;
        res.status(200).send({
            credits,
        });
    });
    router.get(Routes.QUEUE_IMAGE_GENERATION, async (req, res) => {
        if (credits <= 0) {
            return res
                .status(403)
                .send("Not enough credits required to generate images.");
        }
        const prompt = req.query.prompt as string;
        if (!prompt) {
            return res.status(400).send("Missing prompt parameter.");
        }
        const jobId = generateJobId();
        const timeoutId = setTimeout(() => {
            const index = jobQueue.findIndex((job) => job.jobId === jobId);
            if (index !== -1) {
                jobQueue.splice(index, 1);
                completedJobs[jobId] = imageUrls.map((image) => {
                    return { ...image, label: prompt };
                });
                credits -= 1;
            }
        }, 5000);
        jobQueue.push({ jobId, prompt, timeoutId });
        return res.status(200).send({
            jobId,
        });
    });
    router.get(Routes.JOB_STATUS, async (req, res) => {
        const jobId = req.query.jobId as string;
        if (!jobId) {
            return res.status(400).send("Missing jobId parameter.");
        }
        if (completedJobs[jobId]) {
            return res.status(200).send({
                status: "completed",
                images: completedJobs[jobId],
                credits,
            });
        }
        if (jobQueue.some((job) => job.jobId === jobId)) {
            return res.status(200).send({
                status: "processing",
            });
        }
        if (cancelledJobs.some((job) => job.jobId === jobId)) {
            return res.status(200).send({
                status: "cancelled",
            });
        }
        return res.status(404).send("Job not found.");
    });
    router.post(Routes.CANCEL_JOB, async (req, res) => {
        const jobId = req.query.jobId as string;
        if (!jobId) {
            return res.status(400).send("Missing jobId parameter.");
        }
        const index = jobQueue.findIndex((job) => job.jobId === jobId);
        const job = jobQueue[index];
        if (index !== -1 && job) {
            cancelledJobs.push({ jobId });
            jobQueue.splice(index, 1);
            clearTimeout(job.timeoutId);
            return res.status(200).send("Job successfully cancelled.");
        }
        return res.status(404).send("Job not found.");
    });
    function generateJobId(): string {
        return Math.random().toString(36).substring(2, 15);
    }
    return router;
};
