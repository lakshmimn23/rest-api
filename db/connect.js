const mongoose = require('mongoose')

const connectDB = async() => {
    return mongoose.connect(process.env.MONGO_URL)
        .then(res => {
            console.log(`MONGODB CONNECTED`)
        }).catch(err => console.log(err.message))
}
module.exports = connectDB