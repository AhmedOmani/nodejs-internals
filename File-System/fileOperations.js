const fs = require("fs/promises");
const path = require("node:path");

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

const deleteFile = async (filePath) => {
    try {
        const absolutePath = path.resolve(filePath);
        await fs.rm(absolutePath);
        console.log(`${filePath} has been deleted successfully!`);
    } catch(error) {
        if (error.code === "ENOENT") {
            console.error(`Error: The file ${filePath} does not exist`);
        } else {
            console.error("Error occurred during file deletion: ", error.message);
        }
    }
};

const renameFile = async (oldPath, newPath) => {
    try {
        const oldAbsolutePath = path.resolve(oldPath);
        const newAbsolutePath = path.resolve(newPath);
        
        await fs.rename(oldAbsolutePath, newAbsolutePath);

        console.log(`Renamed ${oldPath} ---> ${newPath}`);
    } catch(error) {
        if (error.code === "ENOENT") { console.error(`Error: ${oldPath} does not exist`); }
        else if (error.code === "EEXIST") { console.error(`Error: ${newPath} already exists`); }
        else { console.error(`Error renaming file:`, error.message); }
    }
};

const addToFile = async (filePath, content) => {
    try {
        const absoluteFilePath = path.resolve(filePath);
        await fs.appendFile(absoluteFilePath, content);
        console.log(`Content added to ${filePath} successfully!`);
    } catch (error) {
        if (error.code === "ENOENT") {
            console.error(`Error: The file ${filePath} does not exist.`);
        } else {
            console.error(`Error adding content to file:`, error.message);
        }
    }
};

module.exports = {
  createFile,
  deleteFile,
  renameFile,
  addToFile
};