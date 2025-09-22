const { Transform } = require("node:stream");
const fs = require("node:fs/promises");

class Encryption extends Transform {
    _transform(chunk , encoding , callback) {
        for (let i = 0 ; i < chunk.length ; i++) {
            if (chunk[i] !== 255) chunk[i] = chunk[i] + 1;
        }
        callback(null , chunk);
    }
}

const encryptionLogic = async () => {
    const readFileHandler = await fs.open("read.txt" , "r");
    const writeFileHandler = await fs.open("write.txt" , "w");

    const readStream = readFileHandler.createReadStream();
    const writeStream = writeFileHandler.createWriteStream();

    const encrypt = new Encryption();

    readStream.pipe(encrypt).pipe(writeStream);
}

encryptionLogic();