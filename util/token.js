// jsonwebtoken

const jwt = require('jsonwebtoken')

const createAccessToken = (userid) => {
    //jwt.sign(id, secret token, optionals) expiresIn = 60, '2 days', "10h", "2d"
    
    return jwt.sign(userid, process.env.ACCESS_SECRET, {expiresIn : '1d'})
}

module.exports = createAccessToken