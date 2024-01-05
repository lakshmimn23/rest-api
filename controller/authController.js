const { StatusCodes } = require('http-status-codes')
const bcrypt = require('bcryptjs')
const User = require('../model/userModel')
const comparePassword = require('../util/password')
const createAccessToken = require('../util/token')
const jwt = require('jsonwebtoken')
const reset_password = require('../template/gen_password')
const mailConfig = require('../util/mail.config')

const authController = {
    register: async(req,res) => {
        try {
            const { name, email, mobile, password } = req.body
            //email and mobile validate to avoid duplicates
            const extEmail = await User.findOne({email})
            const extMobile = await User.findOne({mobile})

            //point the duplicate, any server response error 409
            if(extEmail)
                return res.status(StatusCodes.CONFLICT).json({msg : `${email} already exists`})
            if(extMobile)
                return res.status(StatusCodes.CONFLICT).json({msg : `${mobile} already exists`})

            //encrypt the password into hash
            const encPass = await bcrypt.hash(password,10);

            //adding data to db collection
            let data = await User.create({
                name,
                email,
                mobile,
                password: encPass
            })
            res.status(StatusCodes.ACCEPTED).json({msg: 'New user is created', user:data})
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg : err.message})
        }
    },
    login: async(req,res) => {
        try {
            const {email, mobile, password} = req.body

            //if login through email
            if(email) {
                let extEmail = await User.findOne( {email })
                if(!extEmail)
                    return res.status(StatusCodes.CONFLICT).json( { msg : `${email} is not registered`})
                let isMatch = await comparePassword(password, extEmail.password)
                    if(!isMatch)
                        return res.status(StatusCodes.UNAUTHORIZED).json({msg : `Passwords are not matched`})
     
                //generate access token 
                let authToken = createAccessToken({ id : extEmail._id})    

                //set the token in cookie
                res.cookie('loginToken', authToken, {
                    httpOnly: true,
                    signed: true,
                    path: `/api/auth/token`,
                    maxAge: 1 * 24 * 60 * 60 * 1000
                })

                    res.status(StatusCodes.OK).json({msg : `login success(email)`, authToken})
            }
            //if login through mobile
            if(mobile){
                let extMobile = await User.findOne( {mobile})
                if(!extMobile)
                    return res.status(StatusCodes.CONFLICT).json(  { msg: `${mobile} is not registered` })
                let isMatch = await comparePassword(password, extMobile.password)
                    if(!isMatch)
                        return res.status(StatusCodes.UNAUTHORIZED).json( { msg : `Passwords are not matched` })
                //generate access token 
                let authToken = createAccessToken({ id : extMobile._id})    

                //set the token in cookie
                res.cookie('loginToken', authToken, {
                    httpOnly: true,
                    signed: true,
                    path: `/api/auth/token`,
                    maxAge: 1 * 24 * 60 * 60 * 1000
                })
                res.status(StatusCodes.OK).json( {msg : `login success(mobile)`, authToken} )
            }
            
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg : err.message})
        }
    },
    logout: async(req,res) => {
        try {
            //clear cookie
            res.clearCookie('loginToken', {path : `/api/auth/token`})
            res.status(StatusCodes.OK).json({msg : `logout Successfully`})
            
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg : err.message})
        }
    },
    authToken : async(req,res) => {
        try {
            //read the login token from signed cookies
            const rToken = req.signedCookies.loginToken

            if(!rToken)
                return res.status(StatusCodes.NOT_FOUND).json({msg : `token not available`})
            
            //valid user id or not
            await jwt.verify(rToken, process.env.ACCESS_SECRET, (err,user) => {
                if(err)
                    return res.status(StatusCodes.UNAUTHORIZED).json({ msg : `Unauthorised.. login again` })

                //if valid token
                res.status(StatusCodes.OK).json({authToken : rToken})
            })
            
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg : err.message})
        }
    },
    currentUser: async(req,res) => {
        try {
            let single = await User.findById({_id : req.userID}).select('-password')
            if(!single)
                return res.status(StatusCodes.NOT_FOUND).json({ msg: `user info found` })
            res.status(StatusCodes.ACCEPTED).json({ user : single})
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg : err.message})
        }
    },
    verifyUser: async(req,res) => {
        try {
            let {email} = req.body
            let extEmail = await User.findOne({email})
                if(!extEmail)
                    return res.status(StatusCodes.CONFLICT).json({msg: `Email id doesnt exists`, status:false})

            res.status(StatusCodes.ACCEPTED).json({msg: `Email id verified successfully`})
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err})
        }
    },
    passwordLink: async(req,res) => {
        try {
            let {email} = req.body
            let extEmail = await User.findOne({email})
                if(!extEmail)
                    return res.status(StatusCodes.CONFLICT).json({msg: `Email id doesnt exists`, status:false})

            //password token
            let passToken = createAccessToken({id: extEmail._id})
            //password template
            let passTemplate = reset_password(extEmail.name , email, passToken)

            let subject = `Reset your password`

            //send email
            let emailRes = await mailConfig(email, subject, passTemplate)

            res.status(StatusCodes.ACCEPTED).json({msg: `password link sent successfully`, status: emailRes})
            
        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err})
        }
    },
    updatePassword : async(req,res) => {
        try {
            let id = req.userID
            let {password} = req.body
            
            let extUser = await User.findById( { _id : id})
                if(!extUser)
                    return res.status(StatusCodes.CONFLICT).json({msg: `REquested userinfo not found`})
            
            //encrypt the password into hash
            const encPass = await bcrypt.hash(password,10);

            //update the password
            await User.findByIdAndUpdate({ _id: id }, {password: encPass})
            return res.status(StatusCodes.ACCEPTED).json({msg : `Password updated successfully`})


        } catch (err) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err})
        }
    }


}

module.exports = authController