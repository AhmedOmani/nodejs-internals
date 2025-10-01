const { Omix } = require("./Omix-Framework/Omix.js");

const omix = new Omix();

omix.get("/" , (req , res) => {
    res.status(201).send("Hola");
});

omix.post("/upload" , async (req , res) => {
    const data = await req.body();
    console.log(data);
    res.status(201).send("User created successfully.");
});

omix.listen(3000 , () => {
    console.log("Omix server is up!");
});