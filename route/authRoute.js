const authController = require('../controller/authController')
const route = require('express').Router()
const auth = require('../middleware/auth')

//user register
route.post(`/register`, authController.register)

//user login
route.post(`/login`, authController.login)

//user logout
route.get(`/logout`, authController.logout)

//user auth token
route.get(`/token`, authController.authToken)

//current login user
route.get(`/current/user`, auth, authController.currentUser)

//verify user
route.post(`/verify/user`, authController.verifyUser)

//generate password link
route.post(`/generate/password/link`, authController.passwordLink)

//update password
route.patch(`/password/update`, auth, authController.updatePassword)

module.exports = route