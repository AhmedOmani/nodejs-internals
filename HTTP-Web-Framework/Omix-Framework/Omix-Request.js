class OmixRequest {
    constructor(req, params , searchUrls) {
        this.rawReq = req ;
    }

    headers() {
        return this.rawReq.headers ;
    }

    body() {
        return new Promise((resolve , reject) => {
            let data = "";
            this.rawReq.on("data" , (chunk) => data += chunk.toString());
            this.rawReq.on("error" , (err) => reject(err));
            this.rawReq.on("end" , () => {
                const contentType = this.rawReq.headers["content-type"] || "";
                try {
                    if (contentType.includes("application/json")) {
                        resolve(JSON.parse(data || '{}'));
                    } else {
                        resolve(data);
                    }
                } catch(err) {
                    reject(new Error("Invalid JSON body received"));
                }
            }); 
        });
    }
}

module.exports = {
    OmixRequest
}