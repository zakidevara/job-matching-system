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
    #validationCode;
    #status;

    constructor(nim = '', name = '', email = '', password = '', birthDate = '', classYear = '', photo = '', phoneNumber = '', gender = 0, studyProgram = 0, status = 0){
        super();
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
    setValidationCode(newValidationCode){
        this.#validationCode = newValidationCode;
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


    async getReligion(){
        let query = `MATCH (u:User {nim: '${this.#nim}'})-[:HAS_RELIGION]->(r:Religion) RETURN r`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propRel = result.records[0].get('r').properties;
                let religion = new Religion(propRel.id, propRel.name);
                return religion;
            } else {
                return null;
            }
        }catch(e){
            throw e;
        }
    }
    async getSkills(){
        let query = `MATCH (u:User {nim: ${this.#nim}})-[:SKILLED_IN]->(s:Skill) RETURN s`;
        try{
            let resultUserSkills = await DB.query(query);
            let listSkill = [];
            if(resultUserSkills.records.length > 0){
                resultUserSkills.records.forEach((item) => {
                    let propSkill = item.get('s').properties;
                    let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                    listSkill.push(skill);
                });
            }
            return listSkill;
        }catch(e){
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
            gender: Gender.toString(this.#gender),
            studyProgram: StudyProgram.toString(this.#studyProgram)
        };
        return objResult;
    }

    // Database Related
    // Create new user
    static async create(userData){
        let query = `MERGE (u:User {email: '${userData.email}'})
                     SET u.name = '${userData.name}',
                     u.nim = '${userData.nim}',
                     u.birthDate = '${userData.birthDate}',
                     u.classYear = ${userData.classYear},
                     u.photo = '${userData.photo}',
                     u.phoneNumber = '${userData.phoneNumber}',
                     u.gender = ${userData.gender},
                     u.studyProgram = ${userData.studyProgram.studyProgramId}
                     RETURN u`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propUser = result.records[0].get('u').properties;
                let user = new User(propUser.nim, propUser.name, propUser.email, propUser.password, propUser.birthDate, propUser.classYear, propUser.photo, propUser.phoneNUmber, propUser.gender, propUser.studyProgram);
                return user;
            } else {
                return null;
            }
        }catch(e){
            throw e;
        }
    }

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
                     u.gender = ${this.#gender || null},
                     u.studyProgram = ${this.#studyProgram || null}
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
                let user = new User(propUser.nim, propUser.name, propUser.email, propUser.password, propUser.birthDate, propUser.classYear, propUser.photo, propUser.phoneNUmber, propUser.gender, propUser.studyProgram);
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
                let user = new User(propUser.nim, propUser.name, propUser.email, propUser.password, propUser.birthDate, propUser.classYear, propUser.photo, propUser.phoneNUmber, propUser.gender, propUser.studyProgram);
                return user;
            } else{            
                return null;
            }
        }catch(e){
            throw e;
        }
    }

    static async findByEmail(email){
        let query = `MATCH (u:User {email: '${email}'}) RETURN u`;
        try{
            let resultUserData = await DB.query(query);
            if(resultUserData.records.length > 0){
                let propUser = resultUserData.records[0].get('u').properties;
                let user = new User(propUser.nim, propUser.name, propUser.email, propUser.password, propUser.birthDate, propUser.classYear, propUser.photo, propUser.phoneNUmber, propUser.gender, propUser.studyProgram);
                return user;
            } else{
                return null;
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
                let user = new User(propUser.nim, propUser.name, propUser.email, propUser.password, propUser.birthDate, propUser.classYear, propUser.photo, propUser.phoneNUmber, propUser.gender, propUser.studyProgram);
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

        try{

        }catch(e){
            throw e;
        }

        for(let i=0; i < length; i++){
            let query = `MATCH (u:User), (s:Skill) WHERE u.nim = ${this.#nim} AND ID(s) = ${skillList[i]} MERGE (u)-[:SKILLED_IN]->(s) RETURN s`;
            let resultAddSkill = await DB.query(query);
            if(resultAddSkill.records.length > 0){
                let valueSkill = resultAddSkill.records[0].get('s');
                let propertiesSkill = valueSkill.properties;
                let skill = new Skill(propertiesSkill.name, propertiesSkill.uri);
                successToAdd.push(skill);
            } else {
                failedToAdd.push(skillList[i]);
            }
        }

        let finalSuccessResult = [];
        successToAdd.forEach((item, index) => {
            let obj = item.toObject();
            finalSuccessResult.push(obj);
        });
        
        let objResult = {
            success: finalSuccessResult,
            failed: failedToAdd
        };
        
        return objResult;
    }

    async addSkillv2(skillList){
        let failedToAdd = [];
        let successToAdd = [];
        let length = skillList.length;
        try{

        }catch(e){
            throw e;
        }

        for(let i=0; i < length; i++){
            let checkRel = `MATCH (u:User {nim: ${this.#nim}})-[re:SKILLED_IN]->(s:Skill) WHERE ID(s) = ${skillList[i]} RETURN re`;
            let resultCheckRel = await DB.query(checkRel);
            if(resultCheckRel.records.length < 1){
                let queryAddSkill = `MATCH (u:User), (s:Skill) WHERE u.nim = ${this.#nim} AND ID(s) = ${skillList[i]} MERGE (u)-[:SKILLED_IN]->(s) RETURN s`;
                let resultAddSkill = await DB.query(queryAddSkill);
                if(resultAddSkill.records.length > 0){
                    let valueSkill = resultAddSkill.records[0].get('s');
                    let properties = valueSkill.properties;
                    let skill = new Skill(properties.name, properties.uri);
                    successToAdd.push(skill);
                } else {
                    failedToAdd.push(skillList[i]);
                }
            } else {
                failedToAdd.push(skillList[i]);
            }
        }
        let finalSuccessResult = [];
        successToAdd.forEach((item, index) => {
            let obj = item.toObject();
            finalSuccessResult.push(obj);
        });
        
        let objResult = {
            success: finalSuccessResult,
            failed: failedToAdd
        };
        
        return objResult;
    }

    async removeSkill(skillID){
        let query = `MATCH (u:User {nim: ${this.#nim}})-[rel:SKILLED_IN]->(s:Skill) WHERE ID(s) = ${skillID} DELETE rel`;
        try{
            await DB.query(query);
            return 'Success';
        } catch (e) {
            throw e;
        }
    }
}

module.exports = User;