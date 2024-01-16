const userRoute = require('express').Router()

const {readAll, readSingle, updateUser, deleteUser} = require('../controller/userController')
const auth = require('../middleware/auth')
const adminRole = require('../middleware/adminRole')

userRoute.get(`/all`, auth, adminRole, readAll).get(`/single/:id`, auth, adminRole, readSingle)

userRoute.patch(`/update/:id`, auth, adminRole, updateUser)

userRoute.delete(`/delete/:id`, auth, adminRole, deleteUser)

module.exports = userRoute

