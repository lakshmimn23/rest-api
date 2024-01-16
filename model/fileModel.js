const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        trim: true
    },
    newName: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    extName: {
        type: String,
        required: true,
        trim: true
    },
    user : {
        type: Object,
        required : true
       
    },
    info : {
        type : Object,
        required: true
    },
    isActive : {
        type: Boolean,
        default : true
    }
},{
        collection : 'files',
        timestamps: true
})

module.exports = mongoose.model('FileSchema', fileSchema)