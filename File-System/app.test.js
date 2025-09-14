const fs = require('fs/promises');
const path = require('node:path');
const { startWatcher } = require('./app.js'); 

describe('End-to-End Command Watcher', () => {
    const commandFile = path.resolve('./command.txt');

    // A small delay to ensure the file watcher has time to process
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // A function to write a command to the command file
    const writeCommand = async (command) => {
        await fs.writeFile(commandFile, command);
        await delay(500);
    };

    let watcherPromise;
    beforeAll(async () => {
        await fs.writeFile(commandFile, ''); 
        watcherPromise = startWatcher();
    });

    // --- E2E Test Cases ---
    test('should create a file from a command', async () => {
        const filePath = path.resolve('./e2e-test-file.txt');

        // 1. Write the command to the file
        await writeCommand('create a file e2e-test-file.txt');
        
        // 2. Check if the file was created
        const stats = await fs.stat(filePath);
        expect(stats.isFile()).toBe(true);

        // 3. Clean up the created file
        await fs.rm(filePath);
    });

    test("should rename a file from command", async () => {
        const oldPath = path.resolve("./old-e2e-name.txt");
        const newPath = path.resolve("./new-e2e-name.txt");

        await fs.writeFile(oldPath , "");
        await writeCommand(`rename the file old-e2e-name.txt to new-e2e-name.txt`);

        const newStats = await fs.stat(newPath);
        expect(newStats.isFile()).toBe(true);

        await expect(fs.stat(oldPath)).rejects.toThrow();

        await fs.rm(newPath);
    });

    test("should delete the file from command" , async () => {
        const filePath = "./deleted.txt";

        await fs.writeFile(filePath, "");
        await writeCommand("delete the file deleted.txt");

        await expect(fs.stat(filePath)).rejects.toThrow();
    });

    test("should add content to the file from command" , async () => {
        const filePath = "content.txt";
        await writeCommand("add to the file content.txt this content: Hola from jest tests!");

        const fileStats = await fs.stat(filePath);
        expect(fileStats.size).toBe(21);
    });

});