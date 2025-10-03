const fs = require("node:fs/promises");
const path = require("node:path");

const mimeTypes = {
    '.html': 'text/html', // url: /index.html
    '.css': 'text/css',// url: /styles.css
    '.js': 'text/javascript', // url: /scripts.js
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
};

const static = (rootDir) => {
    return async (req , res , next) => {
        //Serve just GET & HEAD method for static files
        if (req.rawReq.method !== 'GET' && req.rawReq.method !== 'HEAD') {
            return next();
        }

        let requestPath = req.rawReq.url;

        //Special case for index.html file
        if (requestPath === "/") requestPath = "/index.html";

        // extracing the extension of the file to know the content-type.
        const fullPath = path.join(rootDir , requestPath);
        const ext = path.extname(fullPath).toLowerCase();
        const contentType = mimeTypes[ext] || "application/octet-stream";

        try {
            const stats = await fs.stat(fullPath);

            if (stats.isDirectory()) {
                return next();
            }
            
            res.sendFile(fullPath , contentType);

        } catch(error) {
            if (error.code === "ENOENT") {
                return next();
            }
            console.error("Static file serving error:" , error);
            res.status(500).send("Internal server error while reading static file.");
        }

    }
}

module.exports = {
    static
}