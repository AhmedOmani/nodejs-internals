const { Omix } = require("../Omix-Framework/Omix");

//MOCK DATABASE
const USERS = [
    {id: 1 , name: "Ahmed Saber" , username: "Omani" , password: "123"},
    {id: 2 , name: "Ahmed Ali"   , username: "lolo" ,  password: "123"},
    {id: 3 , name: "Joseph" , username: "joseph" ,     password: "123"},
];
const POSTS = [
    {
        id: 1 ,
        title: "Adele Song" ,
        body: "Hola from the other side",
        userId: 1
    },
    {
        id: 2 ,
        title: "TikTok music" ,
        body: "Fall in love again and again",
        userId: 2
    }
];

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

//send list of all posts
omix.get("/api/posts", (req , res) => {
    const posts = POSTS.map((post) => {
        const user = USERS.find((user) => user.id === post.userId);
        post.author = user.name;
        return post;
    });
    res.status(200).json(posts);
});
//user authentication login
omix.post("/api/login" , async (req , res) => {
    const data = await req.body();
    const user = USERS.find((user) => user.username === data.username && user.password === data.password);
    if (!user) {
        res.status(401).json({
            error: "Username or Password is incorrect"
        });
    }
    res.status(200).json({
        message: "User logged in successfully"
    });
});
omix.get("/api/user" , (req , res) => {

});

omix.listen(3000 , () => {
    console.log("Omix Server is UP!");
});