
const User = require('../../model/User');
const jwt = require('jsonwebtoken');
const DB = require('../../services/DB');
const EmailService = require('../../services/EmailService');
const verificationCodeEmailTemplate = require('../emailTemplate/verificationCodeEmailTemplate');
const Validator = require('validatorjs');
class AuthController{

    constructor(){

    }

    async generateAccessToken(email) {
        let userModel = new User();
        let user = await userModel.findByEmail(email);
        let nim = user.getNim();
        return jwt.sign({email, nim}, process.env.TOKEN_SECRET, { expiresIn: '48h' });
    }
    async generateEmailVerificationCode(email) {
        let code = Math.floor(100000 + Math.random() * 900000);
        let user;
        try{
            
            let userModel = new User();
            user = await userModel.findByEmail(email);
            user.setEmailVerificationCode(code);
            await user.save();
            return code;
        }catch(e){
            throw e;
        }
    }

    validate(userData){
        let rules = {
            nim: 'required|string',
            email: 'required|email',
            password: 'required|string|min:6'
        };
        let validator = new Validator(userData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    validateLogin(userData){
        let rules = {
            email: 'required|email',
            password: 'required|string|min:6'
        };
        let validator = new Validator(userData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    async isEmailExists(email){
        
        try{
            
            let userModel = new User();
            let user = await userModel.findByEmail(email);
            return user !== null;
        }catch(e){
            return false;
        }
        
    }
    async isNimExists(nim){
        
        try{
            
            let userModel = new User();
            let user = await userModel.findById(nim);
            return user !== null;
        }catch(e){
            return false;
        }
        
    }

    async authorize(email, password){
        let isAuthorized = false; 
        try{
            let userModel = new User();
            let user = await userModel.findByEmail(email);
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

    async validateEmail(email, code){
        try{            
            let userModel = new User();
            let user = await userModel.findByEmail(email);
            if(user){
                let saveStatus = await user.verifyEmail(code);
                return saveStatus;
            }
            return false;
        }catch(e){
            throw e;
        }
    }
    
    async login(email, password){
        let validInput = this.validateLogin({email: email, password: password});
        if(validInput !== true){
            return validInput;
        }
        
        try{
            const isAuthorized = await this.authorize(email, password);
            if(isAuthorized){
                let userModel = new User();
                let user = await userModel.findByEmail(email);
                let accessToken = await this.generateAccessToken(email);
                return {
                    nim: user.getId(),
                    accessToken
                };
            }
        }catch(e){
            throw e;
        }
    }

    async register(nim, email, password){
        try{
            // Cek apakah email sudah terdaftar?
            let emailExists = await this.isEmailExists(email);
            if(emailExists) throw new Error("Email sudah terdaftar");
            // cek apakah nim sudah terdaftar
            let nimExists = await this.isNimExists(nim);
            if(nimExists) throw new Error("NIM sudah terdaftar");

            // Cek apakah data input sudah memenuhi syarat
            let userData = {
                nim: nim,
                email: email,
                password: password
            };
            let isValid = this.validate(userData);
            if(isValid !== true){
                return isValid;
            }
    
            let user;
            if(isValid){
                //create user di database
                user = new User(
                    nim, 
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
