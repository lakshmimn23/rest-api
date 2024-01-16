const fileRoute = require('express').Router()
const {uploadFile, readAll, readSingle, deleteFile, allFiles, fileExt} = require('../controller/fileController')
const auth = require('../middleware/auth')

fileRoute.post(`/upload`, auth, uploadFile)

fileRoute.get('/all', auth, readAll).get('/single/:id', auth, readSingle)

fileRoute.delete('/delete/:id', auth, deleteFile)

fileRoute.get('/open', allFiles)

fileRoute.get('/fileExt', fileExt)

module.exports = fileRoute