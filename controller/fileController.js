const { StatusCodes } = require("http-status-codes")
const FileSchema = require("../model/fileModel")
const User = require("../model/userModel")
const path = require('path')
const fs = require('fs')
const fileType = require('../util/fileExt')

//remove files

const removeTemp =  (filePath) => {
     fs.unlinkSync(filePath)
}

//upload - post + data
const uploadFile = async(req,res)=>{
    try{
        const { product } = req.files
        //To get the extension of the input file
       /*  let fileExt = path.extname(product.name)
        return res.json({fileExt, product}) */
        const id = req.userID

        //check the public folder if folder does not exists

        const outPath = path.join(__dirname, '../public')
        if(!fs.existsSync(outPath)){
            fs.mkdirSync(outPath, {recursive : true})
        }

        //no files are attached
        if(!req.files)
            return res.status(StatusCodes.NOT_FOUND).json({msg : `No files to upload...`, success: false})

        let extUser = await User.findById({ _id: id}).select('-password')
        //if used id not found
            if(!extUser) {
                removeTemp(product.tempFilePath)
                return res.status(StatusCodes.CONFLICT).json({msg : `requested user id not found`, success: false})
            }
                
            
        //validate the file ext

       // if(product.mimetype === "image/png") {
        if( product.mimetype === fileType.docx || 
            product.mimetype === fileType.jpeg || 
            product.mimetype === fileType.png || 
            product.mimetype === fileType.pptx || 
            product.mimetype === fileType.doc  || 
            product.mimetype === fileType.pdf) {
            
            //rename the file -> doc-
            let ext = path.extname(product.name)
            let filename = `doc-${Date.now()}${ext}`
            let extnew = ext.substring(1)
            
          //  return res.json({ filename })
            //store the file in physical location
            await product.mv(path.resolve(__dirname, `../public/${filename}`), async (err) => {
                if(err){
                    removeTemp(product.tempFilePath)
                    return res.status(StatusCodes.CONFLICT).json({msg : err, success: false})
                }
                    //add files info to db collection
                let fileRes = await FileSchema.create({
                    userId:extUser._id, 
                    newName:filename, 
                    extName:extnew,
                    user:extUser, 
                    info:product })
                res.status(StatusCodes.ACCEPTED).json({msg : "File uploaded successfully", file: fileRes, success: true})
            })
        }else {
            removeTemp(req.files.product.tempFilePath)
            return res.status(StatusCodes.CONFLICT).json({msg : `upload only .doc, docx, .ppt, .pptx, png and jpeg files`, success: false})
        }
 
    }catch(err){
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err, success: false})
    }
}
//read all - get
const readAll = async(req,res) => {
    try {
        let files = await FileSchema.find({})
        let filtered = files.filter((item)=> item.userId === req.userID)
        res.status(StatusCodes.OK).json({length: filtered.length, filtered, success: true})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err, success: false})
    }
}
//read single - get+ ref
const readSingle = async(req,res) => {
    try {
        let fileId = req.params.id
        let userId = req.userID
        let extFile = await FileSchema.findById({_id: fileId})
            if(!extFile)
                return res.status(StatusCodes.CONFLICT).json({msg : `Requested file id not existe`, success: false})
        //if file belongs to authorized user or not
            if(userId != extFile.userId)
                return res.status(StatusCodes.UNAUTHORIZED).json({msg : `Unauthorized file read...`, success: false})

        res.status(StatusCodes.ACCEPTED).json({file: extFile, success: true})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err, success: false})
    }
}
//delete - get + ref

const deleteFile = async(req,res) => {
    try {
        let fileId = req.params.id
        let userId = req.userID

        //read existing file data ref to id
        let extFile = await FileSchema.findById({_id: fileId})
            if(!extFile)
                return res.status(StatusCodes.CONFLICT).json({msg : `Requested file id not existe`, success: false})
         //if file belongs to authorized user or not
            if(userId != extFile.userId)
                return res.status(StatusCodes.UNAUTHORIZED).json({msg : `Unauthorized file read...`, success: false})
        //delete physical file from directory
        let filePath = path.resolve(__dirname, `../public/${extFile.newName}`)
        if(fs.existsSync(filePath)){
            //to delete the file
            await fs.unlinkSync(filePath)
            //to remove file info in db collection
            await FileSchema.findByIdAndDelete({id: extFile._id})

            return res.status(StatusCodes.ACCEPTED).json({msg : `file deleted successfully`, success: true})
        }else {
            return res.json({msg : 'file not exists', success: false})
        }
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg: err, success: false})
    }
}

//to read all file content without authetication

const allFiles = async(req,res) => {
    try {
        let files = await FileSchema.find({})
        
        res.status(StatusCodes.OK).json({length: files.length, files, success: true})
    } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err, success: false})
    }
}

const fileExt = async(req,res) => {
   try {

        let data = req.query
        let files = await FileSchema.find({})
        if(data.type === "all"){
            res.status(StatusCodes.OK).json({data, length: files.length, files, success: true})
        }else{
            let filtered = files.filter((item) => item.extName === `${data.type}`)
            res.status(StatusCodes.OK).json({data, length: filtered.length, filtered, success: true})
        }
        
   } catch (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({msg : err, success: false})
}
    
}
module.exports = {uploadFile, readAll, readSingle, deleteFile, allFiles, fileExt }