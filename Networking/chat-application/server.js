const net = require("node:net")

const PORT = 3000;
const HOST = "172.31.41.80";

const server = net.createServer();  
const clients = [];


server.on("connection" , (socket) => {
    console.log("New connection to the server");
    const clientId = clients.length + 1;

    //Notify all room that new user is joined!
    clients.map((client) => {
        if (client.id !== clientId) client.socket.write(`User ${clientId} is joind the room!`);
    });
    //Send the id for the specific client
    socket.write(`id-${clientId}`);

    socket.on("data" , (chunk) => {
        const data = chunk.toString();
        const [id , msg] = data.split("-message-");
        clients.map((client) => client.socket.write(`User ${id}: ${msg}`));   
    });
    
    socket.on("end" , () => {
        console.log(`User ${clientId} disconnected`);
        clients.splice(clients.indexOf(socket) , 1);
        //Notify all room that a user is left!
        clients.map((client) => {
            if (client.id !== clientId) client.socket.write(`User ${clientId} has left the room!`);
        });
    });
    
    clients.push({id: clientId.toString() , socket});
});

server.listen(PORT , HOST , () => {
    console.log(`Server is up!\n`, server.address());
});
