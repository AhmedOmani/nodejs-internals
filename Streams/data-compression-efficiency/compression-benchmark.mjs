import fs from "fs";
import zlib from "zlib";
import { pipeline } from "stream/promises"
import { Writable } from "stream";
import path from "path";

function formatMB(Bytes) { return (Bytes / (1024 * 1024)).toFixed(2); }
function formatMs(nanoSeconds) { return Number(ns / 1_000_000n).toFixed(2); }

async function benchmarkJob({algo , makeCompressor , filePath}) {
    const fileStat = await fs.promises.stat(filePath);
    const fileSize = fileStat.size;

    const readStream = fs.createReadStream(filePath);
    const compressor = makeCompressor();
    const writeStream = new CountingChunksStream();

    const startTime = process.hrtime.bigint();
    await pipeline(readStream , compressor , writeStream);
    const endTime = process.hrtime.bigint();

    const elapsedTime = endTime - startTime;
    const elapsedTimeMs = Number(elapsedTime) / 1e6;
    const compressionOutSize = writeStream.bytes;
    const ratio = compressionOutSize / fileSize ;
    const throughputMBs = ( (fileSize / (1024 * 1024)) / (elapsedTimeMs / 1000) );

    return {
        algo,
        level: compressor.params?.quality ?? compressor._level ?? "",
        fileSize,
        compressionOutSize,
        ratio,
        elapsedTimeMs,
        throughputMBs
    };
}
class CountingChunksStream extends Writable {
    constructor() {
        super();
        this.bytes = 0;
    }
    _write(chunk , encoding, callback) {
        this.bytes += chunk.length;
        callback();
    }
}

function brotliCompressor(quality = 6) {
    return zlib.createBrotliCompress({
        params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: quality
        }
    });
}
function gzipCompressor(level = 6) {
    // Gzip level: 0...9 (9 - slowest/best compression)
    return zlib.createGzip({ level });
}
function deflateCompressor(level = 6) {
    return zlib.createDeflate({ level });
}

async function main() {
    // Create src.txt file in the same directory and make it with atleaset 500MB --> 1GB
    // Command-Line for generating random file : <base64 /dev/urandom | head -c 104857600 > sample.txt>
    const filePath = process.argv[2];
    if (!filePath || !fs.existsSync(filePath)) {
        console.error("Usage: node compression-benchmark.mjs <filePath>");
        process.exit(1);
    }

    const jobs = [
        {algo: "brotli q=5" , makeCompressor: () => brotliCompressor(6), filePath},
        {algo: "gzip l=5", makeCompressor: () => gzipCompressor(6), filePath },
        {algo: "deflate l=5", makeCompressor: () => deflateCompressor(6), filePath }        
    ];
    /*
        
        
    */
    const results = [];
    for (const job of jobs) {
        try {
            const process = await benchmarkJob(job);
            console.log("lol");
            results.push(process);
        } catch(err) {
            results.push({algo: job.algo , error: err.message})
        }
    }

    console.log("\nCompression benchmark:", path.basename(filePath));
    console.log("--------------------------------------------------------------------------");
    console.log(["Algorithm", "Out (MB)", "Ratio", "Time (ms)", "Throughput (MB/s)"].join("\t"));
    for (const r of results) {
        if (r.error) {
            console.log(`${r.algo}\tERROR: ${r.error}`);
            continue;
        }
        console.log([
            r.algo,
            formatMB(r.compressionOutSize),
            r.ratio.toFixed(3),
            r.elapsedTimeMs.toFixed(2),
            r.throughputMBs.toFixed(2)
        ].join("\t\t"));
    }
    console.log("--------------------------------------------------------------------------");
}

main();