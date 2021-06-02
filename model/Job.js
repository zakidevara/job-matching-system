const Model = require("./Model");
const Skill = require('./Skill');
// Database
const neo4j = require('neo4j-driver');
const JobStudentMatcher = require("../controllers/matcher/JobStudentMatcher");
const User = require("./User");
const Applicant = require("./Applicant");
const user = 'neo4j';
const password = 'fakboi3';
const uri = 'bolt://localhost:7687';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    disableLosslessIntegers: true
});
class Job extends Model {
    // Property of job (private)
    #userID;
    #title;
    #description;
    #companyLogo;
    #companyName;
    #jobType;
    #salary;
    #createdAt;
    #updatedAt;
    #requiredSkills;
    #applicant
    #status;

    constructor(jobID, userID, title, desc, companyLogo, companyName, jobType, salary, createdAt = null, requiredSkills = null, applicant = null, status = 0){
        super(jobID);
        this.#userID = userID;
        this.#title = title;
        this.#description = desc;
        this.#companyLogo = companyLogo;
        this.#companyName = companyName;
        this.#jobType = jobType;
        this.#salary = salary;
        if(createdAt === null){
            let currentDate = new Date();
            this.#createdAt = currentDate.getDate() + "-" + 
                              (currentDate.getMonth()+1) + "-" +
                              currentDate.getFullYear() + "- " + 
                              currentDate.getHours() + ":" +
                              currentDate.getMinutes() + ":" +
                              currentDate.getSeconds();
        }
        if(requiredSkills === null){
            this.#requiredSkills = [];
        } else {
            this.#requiredSkills = requiredSkills;
        }
        if(applicant === null){
            this.#applicant = [];
        } else {
            this.#applicant = applicant;
        }
        this.#status = status;
    }

    // Setter
    setUserID(userID){
        this.#userID = userID;
    }
    setTitle(newTitle){
        this.#title = newTitle;
    }
    setDesc(newDesc){
        this.#description = newDesc;
    }
    setCompanyLogo(companyLogo){
        this.#companyLogo = companyLogo;
    }
    setCompanyName(companyName){
        this.#companyName = companyName;
    }
    setJobType(jobType){
        this.#jobType = jobType;
    }
    setSalary(salary){
        this.#salary = salary;
    }
    setUpdateJobData(updateTime){
        this.#updatedAt = updateTime;
    }
    setRequiredSkills(listSkill){
        this.#requiredSkills = listSkill;
    }
    setApplicant(applicant){
        this.#applicant = applicant;
    }
    setStatus(status){
        this.#status = status;
    }

    // Getter
    getJobID(){
        return super.getID();
    }
    getUserID(){
        return this.#userID;
    }
    getTitle(){
        return this.#title;
    }
    getDesc(){
        return this.#description;
    }
    getCompanyLogo(){
        return this.#companyLogo;
    }
    getCompanyName(){
        return this.#companyName;
    }
    getJobType(){
        return this.#jobType;
    }
    getSalary(){
        return this.#salary;
    }
    getCreatedJobData(){
        return this.#createdAt;
    }
    getUpdatedJobData(){
        return this.#updatedAt;
    }
    async getRequiredSkills(){
        let jobID = super.getID();
        let session = driver.session();
        let query = `MATCH (j:Job {jobID: ${jobID}})-[:REQUIRES_SKILL]->(res:Skill) RETURN res`;
        let resultListSkill = await session.run(query);
        let listSkill = [];
        resultListSkill.records.forEach((item, index) => {
            let value = item.get('res').properties;
            let skillObj = new Skill(value.label, value.uri);
            listSkill.push(skillObj);
        });
        await session.close();
        this.#requiredSkills =  listSkill;
        return this.#requiredSkills;
    }
    async getApplicant(){
        let jobID = super.getID();
        let session = driver.session();
        let query = `MATCH (j:Job {jobID: ${jobID}})<-[res:APPLY]-(:User) RETURN res`;
        let resultApplicant = await session.run(query);
        let listApplicant = [];
        resultApplicant.records.forEach((item, index) => {
            let value = item.get('res').properties;
            let objApplicant = new Applicant(value.userID, value.dateApplied, value.similarity);
            listApplicant.push(objApplicant);
        });
        this.#applicant = listApplicant;
        return this.#applicant;
    }
    getStatus(){
        return this.#status;
    }

