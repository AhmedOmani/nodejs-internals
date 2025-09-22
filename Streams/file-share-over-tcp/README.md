# File Share over TCP

## Problem Statement

**Goal:** Build a client and a server to transfer files over TCP.

> Extra points if you add a layer of encryption on top of that and if you can transfer multiple files at once. Once you have your implementation ready, give the client code and your IP address to a friend or a colleague, then ask them to send you some files! Hint: You could use mux/demux to receive multiple files at once.

## Solution Overview

This directory contains a Node.js implementation of a simple file sharing system over TCP. It includes both a server and a client that can send and receive files using raw TCP sockets.

### Features
- **File Transfer over TCP:**
  - The server listens for incoming connections and receives files sent by the client.
  - The client connects to the server and sends the contents of a file.
- **Multiple File Support:**
  - The implementation can be extended to support sending multiple files in sequence or with multiplexing.
- **Sample Files:**
  - `sample.txt` and `sample2.txt` are example files for transfer.
  - `received_sample.txt` and `received_sample2.txt` are files received by the server.

### How It Works
- **server.js:**
  - Starts a TCP server on a specified port.
  - Receives file data from the client and writes it to a file.
- **client.js:**
  - Connects to the server using TCP.
  - Reads a file and sends its contents to the server.

### How to Run
1. Open two terminals in this directory.
2. In the first terminal, start the server:
   ```bash
   node server.js
   ```
3. In the second terminal, run the client to send a file:
   ```bash
   node client.js
   ```
4. Check the output files (e.g., `received_sample.txt`) to verify successful transfer.

### Extending the Solution
- **Encryption:**
  - You can add encryption (e.g., using the `crypto` module) to secure file transfers.
- **Multiple Files:**
  - Implement a protocol or use a mux/demux library to send multiple files in a single connection.

---

*This project demonstrates basic file transfer over TCP using Node.js streams and sockets, and can be extended for more advanced use cases such as secure or multiplexed file sharing.*
