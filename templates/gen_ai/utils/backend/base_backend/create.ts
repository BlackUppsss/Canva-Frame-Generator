import { TokenVerificationError } from "@canva/app-middleware";
import debug from "debug";
import express from "express";
import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import http from "http";
import https from "https";
const serverDebug = debug("server");
interface BaseServer {
    app: express.Express;
    start: (address: number | string | undefined) => void;
}
export function createBaseServer(router: express.Router): BaseServer {
    const SHOULD_ENABLE_HTTPS = process.env?.SHOULD_ENABLE_HTTPS === "true";
    const HTTPS_CERT_FILE = process.env?.HTTPS_CERT_FILE;
    const HTTPS_KEY_FILE = process.env?.HTTPS_KEY_FILE;
    const app = express();
    app.use(express.json());
    app.disable("x-powered-by");
    app.get("/healthz", (req, res) => {
        res.sendStatus(200);
    });
    app.use((req, _res, next) => {
        serverDebug(`${new Date().toISOString()}: ${req.method} ${req.url}`);
        next();
    });
    app.use(router);
    app.all("*", (req, res) => {
        res.status(404).send({
            error: `unhandled '${req.method}' on '${req.url}'`,
        });
    });
    app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof TokenVerificationError) {
            res.status(err.statusCode).json({
                error: err.code,
                message: err.message,
            });
            return;
        }
        console.error(err.stack);
        res.status(500).send({
            error: "something went wrong",
        });
    });
    let server;
    if (SHOULD_ENABLE_HTTPS) {
        if (!HTTPS_CERT_FILE || !HTTPS_KEY_FILE) {
            throw new Error("Looks like you're running the example with --use-https flag, but SSL certificates haven't been generated. Please remove the .ssl/ folder and re-run the command again.");
        }
        server = https.createServer({
            key: fs.readFileSync(HTTPS_KEY_FILE),
            cert: fs.readFileSync(HTTPS_CERT_FILE),
        }, app);
    }
    else {
        server = http.createServer(app);
    }
    return {
        app,
        start: (address: number | string | undefined) => {
            console.log(`Listening on '${address}'`);
            server.listen(address);
            process.on("SIGTERM", () => {
                serverDebug("SIGTERM signal received: closing HTTP server");
                server.close(() => {
                    serverDebug("HTTP server closed");
                });
            });
        },
    };
}
