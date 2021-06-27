
const User = require('../../model/User');
const jwt = require('jsonwebtoken');
const DB = require('../../services/DB');

class AuthController{

    constructor(){

    }

    static generateAccessToken(email) {
        return jwt.sign({email}, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
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
                isAuthorized = password === user.getPassword();
            }
            return isAuthorized;
        }catch(e){
            throw e;
        }
    }

    static async validateEmail(email, code){
        try{            
            let user = await User.findByEmail(email);
            
            if(user){
                //cek kode validasinya, kalo sama set status user jadi aktif
                

                user.setStatus(1);
                let saveStatus = await user.save();
                return saveStatus;
            }

            return false;
        }catch(e){
            throw e;
        }
    }
    
    static async login(email, password){
        const isAuthorized = await this.authorize(email, password);
        if(isAuthorized){
            let accessToken = this.generateAccessToken(email);
            return {
                accessToken
            };
        }
        return false;
    }

    static async register(email, password){
        try{
            // Cek apakah email sudah terdaftar?
            let emailExists = await this.isEmailExists(email);
            if(emailExists) return false;

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
                    undefined
                );
                await user.save();
            }

            return !emailExists && isValid && (user !== undefined);
        }catch(e){
            throw e;
        }
        
    }

    
}

module.exports = AuthController;
