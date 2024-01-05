//decrypt the user id fro authToken received by headers authorization
const { StatusCodes } = require("http-status-codes")
const jwt = require("jsonwebtoken")

const auth = async(req,res,next) => {
    try {
        //read the token from headers auth 2.0
        let token = req.header('Authorization')
            if(!token)
                return res.status(StatusCodes.NOT_FOUND).json({ msg : `Token Not found`})

                //verifying token
                await jwt.verify(token, process.env.ACCESS_SECRET, (err,data) =>{
                    if(err)
                    return res.status(StatusCodes.UNAUTHORIZED).json({msg : `Unauthorized token`})

                        //res.json({data}) //id
                    //stoer id in req. variable
                    req.userID = data.id

                    //continue to next controller
                    next()


                } )
      //  res.json( {token})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err})
    }
}

module.exports = auth