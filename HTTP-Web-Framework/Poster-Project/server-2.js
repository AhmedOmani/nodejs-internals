const { Omix } = require("../Omix-Framework/Omix");
const { pool, ensureSessionsTable, ensureUsersAndPostsTables } = require("./db");

// Data now comes from Postgres

const omix = new Omix();

//Public-Static files
omix.get("/" , (req , res) => {
    res.status(200).sendFile("./public/index.html" , "text/html");
});
omix.get("/login" , (req , res) => {
    res.status(200).sendFile("./public/index.html" , "text/html");
});
omix.get("/profile" , (req , res) => {
    res.status(200).sendFile("./public/index.html" , "text/html");
});
omix.get("/styles.css" , (req , res) => {
    res.status(200).sendFile("./public/styles.css" , "text/css");
});
omix.get("/scripts.js" , (req , res) => {
    res.status(200).sendFile("./public/scripts.js" , "text/javascript");
});

//APIs 


//update user profile


//LOGOUT
omix.delete("/api/logout" , async (req , res) => {

});
omix.listen(7002 , async () => {
    await ensureSessionsTable();
    await ensureUsersAndPostsTables();
    console.log("Omix Server 2 is UP!");
});