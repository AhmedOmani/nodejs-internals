const fs = require("fs/promises");
const { Buffer } = require("node:buffer");

(async () => {
    //commands
    const CREATE_FILE = "create a file";

    //First we need to open the file to handle it.
    const fileHandler = await fs.open("./command.txt");

    //Functions
    const createFile = async (filePath) => {
        try {
            const newFile = await fs.open(filePath, "wx");
            console.log(`Successfully created a new file at path ${filePath}`);
            await newFile.close();
        } catch(error) {
            if (error.code === "EEXIST") {
                console.error(`Error: The file ${filePath} already exists`);
            } else {
                console.error(`Error creating file at ${filePath}:`, error.message);
            }
        }
    };

    //Assign change event.
    fileHandler.on("change" , async () => {
        //Allocate a buffer with exact same size as the file size
        const size = (await fileHandler.stat()).size;
        const buffer = Buffer.alloc(size);

        //Assign options to choose where start to read.

        //Location where we want to start filling the buffer.
        const offset = 0;
        //How many bytes we want to read.
        const length = buffer.byteLength;
        //Where we will start reading from the file.
        const position = 0 ;

        //Read the content.
        await fileHandler.read(buffer , offset , length, position);
        
        const command = buffer.toString("utf-8");
        
        if (command.includes(CREATE_FILE)) {
            const filePath = command.substring(CREATE_FILE.length + 1);
            createFile(filePath);
        }

    });

    //Start watching happens we want to track.
    const watcher = await fs.watch("./command.txt");
    
    for await (const event of watcher) {
        const eventType = event.eventType; // ["change" , "rename" , "delete" , ...]
        fileHandler.emit(eventType);
    }

})();