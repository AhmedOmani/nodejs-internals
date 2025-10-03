const { Omix } = require("../Omix-Framework/Omix");
const { pool, ensureSessionsTable, ensureUsersAndPostsTables } = require("./db");
const { authenticate } = require("./middleware/auth-middleware");

// Data now comes from Postgres

const omix = new Omix();

//GLOBAL middleware
const globalLogger = (req , res , next) => {
    console.log(`[GLOBAL] ${req.rawReq.method} to ${req.rawReq.url}`);
    next();
};
omix.use(globalLogger);

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

//-------- AUTH APIs ---------

//user authentication login
omix.post("/api/login" , async (req , res) => {
    console.log("Server 1 receive this request: /api/login");

    const data = await req.body();
    //Check if user exist or not
    const { rows } = await pool.query("SELECT id FROM users WHERE username = $1 AND password = $2", [data.username, data.password]);
    const user = rows[0];
    if (!user) {
        return res.status(401).json({
            error: "Username or Password is incorrect"
        });
    }

    //if user exist we start authentication flow
    const token = Math.floor(Math.random() * 10000000000).toString();
    await pool.query("INSERT INTO sessions(token, user_id) VALUES($1, $2) ON CONFLICT (token) DO NOTHING", [token, user.id]);
    
    res.setHeader("Set-Cookie" , `token=${token}; Path=/;`)
        .status(200)
        .json({
            message: "User logged in successfully"
        });
});
//user logout
omix.delete("/api/logout", authenticate , async (req , res) => {
    const userId = req.user.id;
    const token = req.token;
    try {
        await pool.query("DELETE FROM sessions WHERE user_id = $1 AND token = $2", [userId, token]);
        res.status(200).json({ message: "Logged put successfully"});
    } catch(err) {
        console.error("Error during logout:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//-------- POSTS APIs --------

//send list of all posts
omix.get("/api/posts", authenticate , async (req , res) => {
    console.log("Server 1 receive this request: /api/posts");
    const { rows } = await pool.query(
        `SELECT p.id, p.title, p.body, p.user_id, u.name AS author
         FROM posts p
         JOIN users u ON u.id = p.user_id`
    );
    res.status(200).json(rows.map(r => ({ id: r.id, title: r.title, body: r.body, userId: r.user_id, author: r.author })));
});
//create new post
omix.post("/api/posts" , authenticate , async (req , res) => {
    const data = await req.body();

    //grab required data to save into db.
    const {title , body} = data;
    const userId = req.user.id;
    
    //save the post to the database
    await pool.query("INSERT INTO posts(title , body , user_id) VALUES($1 , $2 , $3)" , [title , body , userId]);

    res.status(201).json({
        message: "Post has created successfully."
    });

});

//------- USER APIs --------
//get user 
omix.get("/api/user" , authenticate , async (req , res) => {
    console.log("Server 1 receive this request: GET /api/user");
    const user = req.user;
    res.status(200).json({ id: user.id, username: user.username , name: user.name,  });
});
//update user profile
omix.put("/api/user" , authenticate , async (req , res) => {
    console.log("Server 1 receive this request: PUT /api/user");
    const data = await req.body();
    const {name , username , password} = data;
    const userId = req.user.id;

    if (!name || !username || !password) {
        return res.status(404).json({
            message: "You have to send all required data"
        });
    }

    const { rows } = await pool.query(`UPDATE users SET name = COALESCE($1 , name) , username = COALESCE($2, username),password = COALESCE($3, password) WHERE id = $4 RETURNING *;`, [name , username , password , userId]);
    //Not logical case because i already have an id for the current user session , but just for proper handling.
    if (rows.length === 0) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    res.status(200).json({
        message: "User profile updated successfully",
        data: {
            name: rows.name,
            username: rows.username,
        }
    });

});

omix.listen(7001 , async () => {
    await ensureSessionsTable();
    await ensureUsersAndPostsTables();
    console.log("Omix Server 1 is UP!");
});