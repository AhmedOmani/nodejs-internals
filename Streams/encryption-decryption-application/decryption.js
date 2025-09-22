const { Transform } = require("node:stream");
const fs = require("node:fs/promises");

class Decryption extends Transform {
    _transform(chunk , encoding , callback) {
        console.log(chunk);
        for (let i = 0 ; i < chunk.length ; i++) {
            if (chunk[i] !== 255) chunk[i] = chunk[i] - 1;
        }
        callback(null , chunk);
    }
}

const decryptionLogic = async () => {
    const readFileHandler = await fs.open("write.txt" , "r");
    const writeFileHandler = await fs.open("read.txt" , "w");

    const readStream = readFileHandler.createReadStream();
    const writeStream = writeFileHandler.createWriteStream();

    const decrypt = new Decryption();

    readStream.pipe(decrypt).pipe(writeStream);
}

decryptionLogic();