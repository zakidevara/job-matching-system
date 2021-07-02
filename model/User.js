const Model = require("./Model");
const DB = require("../services/DB");
const Religion = require("./Religion");
const Skill = require("./Skill");
const StudyProgram = require("./StudyProgram");
const Gender = require("./Gender");


class User extends Model {
    // Property of user (private)
    #nim;
    #name;
    #email;
    #password;
    #birthDate;
    #classYear;
    #photo;
    #phoneNumber;
    #gender;
    #studyProgram;
    #emailVerificationCode;
    #status;

    constructor(nim = '', name = '', email = '', password = '', birthDate = '', classYear = '', photo = '', phoneNumber = '', gender = 0, studyProgram = 0, status = 0){
        super("nim");
        this.#nim = nim;
        this.#name = name;
        this.#email = email;
        this.#password = password;
        this.#birthDate = birthDate;
        this.#classYear = classYear;
        this.#photo = photo;
        this.#phoneNumber = phoneNumber;
        this.#gender = gender;
        this.#studyProgram = studyProgram;
        this.#status = status;
    }

    // Setter
    setNim(newNim){
        this.#nim = newNim;
    }
    setName(newName){
        this.#name = newName;
    }
    setEmail(newEmail){
        this.#email = newEmail;
    }
    setPassword(newPass){
        this.#password = newPass;
    }
    setBirthDate(newDate){
        this.#birthDate = newDate;
    }
    setGender(newGender){
        this.#gender = newGender;
    }
    setClassYear(newYear){
        this.#classYear = newYear;
    }
    setPhoto(pathPhoto){
        this.#photo = pathPhoto;
    }
    setPhoneNumber(newNumber){
        this.#phoneNumber = newNumber;
    }
    setStudyProgram(newStudy){
        this.#studyProgram = newStudy;
    }
    setEmailVerificationCode(newCode){
        this.#emailVerificationCode = newCode;
    }
    setStatus(newStatus){
        this.#status = newStatus;
    }


    // Getter
    getID(){
        return super.getID();
    }
    getNim(){
        return this.#nim;
    }
    getName(){
        return this.#name;
    }
    getEmail(){
        return this.#email;
    }
    getPassword(){
        return this.#password;
    }
    getBirthDate(){
        return this.#birthDate;
    }
    getClassYear(){
        return this.#classYear;
    }
    getPhoto(){
        return this.#photo;
    }
    getPhoneNumber(){
        return this.#phoneNumber;
    }
    getGender(){
        return this.#gender;
    }
    getStudyProgram(){
        return this.#studyProgram;
    }
    getStatus(){
        return this.#status;
    }
    

    async verifyEmail(code){
        try{
            if(code == this.#emailVerificationCode){
                this.setStatus(1);
                await this.save();
                return true;
            }else{
                throw new Error("Kode verifikasi salah");
            }
        }catch(e){
            if(e instanceof Error){
                console.log(e);
            }
            throw e;
        }
    }

