const fs = require("fs");
const path = require("path");
const net = require("node:net");

const PORT = 3000;
const HOST = "172.31.41.80";

const UPLOADS_DIR = path.join(__dirname , "uploads");


(async () => {
    try {
        fs.mkdir(UPLOADS_DIR  , { recursive: true } , () => {
            console.log(`Uploads directory created at ${UPLOADS_DIR}`);
        });
    } catch(err) {
        console.error("Error creating uploads directory: " , err);
        process.exit(1);
    }
})();


const server = net.createServer((socket) => {
    console.log("New connection established.");
    console.time("Server Benchmarking: ");

    let receivedMetadate = false;
    let receivedBytes = 0;
    let totalSize = 0;
    let writeStream ;

    const cleanup = () => {
        socket.removeAllListeners();
        if (writeStream) {
            writeStream.removeAllListeners();
            writeStream = null;
        }
    };

    const handleData = (chunk) => {
        const canContinue = writeStream.write(chunk);
        if (!canContinue) {
            socket.pause();
        }
    }

    socket.on("data" , (chunk) => {
        if (!receivedMetadate) {
            const metadataEndIndex = chunk.indexOf("\n");
            if (metadataEndIndex === -1) {
                console.log("Protocol error: Metadata boundry not found\n");
                socket.end();
                return;
            }

            const metadataString = chunk.subarray(0 , metadataEndIndex);

            try {
                const metadata = JSON.parse(metadataString);
                const {filename , fileSize} = metadata;     
                console.log(`Receiving file: ${filename} , Size: ${fileSize} bytes`);   
                
                totalSize = fileSize;
                const filePath = path.join(UPLOADS_DIR , filename);
                writeStream = fs.createWriteStream(filePath);

                writeStream.on("drain" , () => {
                    socket.resume();
                });

                const fileData = chunk.subarray(metadataEndIndex + 1);

                if (fileData.length > 0) {
                    handleData(fileData);
                    receivedBytes += fileData.length;
                } 
                
                receivedMetadate = true;

            } catch(err) {
                console.error("Failed to parse metadata: " , err);
                socket.end();
                return;
            }

        } else {
            handleData(chunk);
            receivedBytes += chunk.length;
        }
    });

    socket.on("end" , () => {
        if (writeStream) {
            writeStream.end();
            console.log("\nFile transfer complete.");
        }
        console.log("Client disconnected");
        console.timeEnd("Server Benchmarking: ");
    });

    socket.on("error", (err) => {
        console.error("Socket error:", err);
        if (writeStream) {
            writeStream.end();
        }
        cleanup();
    });

    socket.on("close" , () => {
        if (writeStream && !writeStream.closed) writeStream.destroy();
        cleanup();
    });

});

server.listen(PORT , HOST , () => {
    console.log("Server is up!");
})