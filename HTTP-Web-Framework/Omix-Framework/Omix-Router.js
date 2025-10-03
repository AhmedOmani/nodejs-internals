//TRIE IMPLEMENTATION FOR ROUTING SYSTEM.
class TrieNode {
    constructor(segment = "/") {
        this.segment = segment ;
        this.children = {};
        this.handlers = {};
        this.isParam = false ;
        this.paramName = null;
    }
};

class OmixRouter {
    constructor() {
        this.root = new TrieNode();
    }

    addRoute(method , path , handler, middleware = []) {
        // eg. users/:id/posts
        // segments = ['users' , ':id' , 'posts']
        const segments = path.split("/").filter(s => s.length > 0);
        let currentNode = this.root ;
        const upperMethod = method.toUpperCase();

        //each segement is one low level before the last segment
        //  users 
        //  |_____:id => {isParam: true , paramName: id}
        //           |_____ posts
        //NOTE: Each level is allow for just one dynamic parameter for ambiguty purposes.

        for (const segment of segments) {
            let nextNode = currentNode.children[segment];
            if (!nextNode) {
                if (segment.startsWith(":")) {
                    let existingParamNode = Object.values(currentNode.children).find(node => node.isParam);
                    if (existingParamNode) {
                        nextNode = existingParamNode
                    } else {
                        nextNode = new TrieNode(segment);
                        currentNode.children[segment] = nextNode ;
                        nextNode.isParam = true;
                        nextNode.paramName = segment.substring(1);
                    }
                } else {
                    nextNode = new TrieNode(segment);
                    currentNode.children[segment] = nextNode;
                }
            }
            currentNode = nextNode;
        }

        currentNode.handlers[upperMethod] = {
            handler: handler,
            middleware: middleware
        }; 
    };

    matchRoute(method , path) {
        const segments = path.split("/").filter(s => s.length > 0);
        let currentNode = this.root;
        const params = {};
        const upperMethod = method.toUpperCase();

        for (const segement of segments) {
            let nextNode = currentNode.children[segement];

            if (nextNode) {
                currentNode = nextNode;
                continue;
            }

            const paramNode = Object.values(currentNode.children).find(node => node.isParam);

            if (paramNode) {
                params[paramNode.paramName] = segement;
                currentNode = paramNode;
                continue ;
            }

            return null;
        }  
        
        const routeData = currentNode.handlers[upperMethod];

        if (routeData) {
            return {
                handler: routeData.handler,
                params,
                middleware: routeData.middleware
            }
        }
        return null;
    };

    printRoutes() {
        const routes = [];
        console.log("\n--- Omix Defined Routes ---");
        
        this._traverseTrie(this.root, "", routes);

        routes.sort((a, b) => {
            if (a.method < b.method) return -1;
            if (a.method > b.method) return 1;
            if (a.path < b.path) return -1;
            if (a.path > b.path) return 1;
            return 0;
        });

        routes.forEach(route => {
            const handlersCount = 1 + route.middlewareCount;
            const handlerText = handlersCount === 1 ? 'handler' : 'handlers';
            console.log(`[${route.method.padEnd(6)}] ${route.path.padEnd(30)} (${handlersCount} ${handlerText})`);
        });
        console.log("---------------------------\n");
    };


    _traverseTrie(node, currentPath, routes) {

        if (Object.keys(node.handlers).length > 0) {
            for (const method in node.handlers) {
                const routeData = node.handlers[method];
                routes.push({
                    method: method,
                    path: currentPath || '/', 
                    middlewareCount: routeData.middleware.length
                });
            }
        }

        for (const segment in node.children) {
            const childNode = node.children[segment];
            const nextPath = (currentPath ? currentPath : "") + "/" + childNode.segment;
            this._traverseTrie(childNode, nextPath, routes);
        }
    }
}

module.exports = {
    OmixRouter
};
