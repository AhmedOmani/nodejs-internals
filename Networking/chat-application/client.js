const net = require("node:net");
const readLine = require("readline/promises");

require("dotenv").config();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const readFromCommand = readLine.createInterface({
    input: process.stdin ,
    output: process.stdout
}); 

const clearLine = (dir) => {
    return new Promise((resolve, reject) => {
        process.stdout.clearLine(dir , () => resolve());
    })
};

const cleanUI = async () => {
    // UI cleaning for the console
    console.log();
    // move the cursor one line up
    await moveCursor(0 , -1);
    // clear that line that cursor just moved into
    await clearLine(0);
}

let id ;

const moveCursor = (dx , dy) => {
    return new Promise((resolve , reject) => {
        process.stdout.moveCursor(dx , dy , () => resolve());
    });
};

const socket = net.createConnection(PORT , HOST , async () => {
    
    const ASK = async () => {
        const message = await readFromCommand.question("Enter your message > ");
        await moveCursor(0 , -1);
        await clearLine(0);
        socket.write(`${id}-message-${message}`);
    }

    ASK();

    socket.on("data" , async (chunk) => {
        
        await cleanUI();

        const data = chunk.toString("utf-8");
        // id header is look like : "id-X" where X is a number
        if (data.startsWith("id-")) {
            id = data.substring(3);
            console.log(`User connected successfully with id ${id}`);
        } else {
            // log an empty line 
            console.log(data);
        }
        
        ASK();

    });
});

socket.on("end" , () => {
    console.log("Connection closed!");
    socket.write(Buffer.from(id.toString("utf-8")));
});
