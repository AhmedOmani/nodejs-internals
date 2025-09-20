const { Writable } = require("node:stream");
const fs = require("fs/promises");

class WriteStream extends Writable {

    constructor({highWaterMark , fileName}) {
        super({highWaterMark});
        this.filePath = fileName;
        this.fileDescriptor = null;
        this.chunks = [];
        this.chunksSize = 0;
        this.writeCount = 0;
    }   

    async _construct(callback) {
        try {
            this.fileDescriptor = await fs.open(this.filePath , "w");
            console.log("File opened.");
            callback();
        } catch (err) {
            callback(err);
        } 
    }

    async _write(chunk , encoding , callback) {
        this.chunks.push(chunk);
        this.chunksSize += chunk.length;

        if (this.chunksSize < this.writableHighWaterMark) return callback();

        try {
            await this.fileDescriptor.write(Buffer.concat(this.chunks));
            this.chunks = [];
            this.chunksSize = 0;
            this.writeCount += 1;
            callback();
        } catch (error) {
            callback(error);
        }
    }

    async _final(callback) {
        if (this.chunksSize > 0) {
            try {
                await this.fileDescriptor.write(Buffer.concat(this.chunks));
                console.log("Done!");
                this.writeCount += 1;
                callback();
            } catch(error) {
                callback(error);
            }
        }
    }

    async _destroy(error , callback) {
        console.log("Number of write: " , this.writeCount);
        if (this.fs) {
            try {
                await this.fileDescriptor.close();
                callback(error);
            } catch (err) {
                callback(err || error);
            }
        }
    }

}

async function main() {
    const stream = new WriteStream({highWaterMark: 16 * 1024 , fileName: "writable-stream.txt"});
    let i = 0;

    const flush = () => {
        while (i < 10000000) {
            const buffer = Buffer.from(`${i}\n`);
            if (!stream.write(buffer)) return ;
            i++;
        }
        stream.end();
    }

    flush();
    stream.on("drain" , () => {
        flush() 
    });

    stream.on("finish" , () => {
        console.log("All write are now complete!");
    });

}

main();