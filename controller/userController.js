const { StatusCodes } = require('http-status-codes')
const User = require('../model/userModel')

//read all
const readAll = async (req,res) => {
    try {
        let userslist = await User.find({})
        let users = userslist.filter((item) => item.role !== "admin")
        return res.status(StatusCodes.OK).json({length : users.length, users, success: true})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err.message, success: false})
    }
}

//read single
const readSingle = async (req,res) => {
    try {
        let id = req.params.id
        let single = await User.findById(id)
            if(!single)
                return res.status(StatusCodes.CONFLICT).json({msg : `requested emailid not found` , success: false})
        res.status(StatusCodes.OK).json({user : single, success : true})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err.message, success: false})
    }
}

//update user
const updateUser = async (req,res) => {
    try {
        let id = req.params.id
        let single = await User.findById(id)
        if(!single)
            return res.status(StatusCodes.CONFLICT).json({msg : `requested emailid not found` , success: false})

        if(single.role === "admin")
            return res.status(StatusCodes.FORBIDDEN).json({msg : `Un-authorised update entry ..denied`, success: false})
        if(req.body.password)
            return res.status(StatusCodes.CONFLICT).json({msg : `password cannot be updated... access denied`, success: false})

            await User.findByIdAndUpdate({ _id: id }, req.body)
        res.status(StatusCodes.ACCEPTED).json({ msg : 'user info successfuly updated', success : true})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err.message, success: false})
    }
}

//delete user
const deleteUser = async (req,res) => {
    try {
        let id = req.params.id
        let single = await User.findById(id)
        if(!single)
            return res.status(StatusCodes.CONFLICT).json({msg : `requested emailid not found` , success: false})

        await User.findByIdAndDelete({ _id: id })
        res.status(StatusCodes.OK).json({msg : 'user info successfully deleted', success: true})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err.message, success: false })
    }
}

module.exports = {readAll, readSingle, updateUser, deleteUser}