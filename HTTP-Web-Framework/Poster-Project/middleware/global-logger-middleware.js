const globalLogger = (req , res , next) => {
    console.log(`[GLOBAL] ${req.rawReq.method} to ${req.rawReq.url}`);
    next();
};

module.exports = {
    globalLogger
}