# Uploader Application

A simple file uploader using Node.js `net` module for TCP networking. This application consists of a client and server for transferring files over a TCP connection.

## Files
- `server.js`: TCP server that receives files from clients.
- `client.js`: TCP client that uploads files to the server.

## Usage

### 1. Prerequisites
- Node.js installed on both client and server machines.

### 2. Server Setup
1. On your AWS machine, copy both `server.js` and `client.js` to a directory.
2. Open port 3000 in your AWS security group settings.
3. Start the server:
   ```bash
   node server.js
   ```

### 3. Client Setup
1. On your local machine, ensure `client.js` is present.
2. Edit the IP address in `client.js` to match your AWS server's public IP 
3. Run the client:
   ```bash
   node client.js
   ```
4. Enter the path to the file you want to upload when prompted.

## Notes
- The client displays upload progress and benchmarking information.
- The server must be running before starting the client.
- Both files use only Node.js built-in modules (`net`, `fs`, `path`).

## Security
- This is a basic demo and does not implement authentication or encryption. Use only in trusted environments.
