const { Readable } = require("node:stream");
const fs = require("node:fs");

class ReadStream extends Readable {
    constructor({highWaterMark , fileName}) {
        super({highWaterMark});
        this.filePath = fileName;
        this.fileDescriptor = null;
    }

    _construct(callback) {
        fs.open(this.filePath , "r" , (err , fd) => {
            if (err) callback(err);
            this.fileDescriptor = fd ;
            callback();
        });
    }

    _read(size) {
        const buffer = Buffer.alloc(size);
        fs.read(this.fileDescriptor , buffer , 0 , size , null , (err , bytesRead) => {
            if (err) return this._destroy(err);
            this.push(bytesRead > 0 ? buffer.subarray(0 , bytesRead) : null);
        })
    }
    
    _destroy(error , callback) {
        if (this.fileDescriptor)
            fs.close(this.fileDescriptor , (err) => callback(err || error));
        else 
            callback(error);
    }
}

const stream = new ReadStream({fileName: "src.txt"});

stream.on("data" , (chunk) => {
    console.log(chunk.toString());
});

stream.on("end" , () => {
    console.log("DONE");
});