import type { Container, Resource } from "@canva/app-components";
import crypto from "crypto";
import express from "express";
export async function generateHash(message: string) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return hashHex;
}
const imageUrls = [
    "https://images.pexels.com/photos/1495580/pexels-photo-1495580.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/3943197/pexels-photo-3943197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/7195267/pexels-photo-7195267.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/2904142/pexels-photo-2904142.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/5403478/pexels-photo-5403478.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
];
export const createDamRouter = () => {
    const router = express.Router();
    router.post("/resources/find", async (req, res) => {
        const { types, continuation, locale, } = req.body;
        let resources: Resource[] = [];
        if (types.includes("IMAGE")) {
            resources = await Promise.all(Array.from({ length: 40 }, async (_, i) => {
                const imageUrl = imageUrls[i % imageUrls.length];
                if (!imageUrl) {
                    throw new Error(`Image URL not found for index ${i}`);
                }
                return {
                    id: await generateHash(i + ""),
                    mimeType: "image/jpeg",
                    name: `My new thing in ${locale}`,
                    type: "IMAGE",
                    thumbnail: {
                        url: imageUrl,
                    },
                    url: imageUrl,
                };
            }));
        }
        if (types.includes("CONTAINER")) {
            const containers = await Promise.all(Array.from({ length: 10 }, async (_, i) => ({
                id: await generateHash(i + ""),
                containerType: "folder",
                name: `My folder ${i}`,
                type: "CONTAINER",
            }) satisfies Container));
            resources = resources.concat(containers);
        }
        res.send({
            resources,
            continuation: +(continuation || 0) + 1,
        });
    });
    return router;
};
