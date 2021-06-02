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
    #address;
    #phoneNumber;
    #programStudi;
    #angkatan;
    #skills;
    #createdAt;
    #updatedAt;
    #photo;

    constructor(userID, name, email, address, number, programStudi, angkatan, skill, photo, createdAt, updatedAt){
        super(userID); 
        this.#name = name;
        this.#email = email;
        this.#address = address;
        this.#phoneNumber = number;
        this.#programStudi = programStudi
        this.#angkatan = angkatan;
        this.#skills = skill;
        this.#photo = photo;
        this.#createdAt = createdAt;
        this.#updatedAt = updatedAt;
    }

    // Setter
    setName(newName){
        this.#name = newName;
    }
    setEmail(newEmail){
        this.#email = newEmail;
    }
    setAddress(newAddress){
        this.#address = newAddress;
    }
    setNumber(newNumber){
        this.#phoneNumber = newNumber;
    }
    setProgramStudi(newProgramStudi){
        this.#programStudi = newProgramStudi;
    }
    setAngkatan(newAngkatan){
        this.#angkatan = newAngkatan;
    }
    setSkills(listSkill){
        this.#skills = listSkill;
    }
    setUpdatedAt(updateTime){
        this.#updatedAt = updateTime;
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
    getAddress(){
        return this.#address;
    }
    getNumber(){
        return this.#phoneNumber;
    }
    getProgramStudi(){
        return this.#programStudi;
    }
    getAngkatan(){
        return this.#angkatan;
    }
    async getSkills(){
        let userID = super.getID();
        let session = driver.session();
        let query = `MATCH (n:User {userID: ${userID}})-[:SKILLED_IN]-(res:Skill) RETURN res`;
        let resultUserSkills = await session.run(query);
        let listSkill = [];
        resultUserSkills.records.forEach((item, index) => {
            let value = item.get('res').properties;
            let skillObj = new Skill(value.label, value.uri);
            listSkill.push(skillObj);
        });
        await session.close();
        return listSkill;
    }
    getCreatedUserData(){
        return this.#createdAt;
    }
    getUpdatedUserData(){
        return this.#updatedAt;
    }
    getPhoto(){
        return this.#photo;
    }

    toObject(){
        let userSkills = [];
        this.#skills.forEach((item, index) => {
            let objSkill = item.toObject();
            userSkills.push(objSkill);
        });

        let objResult = {
            name: this.#name,
            email: this.#email,
            address: this.#address,
            phoneNumer: this.#phoneNumber,
            programStudi: this.#programStudi,
            angkatan: this.#angkatan,
            userSkills: userSkills,
            createdAt: this.#createdAt,
            updatedAt: this.#updatedAt,
            photo: this.#photo
        };
        return objResult;
    }

    static async find(userID){
        let session = driver.session();
        let query = `MATCH (res:User {userID: ${userID}}) RETURN res`;
        let resultUserData = await session.run(query);
        if(resultUserData.records.length > 0){
            let value = resultUserData.records[0].get('res').properties;
            let objUser = new User(value.userID, value.name, value.email, value.address, value.phoneNumber, value.programStudi, value.angkatan, [], value.photo, null, null);
            await session.close();
            return objUser;
        } else{
            await session.close();
            return null;
        }
    }

    static async getUserSkills(userID){
        let session = driver.session();
        let query = `MATCH (n:User {userID: ${userID}})-[:SKILLED_IN]-(res:Skill) RETURN res`;
        let resultUserSkills = await session.run(query);
        let listSkill = [];
        resultUserSkills.records.forEach((item, index) => {
            let value = item.get('res').properties;
            let skillObj = new Skill(value.label, value.uri);
            listSkill.push(skillObj);
        });
        return listSkill;
    }

    // Additional profile data
    async addEducation(education){}
    async addCertification(certification){}
    async addWorkExp(){}
    async addAchievement(){}
    async addSkill(skillName){}
    
}

module.exports = User;