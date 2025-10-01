class OmixResponse {
    constructor(res) {
        this.rawRes = res;
        this.statusCode = 200;
    }

    status(code) {
        this.statusCode = code ;
        return this;
    }

    sendFile(filePath, contentType = "text/plain") {

    }

    send(data) {
        this.rawRes.writeHead(this.statusCode , { 'Content-Type' : 'text/plain' });
        this.rawRes.end(data);
        return this;
    }
}

module.exports = { OmixResponse };