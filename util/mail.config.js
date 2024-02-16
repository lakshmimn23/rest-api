const nodemailer = require("nodemailer")

const mailConfig = async(mTo,mSub,mTemplate) => {
    try {
        //config
        const transporter = await nodemailer.createTransport({
            service: process.env.MAIL_SERVICE,
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT
             });
             //transport mail
             let info = await transporter.sendMail({
                from: process.env.MAIL_ID,
                to: mTo,
                subject: mSub,
                html: `<div> ${mTemplate} </div>`
        });
        return info
    } catch (err) {
        return err
    }
} 

module.exports = mailConfig
