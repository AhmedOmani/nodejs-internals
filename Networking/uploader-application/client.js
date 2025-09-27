const { stat } = require("fs/promises");
const fs = require("node:fs");
const path = require("path");
const net = require("net");
const readLine = require("readline/promises");

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

const clearLine = (dir) => {
    return new Promise((resolve, reject) => {
        process.stdout.clearLine(dir , () => resolve());
    })
};

const moveCursor = (dx , dy) => {
    return new Promise((resolve , reject) => {
        process.stdout.moveCursor(dx , dy , () => resolve());
    });
};

const uploadFile = async (filePath) => {

    console.time("Client Benchmarking: ");
    const fullPath = path.resolve(filePath);
    const stats = await stat(fullPath);
    const filename = path.basename(fullPath);
    const fileSize = stats.size;
    let uploadedBytes = 0 ;
    let lstPercentage = 0 ;

    const socket = net.createConnection(3000 , "16.171.170.81" , () => {
        console.log("Connection created, sending metadata...");
        //Sending metadata before acual file.
        const metdata = JSON.stringify({filename , fileSize});
        socket.write(metdata + "\n");
    });

    socket.on("connect" ,  () => {
        //After sending metadata , send the acual file.
        const readStream = fs.createReadStream(fullPath);
        readStream.on("data" , async (chunk) => {
            uploadedBytes += chunk.length;
            //Calculate percentage
            const percentage = ((uploadedBytes / fileSize) * 100).toFixed(0);
            if (percentage !== lstPercentage) {
                lstPercentage = percentage;
                await moveCursor(0 , -1);
                await clearLine(0);
                process.stdout.write(`Uploading... ${percentage}% \n`);
            }
            
        });
        readStream.pipe(socket);
    });

    socket.on("end" , () => {
        process.stdout.write("\n"); 
        socket.end();
        rl.close();
        console.timeEnd("Client Benchmarking: ");
        console.log("File treansfer complete.");
    });

    socket.on("error" , (err) => {
        console.error("Socket error: " , err);
        socket.destroy();
    });
}

const main = async () => {
    const filePath = await rl.question("Please specify the path of the file > ");
    uploadFile(filePath);
} 

main();

