const nodemailer = require('nodemailer');
class EmailService{
    static transporter = null;

    static async getTransporter(){
        if(this.transporter == null){
            let options = {
                port: process.env.SMTP_PORT,
                host: process.env.SMTP_HOST,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            };

            try{
                this.transporter = nodemailer.createTransport(options);
                let transporterVerify = await this.transporter.verify();
                console.log("Server is ready to take our messages");
                return this.transporter;  
            }catch(e){
                console.log('EmailService Error:', e);
                // throw e;
            }
        }
        return this.transporter;
    }

    static async sendEmail(email, subject, text){
        let message = {
            from: process.env.SMTP_USER,
            to: email,
            subject,
            html: `${text}`
        };

        try{
            let transporter = await this.getTransporter();
            await transporter.sendMail(message);
            return true;
        }catch(e){
            console.log('EmailService Error:', e);
            // throw e;
        }
    }
}

module.exports = EmailService;