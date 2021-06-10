const Model = require("./Model");
// Database
const neo4j = require('neo4j-driver');
const Skill = require("./Skill");
const user = 'neo4j';
const password = 'fakboi3';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    disableLosslessIntegers: true
});

class User extends Model {
    // Property of user (private)
    #name;
    #email;
    #password;
    #birthDate;
    #gender;
    #religion;
    #degree;
    #classYear;
    #photo;

    constructor(userID, name, email, password, birthDate, gender, religion, degree, classYear, photo){
        super(userID); 
        this.#name = name;
        this.#email = email;
        this.#password = password;
        this.#birthDate = birthDate;
        this.#gender = gender;
        this.#religion = religion;
        this.#degree = degree;
        this.#classYear = classYear;
        this.#photo = photo;
    }

    // Setter
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
    setReligion(newReligion){
        this.#religion = newReligion;
    }
    setDegree(newDegree){
        this.#degree = newDegree;
    }
    setClassYear(newYear){
        this.#classYear = newYear;
    }
    setPhoto(pathPhoto){
        this.#photo = pathPhoto;
    }

    // Getter
    getID(){
        return super.getID();
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
    getGender(){
        return this.#gender;
    }
    getReligion(){
        return this.#religion;
    }
    getDegree(){
        return this.#degree;
    }
    getClassYear(){
        return this.#classYear;
    }
    getPhoto(){
        return this.#photo;
    }
    async getSkills(){
        let userID = super.getID();
        let session = driver.session();
        let query = `MATCH (n:User) WHERE ID(n) = ${userID}, (n)-[:SKILLED_IN]-(res:Skill) RETURN res`;
        let resultUserSkills = await session.run(query);
        let listSkill = [];
        resultUserSkills.records.forEach((item, index) => {
            let value = item.get('res');
            let properties = value.properties;
            let skillObj = new Skill(value.identity, properties.label, properties.uri);
            listSkill.push(skillObj);
        });
        await session.close();
        return listSkill;
    }
    toObject(){
        let objResult = {
            id: super.getID(),
            name: this.#name,
            email: this.#email,
            birthdate: this.#birthDate,
            gender: this.#gender,
            religion: this.#religion,
            degree: this.#degree,
            classYear: this.#classYear,
            photo: this.#photo
        };
        return objResult;
    }

    // Database Related

    // Get all users
    static async all(){
        let session = driver.session();
        let query = `MATCH (res:User) RETURN res`;
        let resultListUsers = await session.run(query);
        let tempList = [];
        resultListUsers.records.forEach((item, index) => {
            let value = item.get('res');
            let properties = value.properties;
            let objUser = new User(value.identity, properties.name, properties.email, properties.password, properties.birthDate, properties.gender, properties.religion, properties.degree, properties.classYear, properties.photo);
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
        let query = `MATCH (res:User) WHERE ID(res) = ${userID} RETURN res`;
        let resultUserData = await session.run(query);
        if(resultUserData.records.length > 0){
            let value = resultUserData.records[0].get('res');
            let properties = value.properties;
            let userData = new User(value.identity, properties.name, properties.email, properties.password, properties.birthDate, properties.gender, properties.religion, properties.degree, properties.classYear, properties.photo);
            await session.close();
            return userData;
        } else{
            await session.close();
            return null;
        }
    }

    // Update user
    async update(userData){
        let userID = super.getID();
        let session = driver.session();
        let query = `MATCH (res:User) WHERE ID(res) = ${userID} SET res = {name: '${userData.name}', email: '${userData.email}', birthDate: '${userData.birthDate}', gender: '${userData.gender}', religion: '${userData.religion}', degree: '${userData.degree}', classYear: '${userData.classYear}', photo: '${userData.photo}'} RETURN res`;
        let resultUpdate = await session.run(query);
        if(resultUpdate.records.length > 0){
            let value = resultUpdate.records[0].get('res');
            let properties = value.properties;
            let userData = new User(value.identity, properties.name, properties.email, properties.password, properties.birthDate, properties.gender, properties.religion, properties.degree, properties.classYear, properties.photo);
            await session.close();
            return userData.toObject();
        } else {
            await session.close();
            return null;
        }
    }

    async addSkill(skillList){
        let userID = super.getID();
        let failedToAdd = [];
        let successToAdd = [];
        let length = skillList.length;
        let session = driver.session();

        for(let i=0; i < length; i++){
            let query = `MATCH (u:User), (s:Skill) WHERE ID(u) = ${userID} AND ID(s) = ${skillList[i]} CREATE (u)-[:SKILLED_IN]->(s) RETURN s`;
            let resultAddSkill = await session.run(query);
            if(resultAddSkill.records.length > 0){
                let valueSkill = resultAddSkill.records[0].get('s');
                let propertiesSkill = valueSkill.properties;
                let skill = new Skill(valueSkill.identity, propertiesSkill.name, propertiesSkill.uri);
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

    async removeSkill(skillID){
        let userID = super.getID();
        let session = driver.session();
        let query = `MATCH (u:User), (s:Skill) WHERE ID(u) = ${userID} AND ID(s) = ${skillID} (u)-[rel:SKILLED_IN]->(s) DELETE rel`;
        let resultDelete = await session.run(query);
        console.log(resultDelete);
    }
}

module.exports = User;