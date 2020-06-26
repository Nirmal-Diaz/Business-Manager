import "reflect-metadata";

import * as express from "express";

import { mainRouter } from "./routers/MainRouter";
import { liveWallRouter } from "./routers/LiveWallRouter";
/*
=====================================================================================
app: Setup
=====================================================================================
*/
const port: number = 8080;
const app = express();
app.listen(port);
/*
=====================================================================================
app: Router Setup
=====================================================================================
*/
app.use("/liveWall", liveWallRouter);
app.use("/", mainRouter);

console.log(`Express server status: Ready. Listening on port ${port}`);