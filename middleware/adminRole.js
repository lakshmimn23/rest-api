const { StatusCodes } = require("http-status-codes")
const User = require('../model/userModel')

const adminAuth = async(req,res, next) => {
    try {
        let userId = req.userID
        let extUser = await User.findById(userId)

        //validate user
        if(!extUser)
            return res.status(StatusCodes.CONFLICT).json({msg : `requested user infi not exists`, success: false})

        if(extUser.role !== "admin")
            return res.status(StatusCodes.UNAUTHORIZED).json({msg : `Un-authorized requested...access denied`, success: false})
        
        next()
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg:err.message, success: false})
    }
}

module.exports = adminAuth