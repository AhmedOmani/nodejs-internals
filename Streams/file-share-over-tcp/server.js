const net = require('net');
const fs = require('fs');
const path = require('path');
const { Transform , Writable } = require('stream');
const crypto = require("crypto");

const PORT = 3000;
const HOST = 'localhost';

const server = net.createServer((socket) => {
    console.log('Client connected.');

    // Custom transform stream to parse file headers
    class FileDemuxer extends Transform {
        constructor(options) {
            super(options);
            this.state = 'reading_header';
            this.buffer = Buffer.alloc(0);
            this.currentFile = null;
            this.bytesLeft = 0;
            this.fileWriteStream = null;
        }

        _transform(chunk, encoding, callback) {
            this.buffer = Buffer.concat([this.buffer, chunk]);
            this.processBuffer(callback);
        }

        processBuffer(callback) {
            while (true) {
                if (this.state === 'reading_header') {
                    if (this.buffer.length >= 4) {
                        const headerSize = this.buffer.readUInt32BE(0);
                        this.buffer = this.buffer.slice(4);

                        if (this.buffer.length >= headerSize) {
                            const headerJson = this.buffer.slice(0, headerSize).toString('utf-8');
                            this.buffer = this.buffer.slice(headerSize);
                            try {
                                this.currentFile = JSON.parse(headerJson);
                                console.log(`Receiving file: ${this.currentFile.fileName} (${this.currentFile.fileSize} bytes)`);
                                this.bytesLeft = this.currentFile.fileSize;
                                this.fileWriteStream = fs.createWriteStream(path.join(__dirname, `received_${this.currentFile.fileName}`));
                                this.state = 'reading_file';
                            } catch (e) {
                                console.error('Failed to parse header:', e.message);
                                return callback(e);
                            }
                        } else {
                            return callback();
                        }
                    } else {
                        return callback();
                    }
                } else if (this.state === 'reading_file') {
                    if (this.buffer.length > 0) {
                        const bytesToWrite = Math.min(this.buffer.length, this.bytesLeft);
                        const dataToWrite = this.buffer.slice(0, bytesToWrite);

                        this.push(dataToWrite);

                        if (this.fileWriteStream) {
                            this.fileWriteStream.write(dataToWrite);
                        }

                        this.buffer = this.buffer.slice(bytesToWrite);
                        this.bytesLeft -= bytesToWrite;

                        if (this.bytesLeft <= 0) {
                            console.log(`Successfully received file: ${this.currentFile.fileName}`);
                            if (this.fileWriteStream) this.fileWriteStream.end();
                            this.currentFile = null;
                            this.state = 'reading_header';
                        }
                    } else {
                        return callback();
                    }
                }
            }
        }

        _flush(callback) {
            if (this.fileWriteStream) {
                this.fileWriteStream.end();
            }
            callback();
        }
    }

    const demuxer = new FileDemuxer();
    const dummySink = new Writable({
        write(chunk, encoding, callback) {
            callback();
        }
    });

    // The main pipeline: socket -> demuxer -> fileWriteStream (dynamically created)
    socket.pipe(demuxer).pipe(dummySink);

    socket.on('end', () => {
        console.log('Client disconnected.');
    });

    socket.on('error', (err) => {
        console.error('Socket error:', err.message);
    });
});

server.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST}:${PORT}`);
});