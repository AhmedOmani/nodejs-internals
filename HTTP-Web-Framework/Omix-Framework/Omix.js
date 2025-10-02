const http = require("node:http");
const { URL } = require('node:url');
const { OmixResponse } = require("./Omix-Response");
const { OmixRequest } = require("./Omix-Request");
const { OmixRouter } = require("./Omix-Router");

class Omix {

    constructor() {
        this.dispatcher = this.dispatcher.bind(this);
        this.server = http.createServer(this.dispatcher);
        this.router = new OmixRouter();
    }

    route(method , path , handler)  {
        this.router.addRoute(method, path , handler);
    }

    get(path , handler) {
        this.route("GET" , path , handler);
    }
    post(path , handler) {
        this.route("POST" , path , handler);
    } 
    put(path , handler) {
        this.route("PUT" , path , handler);
    } 
    patch(path , handler) {
        this.route("PATCH" , path , handler);
    } 
    delete(path , handler) {
        this.route("DELETE" , path , handler);
    } 
    options(path , handler) {
        this.route("OPTIONS" , path , handler);
    } 

    dispatcher(req , res) {
        const method = req.method;
        const url = new URL(req.url , `http://${req.headers.host}`);
        const path = url.pathname;

        const match = this.router.matchRoute(method , path);

        if (!match) {
            res.writeHead(404 ,  {"Content-Type" : "text/plain"});
            res.end("404 Not Found");
            return;
        }

        //Run the handler function assigned to that route.
        const omixRequest = new OmixRequest(req , match.params , url.searchParams);
        const omixResponse = new OmixResponse(res);

        //Run the 
        match.handler(omixRequest , omixResponse);
    }

    listen = (port , cb) => {
        this.server.listen(port , () => cb());
    }
}

module.exports = {
    Omix
};