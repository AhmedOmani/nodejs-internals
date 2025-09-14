const fs = require("fs/promises");
const path = require("node:path");
const { Buffer } = require("node:buffer");
const { createFile, deleteFile, renameFile, addToFile } = require('./fileOperations.js');

const startWatcher = async () => {
    //commands
    const CREATE_FILE = "create a file";
    const DELETE_FILE = "delete the file";
    const RENAME_FILE = "rename the file";
    const ADD_TO_FILE = "add to the file";

    //First we need to open the file to handle it.
    const fileHandler = await fs.open("./command.txt", "a+");

    const commandMap = {
        [CREATE_FILE]: (command) => {
            const filePath = command.substring(CREATE_FILE.length + 1);
            createFile(filePath);
        },
        [DELETE_FILE]: (command) => {
            const filePath = command.substring(DELETE_FILE.length + 1).trim();
            deleteFile(filePath);
        },
        [RENAME_FILE]: (command) => {
            const parts = command.split(" to ");
            if (parts.length === 2) {
                const oldPath = parts[0].substring(RENAME_FILE.length + 1).trim();
                const newPath = parts[1].trim();
                renameFile(oldPath , newPath);
            } else {
                console.error(`❌ Bad rename syntax. Use: rename the file <oldPath> to <newPath>`);
            }
        },
        [ADD_TO_FILE]: (command) => {
            const parts = command.split(" this content: ");
            if (parts.length === 2) {
                const filePath = parts[0].substring(ADD_TO_FILE.length + 1).trim();
                const content = parts[1].trim();
                addToFile(filePath , content);
            } else {
                console.error(`❌ Bad add to file syntax. Use: add to the file <filePath> this content: <content>`);
            }
        }
    }

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
        
        const command = buffer.toString("utf-8").trim();
        const commandPrefix = Object.keys(commandMap).find(prefix => command.startsWith(prefix));

        if (commandPrefix) {
            commandMap[commandPrefix](command);
        } else {
            console.error(`❌ Unknown command: ${command}`);
        }
    });

    //Start watching happens we want to track.
    const watcher = await fs.watch("./command.txt");
    
    for await (const event of watcher) {
        fileHandler.emit(event.eventType);
    }

}

if (require.main === module) {
    startWatcher();
}

module.exports = {
    startWatcher
}