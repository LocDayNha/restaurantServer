const JWT = require("jsonwebtoken");
const config = require("./config");

const checkToken = function (req, res, next) {
    const token = req.header("Authorization").split(" ")[1];
    if (token) {
        JWT.verify(token, config.SECRETKEY, async function (err) {
            if (err) {
                return res.status(400).json({ "status": false, "message": "Check Token That Bai" });
            } else {
                next();
            }
        });
    } else {
        return res.status(400).json({ "status": false, "message": "Check Token That Bai" });
    }
}

module.exports = checkToken;