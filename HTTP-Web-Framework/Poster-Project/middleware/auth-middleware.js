const { pool, ensureSessionsTable, ensureUsersAndPostsTables } = require("../db");

const authenticate = async (req , res , next) => {
    const requestHeaders = req.headers();
    const cookieHeader = requestHeaders["cookie"];

    if (!cookieHeader) {
        console.warn("Authentication failed: No cookie headers provided.");
        return res.status(401).json({ error: "Unauthenticated" });
    }

    const tokenMatch = cookieHeader.split(";").find(c => c.trim().startsWith("token="));

    if (!tokenMatch) {
        console.warn("Authentication failed: 'token' not found in cookie header");
        return res.status(401).json({ error: "Unauthenticated" });
    }

    const token = tokenMatch.split("=")[1].trim();

    //First check if token stored in the database
    const result = await pool.query("SELECT user_id FROM sessions WHERE token = $1" , [token]);
    if (result.rowCount === 0) {
        return res.status(401).json({ error: "Unauthenticated" });
    }

    //Second fetch the user assigned to this token to fetch his data
    const session = result.rows[0];
    const {rows: userRow } = await pool.query("SELECT id , name , username FROM users WHERE id = $1" , [session.user_id]);
    if (userRow.length === 0) {
        return res.status(404).json({ error: "User not found"});
    }

    //Third assign the user data to the req object to access it in the next middleware/handler
    req.user = userRow[0] ;
    req.token = token;
    next();
};

module.exports = {
    authenticate
};