    toObject(){
        let requiredSkills = [];
        this.#requiredSkills.forEach((item, index) => {
            let objSKill = item.toObject();
            requiredSkills.push(objSKill);
        });

        let objResult = {
            userID: this.#userID,
            title: this.#title,
            description: this.#description,
            companyLogo: this.#companyLogo,
            companyName: this.#companyName,
            jobType: this.#jobType,
            salary: this.#salary,
            createdAt: this.#createdAt,
            updatedAt: this.#updatedAt,
            requiredSkills: requiredSkills,
            applicant: this.#applicant,
            status: this.#status
        };
        return objResult;
    }

    validateJobStatus(){
        return this.#status === 1 ? true : false;
    }

    static async find(jobID){
        let session = driver.session();
        let query = `MATCH (res:Job {jobID: ${jobID}}) RETURN res`;
        let result = await session.run(query);
        if(result.records.length > 0){
            let value = result.records[0].get('res').properties;
            let jobObj = new Job(value.jobID, value.userID, value.title, value.description, value.companyLogo, value.companyName, value.jobType,
                value.salary, value.createdAt, null, null, value.status);
            await session.close();
            return jobObj;
        } else {
            await session.close();
            return null;
        }
    }

    async apply(user){
        let session = driver.session();
        let userID = user.getID();
        let jobID = super.getID();
        let query = `MATCH (u:User {userID: ${userID}})-[:APPLY]->(j:Job {jobID: ${jobID}}) RETURN u,j`;
        let validateUserAndJob = await session.run(query);
        if(validateUserAndJob.records.length != 0){
            await session.close();
            return 5;   // User already apply to selected job
        } else {
            // Calculate similarity applicant with selected job
            let listUserSkills = await User.getUserSkills(userID);
            user.setSkills(listUserSkills);
            let similarity = await JobStudentMatcher.match(this, user);
            let currentDate = new Date();
            let dateApplied = currentDate.getDate() + "-" + 
                              (currentDate.getMonth()+1) + "-" +
                              currentDate.getFullYear();
            
            let secQuery = `MATCH (u:User), (j:Job) WHERE u.userID = ${userID} AND j.jobID = ${jobID} CREATE (u)-[rel:APPLY {userID: ${userID}, dateApplied: '${dateApplied}', similarity: ${similarity}}]->(j) RETURN rel`;
            let result = await session.run(secQuery);
            if(result.records.length > 0){
                await session.close();
                return 1; // Relationship created
            } else {
                await session.close();
                return 0; // Relationship failed
            }
        }
    }

    static async getAllAvailableJob(){
        let session = driver.session();
        let resultListJob = await session.run(`MATCH (res:Job {status: 1}) RETURN res`);
        let listJob = [];
        resultListJob.records.forEach((item, index) => {
            let value = item.get('res').properties;
            let jobObj = new Job(value.jobID, value.userID, value.title, value.description, value.companyLogo, value.companyName, value.jobType,
                                value.salary, value.createdAt, null, null, value.status);
            listJob.push(jobObj);
        });
        await session.close();
        return listJob;
    }

    static async getJobRequiredSkill(jobID){
        let session = driver.session();
        let query = `MATCH (j:Job {jobID: ${jobID}})-[:REQUIRES_SKILL]->(res:Skill) RETURN res`;
        let resultListSkill = await session.run(query);
        let listSkill = [];
        resultListSkill.records.forEach((item, index) => {
            let value = item.get('res').properties;
            let skillObj = new Skill(value.label, value.uri);
            listSkill.push(skillObj);
        });
        await session.close();
        return listSkill;
    }
    
}

module.exports = Job;