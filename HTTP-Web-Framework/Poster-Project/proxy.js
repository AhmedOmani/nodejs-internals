const http = require("node:http");

const PORT = 7000;

const Servers = [
    {host: "localhost" , port: 7001}
    //{host: "localhost" , port: 7002}
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
    console.log("Load Balancer is up!");
});