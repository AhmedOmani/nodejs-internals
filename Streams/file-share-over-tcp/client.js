const net = require('net');
const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');

const client = new net.Socket();

const PORT = 3000;
const HOST = 'localhost';

const filesToSend = [
    'sample.txt',
    'sample2.txt'
];

client.connect(PORT, HOST, async () => {
    console.log('Connected to server.');
    for (const fileName of filesToSend) {
        await sendFile(client, fileName);
    }
    client.end();
});

client.on('error', (err) => {
    console.error('Client error:', err.message);
});

async function sendFile(socket, fileName) {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, fileName);

        if (!fs.existsSync(filePath)) {
            console.error(`File not found ${filePath}`);
            return resolve();
        }

        const fileStat = fs.statSync(filePath);
        const readStream = fs.createReadStream(filePath);

        const header = JSON.stringify({
            fileName: path.basename(filePath),
            fileSize: fileStat.size
        });

        const headerBuffer = Buffer.from(header, 'utf-8');
        const headerSizeBuffer = Buffer.alloc(4);
        headerSizeBuffer.writeUInt32BE(headerBuffer.length, 0);

        socket.write(headerSizeBuffer);
        socket.write(headerBuffer);

        readStream.pipe(socket, { end: false });

        readStream.on('end', () => {
            console.log(`Finished sending file: ${fileName}`);
            resolve();
        });

        readStream.on('error', (err) => {
            console.error('File read error:', err.message);
            reject(err);
        });
    });
};
