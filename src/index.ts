import "reflect-metadata";

import * as express from "express";
import * as session from "express-session";
import * as socketIo from "socket.io";

import { musixRouter } from "./routers/MusixRouter";
import { liveWallRouter } from "./routers/LiveWallRouter";
import { mainRouter } from "./routers/MainRouter";

/*
=====================================================================================
app & io: Setup
=====================================================================================
*/
const port: number = 8080;
const app = express();
const http = require('http').createServer(app);
const io = socketIo(http);
http.listen(port);
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
/* 
=====================================================================================
io: Listeners Setup
=====================================================================================
*/
io.on("connection", (socket) => {
    socket.on("musix-broadcast", (params) => {
        //NOTE: "musix-broadcast" event broadcasts a given event to all of its clients
        socket.broadcast.emit(params.eventName, params);
    });
});

console.log(`Express server status: Ready. Listening on port ${port}`);