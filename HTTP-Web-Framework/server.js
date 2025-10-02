const { Omix } = require("./Omix-Framework/Omix.js");

const omix = new Omix();
/*
omix.get("/" , (req , res) => {
    res.status(200).sendFile("./public/index.html", "text/html");
});

omix.get("/styles.css" , (req , res) => {
    res.status(200).sendFile("./public/styles.css" , "text/css");
});

omix.get("/script.js" , (req , res) => {
    res.status(200).sendFile("./public/script.js" , "text/javascript");
});

omix.post("/upload" , async (req , res) => {
    const data = await req.body();
    console.log(data);
    res.status(201).send("User created successfully.");
});
*/
omix.get("/users/new" , (req , res) => {
    console.log("MATCHED: /users/new");
    // Should NOT have any parameters
    res.status(200).send(`Literal route matched. Params: ${JSON.stringify(req.params)}`);
});

omix.post("/users/:id" , async (req , res) => {
    const data = await req.body();
    console.log(data) ;
    res.status(201).send("User created successfully.");
});
/*
omix.get("/users/:id/posts/:postId" , async (req , res) => {
    console.log("/users/:id/posts/:postId");
    res.status(201).send("User created successfullyyyy.");
});
*/
omix.listen(3000 , () => {
    console.log("Omix server is up!");
});