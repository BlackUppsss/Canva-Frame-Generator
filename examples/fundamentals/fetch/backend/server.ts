import "dotenv/config";
import express from "express";
import cors from "cors";
import { createBaseServer } from "../../../../utils/backend/base_backend/create";
import { user } from "@canva/app-middleware/express";
async function main() {
    const APP_ID = process.env.CANVA_APP_ID;
    if (!APP_ID) {
        throw new Error(`The CANVA_APP_ID environment variable is undefined. Set the variable in the project's .env file.`);
    }
    const router = express.Router();
    router.use(cors());
    router.use(user.verifyToken({ appId: APP_ID }));
    router.get("/custom-route", async (req, res) => {
        console.log("request", req.canva.user);
        const { appId, userId, brandId } = req.canva.user!;
        res.status(200).send({
            appId,
            userId,
            brandId,
        });
    });
    const server = createBaseServer(router);
    server.start(process.env.CANVA_BACKEND_PORT);
}
main();
