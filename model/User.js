const {Model, driver} = require("./Model");
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

    constructor(nim = '', name = '', email = '', password = '', birthDate = '', classYear = '', photo = '', phoneNumber = '', gender = 0, studyProgram = 0){
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
    async getReligion(){
        let session = driver.session();
        let query = `MATCH (u:User {nim: ${this.#nim}})-[:HAS_RELIGION]->(r:Religion) RETURN r`;
        let result = await session.run(query);
        if(result.records.length > 0){
            let value = result.records[0].get('r').properties;
            let objReligion = new Religion(value.id, value.name);
            await session.close();
            return objReligion;
        } else {
            await session.close();
            return null;
        }
    }
    async getSkills(){
        let session = driver.session();
        let query = `MATCH (u:User {nim: ${this.#nim}})-[:SKILLED_IN]->(s:Skill) RETURN s`;
        let resultUserSkills = await session.run(query);
        let listSkill = [];
        if(resultUserSkills.records.length > 0){
            resultUserSkills.records.forEach((item, index) => {
                let value = item.get('s');
                let properties = value.properties;
                let skillObj = new Skill(properties.name, properties.uri);
                listSkill.push(skillObj);
            });
        }
        await session.close();
        return listSkill;
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
        let session = driver.session();
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
        let result = await session.run(query);
        if(result.records.length > 0){
            let value = result.records[0].get('u');
            let properties = value.properties;
            let userObj = new User(properties.nim, properties.name, properties.email, properties.password, properties.birthDate, properties.classYear, properties.photo, properties.phoneNUmber, properties.gender, properties.studyProgram);
            await session.close();
            return userObj;
        } else {
            await session.close();
            return null;
        }
    }

    // Save instance to database
    async save(){
        let session = driver.session();
        let query = `MERGE (u:User {nim: ${this.#nim}})
                     SET u.name = '${this.#name}', 
                     u.email = '${this.#email}',
                     u.password = '${this.#password}', 
                     u.birthDate = '${this.#birthDate}',
                     u.classYear = ${this.#classYear}, 
                     u.photo = '${this.#photo}',
                     u.phoneNumber = '${this.#phoneNumber}',
                     u.gender = ${this.#gender},
                     u.studyProgram = ${this.#studyProgram}
                     RETURN u`;
        let result = await session.run(query);
        await session.close();
        return result.records.length > 0 ? true : false;
    }

    // Get all users
    static async all(){
        let session = driver.session();
        let query = `MATCH (u:User) RETURN u ORDER BY u.nim`;
        let resultListUsers = await session.run(query);
        let tempList = [];
        resultListUsers.records.forEach((item, index) => {
            let value = item.get('u');
            let properties = value.properties;
            let objUser = new User(properties.nim, properties.name, properties.email, properties.password, properties.birthDate, properties.classYear, properties.photo, properties.phoneNumber, properties.gender, properties.studyProgram);
            tempList.push(objUser);
        });

        let listUsers = [];
        tempList.forEach((item, index) => {
            let obj = item.toObject();
            listUsers.push(obj);
        });
        await session.close();
        return listUsers;
    }

    // Find user by ID
    static async find(userID){
        let session = driver.session();
        let query = `MATCH (u:User {nim: '${userID}'}) RETURN u`;
        let resultUserData = await session.run(query);
        if(resultUserData.records.length > 0){
            let value = resultUserData.records[0].get('u');
            let properties = value.properties;
            let userData = new User(properties.nim, properties.name, properties.email, properties.password, properties.birthDate, properties.classYear, properties.photo, properties.phoneNumber, properties.gender, properties.studyProgram);
            await session.close();
            return userData;
        } else{
            await session.close();
            return null;
        }
    }

    static async findByEmail(email){
        let session = driver.session();
        let query = `MATCH (u:User {email: '${email}'}) RETURN u`;
        let resultUserData = await session.run(query);
        if(resultUserData.records.length > 0){
            let value = resultUserData.records[0].get('u');
            let properties = value.properties;
            let userData = new User(properties.nim, properties.name, properties.email, properties.password, properties.birthDate, properties.classYear, properties.photo, properties.phoneNUmber, properties.gender, properties.studyProgram);
            await session.close();
            return userData;
        } else{
            await session.close();
            return null;
        }
    }

    // Update user
    async update(userData){
        let session = driver.session();
        let query = `MATCH (u:User {nim: ${this.#nim}}) 
                     SET u.name = '${userData.name}',
                     u.email = '${userData.email}',
                     u.birthDate = '${userData.birth_date}',
                     u.classYear = '${userData.class_year}',
                     u.photo = '${userData.photo}',
                     u.phoneNumber = '${userData.phone_number}',
                     u.gender = ${userData.gender},
                     u.studyProgram = ${userData.study_program.study_program_id}
                     RETURN u`;
        let resultUpdate = await session.run(query);
        if(resultUpdate.records.length > 0){
            let value = resultUpdate.records[0].get('u');
            let properties = value.properties;
            let userData = new User(properties.nim, properties.name, properties.email, properties.password, properties.birthDate, properties.classYear, properties.photo, properties.phoneNUmber, properties.gender, properties.studyProgram);
            await session.close();
            return userData;
        } else {
            await session.close();
            return null;
        }
    }

    async addSkill(skillList){
        let failedToAdd = [];
        let successToAdd = [];
        let length = skillList.length;
        let session = driver.session();

        for(let i=0; i < length; i++){
            let query = `MATCH (u:User), (s:Skill) WHERE u.nim = ${this.#nim} AND ID(s) = ${skillList[i]} MERGE (u)-[:SKILLED_IN]->(s) RETURN s`;
            let resultAddSkill = await session.run(query);
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
        await session.close();
        return objResult;
    }

    async addSkillv2(skillList){
        let failedToAdd = [];
        let successToAdd = [];
        let length = skillList.length;
        let session = driver.session();

        for(let i=0; i < length; i++){
            let checkRel = `MATCH (u:User {nim: ${this.#nim}})-[re:SKILLED_IN]->(s:Skill) WHERE ID(s) = ${skillList[i]} RETURN re`;
            let resultCheckRel = await session.run(checkRel);
            if(resultCheckRel.records.length < 1){
                let queryAddSkill = `MATCH (u:User), (s:Skill) WHERE u.nim = ${this.#nim} AND ID(s) = ${skillList[i]} MERGE (u)-[:SKILLED_IN]->(s) RETURN s`;
                let resultAddSkill = await session.run(queryAddSkill);
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
        await session.close();
        return objResult;
    }

    async removeSkill(skillID){
        let session = driver.session();
        let query = `MATCH (u:User {nim: ${this.#nim}})-[re:SKILLED_IN]->(s:Skill) WHERE ID(s) = ${skillID} DELETE re RETURN COUNT(re)`;
        let result = await session.run(query);
        if(result.records.length > 0){
            return 'Success';
        } else {
            return 'Failed';
        }
    }
}

module.exports = User;