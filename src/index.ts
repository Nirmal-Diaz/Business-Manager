import "reflect-metadata";

import * as http from "http";

import * as express from "express";

import { mainRouter } from "./routers/MainRouter";

/*
=====================================================================================
app & io: Setup
=====================================================================================
*/
const port: number = 8080;
const app = express();
const server = http.createServer(app);
server.listen(port);
/*
=====================================================================================
app: Router Setup
=====================================================================================
*/
app.use("/", mainRouter);

console.log(`Express server status: Ready. Listening on port ${port}`);