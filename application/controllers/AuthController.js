
const User = require('../../model/User');
const jwt = require('jsonwebtoken');
const DB = require('../../services/DB');
const EmailService = require('../../services/EmailService');
const verificationCodeEmailTemplate = require('../emailTemplate/verificationCodeEmailTemplate');

class AuthController{

    constructor(){

    }

    static async generateAccessToken(email) {
        let user = await User.findByEmail(email);
        let nim = user.getNim();
        return jwt.sign({email, nim}, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
    }
    static async generateEmailVerificationCode(email) {
        let code = Math.floor(100000 + Math.random() * 900000);
        let user;
        try{
            user = await User.findByEmail(email);
            user.setEmailVerificationCode(code);
            await user.save();
            return code;
        }catch(e){
            throw e;
        }
    }

    static validate(email, password){
        return true;
    }

    static async isEmailExists(email){
        
        try{
            let user = await User.findByEmail(email);
            return user !== null;
        }catch(e){
            throw e;
        }
        
    }

    static async authorize(email, password){
        let isAuthorized = false; 
        try{
            let user = await User.findByEmail(email);
            if(user){
                if(user.getStatus() !== 1) throw new Error("Email user belum terverifikasi");
                isAuthorized = password === user.getPassword();
                if(!isAuthorized) throw new Error("Password salah");
            }
            return isAuthorized;
        }catch(e){
            if (e instanceof Error) console.log(e);
            throw e;
        }
    }

    static async validateEmail(email, code){
        try{            
            let user = await User.findByEmail(email);
            if(user){
                let saveStatus = await user.verifyEmail(code);
                return saveStatus;
            }
            return false;
        }catch(e){
            throw e;
        }
    }
    
    static async login(email, password){
        try{
            const isAuthorized = await this.authorize(email, password);
            if(isAuthorized){
                let accessToken = await this.generateAccessToken(email);
                return {
                    accessToken
                };
            }
        }catch(e){
            throw e;
        }
    }

    static async register(email, password){
        try{
            // Cek apakah email sudah terdaftar?
            let emailExists = await this.isEmailExists(email);
            if(emailExists) throw new Error("Email sudah terdaftar");

            // Cek apakah data input sudah memenuhi syarat
            let isValid = this.validate(email, password);
    
            let user;
            if(isValid){
                //create user di database
                user = new User(
                    undefined, 
                    undefined,
                    email, 
                    password, 
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    0
                );
                let saveStatus = await user.save();
                if(saveStatus){
                    // generate email verification code
                    let code = await this.generateEmailVerificationCode(email);
                    console.log(code);

                    // send verification code via email
                    const subject = "Kode Verifikasi Email JobMatcher";
                    let sendEmailStatus = await EmailService.sendEmail(email, subject, verificationCodeEmailTemplate(code));
                    console.log("send verification email status: ", sendEmailStatus);

                    return saveStatus && sendEmailStatus;
                }
            }

            return false;
        }catch(e){
            if(e instanceof Error) {
                console.log(e);
                throw e;
            }else{
                throw new Error("Registrasi akun gagal");
            }
        }
        
    }

    
}

module.exports = AuthController;
