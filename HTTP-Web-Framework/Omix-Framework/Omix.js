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
        this.globalMiddleware = [];
    }

    use(handler) {
        if (typeof handler === "function") {
            this.globalMiddleware.push(handler);
        } else {
            console.log("Omix.use() excepts a function");
        }
    }

    route(method , path , ...handlers)  {
        const finalHandler = handlers.pop();
        const middleware = handlers;
        this.router.addRoute(method, path , finalHandler, middleware);
    }

    get(path , ...handler) {
        this.route("GET" , path , ...handler);
    }
    post(path , ...handler) {
        this.route("POST" , path , ...handler);
    } 
    put(path , ...handler) {
        this.route("PUT" , path , ...handler);
    } 
    patch(path , ...handler) {
        this.route("PATCH" , path , ...handler);
    } 
    delete(path , ...handler) {
        this.route("DELETE" , path , ...handler);
    } 
    options(path , ...handler) {
        this.route("OPTIONS" , path , ...handler);
    } 

    dispatcher(req , res) {
        const method = req.method;
        const url = new URL(req.url , `http://${req.headers.host}`);
        const path = url.pathname;
        //FIRST OF FIRST : 
        // excute the global middlewares escpecially the static-file serving middleware, 
        // because these files dont have their specific routes.

        const omixRequest = new OmixRequest(req , {} , url.searchParams);
        const omixResponse = new OmixResponse(res);

        //these routerFallback function runs after all the global middlewares to match the request to its specific routes.
        const routerFallback = (req , res , next) => {

            const match = this.router.matchRoute(method , path);
            if (!match) {
                omixResponse.status(404).send("404 Not Found");
                return;
            }

            omixResponse.params = match.params;

            const routeHandlers = [
                ...match.middleware,
                match.handler
            ];

            this.excuteMiddlewareChain(routeHandlers , omixRequest , omixResponse);
        };

        //start handling global middles wares then move to the request.
        const allHandlers = [
            ...this.globalMiddleware,
            routerFallback
        ];

        //Run the chaining of globalmiddlewares (serving the static files) first then excute the main request 
        this.excuteMiddlewareChain(allHandlers , omixRequest, omixResponse);
    }

    excuteMiddlewareChain(handlers , req , res) {
        let index = 0;
        const next = (err) => {
            if (err) {
                if (!res.rawRes.headersSent) {
                    res.status(500).send(`Internal Server Error: ${err.message}`);
                    return;
                }
            }

            const handler = handlers[index++];
            if (!handler) return ;

            try {
                handler(req, res , next);
            } catch(err) {
                next(err);
            }
        }
        next();
    };

    listen = (port , cb) => {
        console.log(this.router.printRoutes());
        this.server.listen(port , () => cb());
    }
}

module.exports = {
    Omix
};