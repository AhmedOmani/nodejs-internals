//TRIE IMPLEMENTATION FOR ROUTING SYSTEM.
class TrieNode {
    constructor(segment = "/") {
        this.segment = segment ;
        this.children = {};
        this.handler = {};
        this.isParam = false ;
        this.paramName = null;
    }
};

class OmixRouter {
    constructor() {
        this.root = new TrieNode();
    }

    addRoute(method , path , handler) {
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

        currentNode.handler[upperMethod] = handler; 
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
        
        const handler = currentNode.handler[upperMethod];

        if (handler) return {handler , params};

        return null;
    };
}

module.exports = {
    OmixRouter
};
