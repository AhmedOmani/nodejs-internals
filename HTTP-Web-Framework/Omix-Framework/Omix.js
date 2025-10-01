const http = require("node:http");
const { URL } = require('node:url');
const { OmixResponse } = require("./Omix-Response");
const { OmixRequest } = require("./Omix-Request");

class Omix {

    constructor() {
        this.dispatcher = this.dispatcher.bind(this);
        this.server = http.createServer(this.dispatcher);
        this.routes = {
            GET: [],
            POST: [],
            PUT: [],
            PATCH: [],
            DELETE: [],
            OPTIONS: []
        };
    }

    route(method , path , handler)  {
        const upperMethod = method.toUpperCase();
        if (this.routes[upperMethod]) 
            this.routes[upperMethod].push({path , handler});
        else
            console.warn(`Method ${upperMethod} is not from HTTP spec.`);
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

        const routeList = this.routes[method];

        let matchRoute = null;
        for (const route of routeList) {
            if (path === route.path) {
                matchRoute = route ;
                break;
            }
        }

        if (matchRoute) {
            const omixResponse = new OmixResponse(res);
            const omixRequest = new OmixRequest(req);
            matchRoute.handler(omixRequest , omixResponse);
        } else {
            res.writeHead(404 ,  {"Content-Type" : "text/plain"});
            res.end("404 Not Found");
        }
    }

    listen = (port , cb) => {
        this.server.listen(port , () => cb());
    }
}

module.exports = {
    Omix
};