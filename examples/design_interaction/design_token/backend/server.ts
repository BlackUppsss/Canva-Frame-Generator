import cors from "cors";
import "dotenv/config";
import express from "express";
import { createBaseServer } from "../../../../utils/backend/base_backend/create";
import { user, design, tokenExtractors } from "@canva/app-middleware/express";
import { createBrand, createInMemoryDatabase, createUser } from "./database";
const APP_ID = process.env.CANVA_APP_ID;
if (!APP_ID) {
    throw new Error(`The CANVA_APP_ID environment variable is undefined. Set the variable in the project's .env file.`);
}
const router = express.Router();
const data = createInMemoryDatabase();
router.use(cors());
router.use(user.verifyToken({ appId: APP_ID }));
router.get("/design", design.verifyToken({
    appId: APP_ID,
    tokenExtractor: tokenExtractors.fromQuery("designToken"),
}), async (req, res) => {
    const { designId } = req.canva.design!;
    const { userId, brandId } = req.canva.user!;
    const brand = data.get(brandId);
    const userRecord = brand?.users?.get(userId);
    return res.send(userRecord?.designs?.get(designId) || {});
});
router.post("/design", design.verifyToken({
    appId: APP_ID,
    tokenExtractor: tokenExtractors.fromQuery("designToken"),
}), async (req, res) => {
    const { designId } = req.canva.design!;
    const { userId, brandId } = req.canva.user!;
    let brand = data.get(brandId);
    if (brand == null) {
        brand = createBrand();
        data.set(brandId, brand);
    }
    let userRecord = brand.users.get(userId);
    if (userRecord == null) {
        userRecord = createUser();
        brand.users.set(userId, userRecord);
    }
    userRecord.designs.set(designId, req.body);
    return res.sendStatus(200);
});
const server = createBaseServer(router);
server.start(process.env.CANVA_BACKEND_PORT);