    async getReligion(){
        let query = `MATCH (u:User {nim: '${this.#nim}'})-[:HAS_RELIGION]->(r:Religion) RETURN r`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propRel = result.records[0].get('r').properties;
                let religion = new Religion(propRel.id, propRel.name);
                return religion.toObject();
            } else {
                return null;
            }
        }catch(e){
            throw e;
        }
    }
    async getSkills(){
        let query = `MATCH (u:User {nim: '${this.#nim}'})-[:SKILLED_IN]->(s:Skill) RETURN s`;
        try{
            let resultUserSkills = await DB.query(query);
            let listSkill = [];
            if(resultUserSkills.records.length > 0){
                resultUserSkills.records.forEach((item) => {
                    let propSkill = item.get('s').properties;
                    console.log(propSkill);
                    let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                    if(listSkill.length === 0){
                        listSkill.push(skill);
                    } else {
                        let validateItem = listSkill.some(sk => sk.getID() === skill.getID());
                        if(!validateItem) listSkill.push(skill);
                    }
                });
            }
            return listSkill;
        }catch(e){
            console.log(e);
            throw e;
        }
    }
    toObject(){
        let objResult = {
            name: this.#name,
            nim: this.#nim,
            email: this.#email,
            birthdate: this.#birthDate,
            classYear: this.#classYear,
            photo: this.#photo,
            phoneNumber: this.#phoneNumber,
            gender: this.#gender,
            studyProgram: this.#studyProgram,
            status: this.#status
        };
        return objResult;
    }

    init(){
        let genObj = {
            genderId: this.#gender,
            name: Gender.toString(this.#gender)
        };
        this.#gender = genObj;

        let stuProObj = {
            studyProgramId: this.#studyProgram,
            name: StudyProgram.toString(this.#studyProgram)
        };
        this.#studyProgram = stuProObj;
    }

    // Database Related
    // Save instance to database
    async save(){
        let query = `MERGE (u:User {nim: '${this.#nim}'})
                     SET u.name = '${this.#name}', 
                     u.email = '${this.#email}',
                     u.password = '${this.#password}', 
                     u.birthDate = '${this.#birthDate}',
                     u.classYear = ${this.#classYear || null}, 
                     u.photo = '${this.#photo}',
                     u.phoneNumber = '${this.#phoneNumber}',
                     u.gender = ${this.#gender.genderId || null},
                     u.studyProgram = ${this.#studyProgram.studyProgramId || null},
                     u.emailVerificationCode = ${this.#emailVerificationCode || null},
                     u.status = ${this.#status}
                     RETURN u`;
        try{
            let result = await DB.query(query);
            return result.records.length > 0 ? true : false;
        } catch(e){
            throw e;
        }
    }

    // Get all users
    static async all(){
        let query = `MATCH (u:User) RETURN u ORDER BY u.nim`;
        try{
            let resultListUsers = await DB.query(query);
            let tempList = [];
            resultListUsers.records.forEach((item) => {
                let propUser = item.get('u').properties;
                let user = new User(propUser.nim, propUser.name, propUser.email, propUser.password, propUser.birthDate, propUser.classYear, propUser.photo, propUser.phoneNumber, propUser.gender, propUser.studyProgram, propUser.status);
                user.init();
                tempList.push(user);
            });

            let listUsers = [];
            tempList.forEach((item) => {
                let obj = item.toObject();
                listUsers.push(obj);
            });
            return listUsers;
        }catch(e){
            throw e;
        }
    }

    // Find user by ID
    static async find(userID){
        let query = `MATCH (u:User {nim: '${userID}'}) RETURN u`;
        try{
            let resultUserData = await DB.query(query);
            if(resultUserData.records.length > 0){
                let propUser = resultUserData.records[0].get('u').properties;
                let user = new User(propUser.nim, propUser.name, propUser.email, propUser.password, propUser.birthDate, propUser.classYear, propUser.photo, propUser.phoneNumber, propUser.gender, propUser.studyProgram, propUser.status);
                user.setEmailVerificationCode(propUser.emailVerificationCode);
                user.init();
                return user;
            } else{            
                return null;
            }
        }catch(e){
            console.log(e);
            throw e;
       }
    }

    static async findByEmail(email){
        let query = `MATCH (u:User {email: '${email}'}) RETURN u`;
        try{
            let resultUserData = await DB.query(query);
            if(resultUserData.records.length > 0){
                let propUser = resultUserData.records[0].get('u').properties;
                let user = new User(propUser.nim, propUser.name, propUser.email, propUser.password, propUser.birthDate, propUser.classYear, propUser.photo, propUser.phoneNumber, propUser.gender, propUser.studyProgram, propUser.status);
                user.setEmailVerificationCode(propUser.emailVerificationCode);
                user.init();
                return user;
            } else{
                throw new Error("User tidak ditemukan");
            }
        }catch(e){            
            throw e;
        }
    }

    // Update user
    async update(userData){
        let query = `MATCH (u:User {nim: '${this.#nim}'}) 
                    SET u.name = '${userData.name}',
                    u.email = '${userData.email}',
                    u.birthDate = '${userData.birthDate}',
                    u.classYear = '${userData.classYear}',
                    u.photo = '${userData.photo}',
                    u.phoneNumber = '${userData.phoneNumber}',
                    u.gender = ${userData.gender},
                    u.studyProgram = ${userData.studyProgram.studyProgramId}
                    RETURN u`;
        try{
            let resultUpdate = await DB.query(query);
            if(resultUpdate.records.length > 0){
                let propUser = resultUpdate.records[0].get('u').properties;
                let user = new User(propUser.nim, propUser.name, propUser.email, propUser.password, propUser.birthDate, propUser.classYear, propUser.photo, propUser.phoneNumber, propUser.gender, propUser.studyProgram, propUser.status);
                user.init();
                return user;
            } else {
                return null;
            }
        }catch(e){
            throw e;
        }
    }

    async addSkill(skillList){
        let failedToAdd = [];
        let successToAdd = [];
        let length = skillList.length;

        for(let i=0; i < length; i++){
            let checkRel = `MATCH (u:User {nim: ${this.#nim}})-[re:SKILLED_IN]->(s:Skill {id: '${skillList[i]}'}) RETURN re`;
            try{
                let resultCheckRel = await DB.query(checkRel);
                if(resultCheckRel.records.length < 1){
                    let queryAddSkill = `MATCH (u:User), (s:Skill) WHERE u.nim = '${this.#nim}' AND s.id = '${skillList[i]}' 
                                         MERGE (u)-[:SKILLED_IN]->(s) RETURN s`;
                    try{    
                        let resultAddSkill = await DB.query(queryAddSkill);
                        if(resultAddSkill.records.length > 0){
                            let propSkill = resultAddSkill.records[0].get('s').properties;
                            let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                            if(successToAdd.length === 0){
                                successToAdd.push(skill.toObject());
                            } else {
                                let validateItem = successToAdd.some(sk => sk.skillId === skill.getID());
                                if(!validateItem) successToAdd.push(skill.toObject());
                            }
                        } else {
                            failedToAdd.push(skillList[i]);
                        }
                    } catch(e){
                        throw e;
                    }
                } else {
                    failedToAdd.push(skillList[i]);
                }
            }catch(e){
                throw e;
            }
        }

        let objResult = {
            success: successToAdd,
            failed: failedToAdd
        };
        return objResult;
    }

    async removeSkill(skillID){
        let query = `MATCH (u:User {nim: ${this.#nim}})-[rel:SKILLED_IN]->(s:Skill {id: '${skillID}'}) DELETE rel RETURN COUNT(rel)`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                return 'Success';
            } else {
                return 'Failed';
            }
        } catch (e) {
            throw e;
        }
    }

    async addEducation(education){
        
    }
}

module.exports = User;