import "reflect-metadata";

import * as express from "express";
import * as session from "express-session";

import { musixRouter } from "./routers/MusixRouter";
import { liveWallRouter } from "./routers/LiveWallRouter";
import { mainRouter } from "./routers/MainRouter";
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
app: Middleware Setup
=====================================================================================
*/
app.use(session({
    secret: Math.random().toString(),
    saveUninitialized: false,
    resave: false
}));
/*
=====================================================================================
app: Router Setup
=====================================================================================
*/
app.use("/musix", musixRouter);
app.use("/liveWall", liveWallRouter);
app.use("/", mainRouter);

console.log(`Express server status: Ready. Listening on port ${port}`);