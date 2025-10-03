const http = require("node:http");
require("dotenv").config();

const PORT = process.env.PORT;

const Servers = [
    {host: "localhost" , port: process.env.FIRST_PORT},
    {host: "localhost" , port: process.env.SECOND_PORT}
];

const proxyServer = http.createServer();

proxyServer.on("request" , (clientRequest , proxyResponse) => {
    //choose the server using round-robin algorithm.
    const server = Servers.shift();
    Servers.push(server);

    //Proxy request that we will be hit the selected server.
    const proxyRequest = http.request({
        host: server.host,
        port: server.port,
        path: clientRequest.url,
        method: clientRequest.method,
        headers: clientRequest.headers
    });

    //listen to the response from the main server.
    proxyRequest.on("response" , (serverResponse) => {
        proxyResponse.writeHead(serverResponse.statusCode , serverResponse.headers);
        serverResponse.pipe(proxyResponse);
    });

    proxyRequest.on("error" , (err) => console.log(err));

    //write the body of client request to the body of the proxy server request.
    clientRequest.pipe(proxyRequest);
});

proxyServer.listen(PORT , () => {
    console.log(`Load Balancer is up on port ${PORT}!`);
});