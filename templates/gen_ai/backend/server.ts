import { user } from "@canva/app-middleware/express";
import cors from "cors";
import express from "express";
import { createBaseServer } from "../utils/backend/base_backend/create";
import { createImageRouter } from "./routers/image";
async function main() {
    const APP_ID = process.env.CANVA_APP_ID;
    if (!APP_ID) {
        throw new Error(`The CANVA_APP_ID environment variable is undefined. Set the variable in the project's .env file.`);
    }
    const router = express.Router();
    router.use(cors());
    router.use(user.verifyToken({ appId: APP_ID }));
    const imageRouter = createImageRouter();
    router.use(imageRouter);
    const server = createBaseServer(router);
    server.start(process.env.CANVA_BACKEND_PORT);
}
main();
