const Model = require("./Model");
const Skill = require('./Skill');
// Database
const neo4j = require('neo4j-driver');
const JobStudentMatcher = require("../controllers/matcher/JobStudentMatcher");
const User = require("./User");
const Applicant = require("./Applicant");
const driver = neo4j.driver(process.env.uri_lokal, neo4j.auth.basic(process.env.user, process.env.password_lokal), {
    disableLosslessIntegers: true
});
class Job extends Model {
    // Property of job (private)
    #userID;
    #title;
    #quantity;
    #location;
    #contact;
    #benefits;
    #description;
    #duration;
    #remote;
    #companyName;
    #endDate;
    #minSalary;
    #maxSalary;
    #status;

    constructor(jobID, userID=null, title, quantity, location='', contact='', benefits='', description, duration='', remote=true, companyName='', endDate, minSalary='', maxSalary='', status=1){
        super(jobID);
        this.#userID = userID;
        this.#title = title;
        this.#quantity = quantity;
        this.#location = location;
        this.#contact = contact;
        this.#benefits = benefits;
        this.#description = description;
        this.#duration = duration;
        this.#remote = remote;
        this.#companyName = companyName;
        this.#endDate = endDate;
        this.#minSalary = minSalary;
        this.#maxSalary = maxSalary;
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
    getCompanyName(){
        return this.#companyName;
    }
    async getRequiredSkills(){
        let jobID = super.getID();
        let session = driver.session();
        let query = `MATCH (j:Job)-[:REQUIRES_SKILL]->(res:Skill) WHERE ID(j) = ${jobID} RETURN res`;
        let resultListSkill = await session.run(query);
        let listSkill = [];
        resultListSkill.records.forEach((item, index) => {
            let value = item.get('res');
            let properties = value.properties;
            let skillObj = new Skill(value.identity, properties.name, properties.uri);
            listSkill.push(skillObj);
        });
        await session.close();
        return listSkill;
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
        return listApplicant;
    }
    getStatus(){
        return this.#status;
    }

    toObject(){
        let objResult = {
            userID: this.#userID,
            title: this.#title,
            quantity: this.#quantity,
            location: this.#location,
            contact: this.#contact,
            benefits: this.#benefits,
            description: this.#description,
            duration: this.#duration,
            remote: this.#remote,
            companyName: this.#companyName,
            endDate: this.#endDate,
            minSalary: this.#minSalary,
            maxSalary: this.#maxSalary,
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
            let value = item.get('res');
            let properties = value.properties;
            let jobObj = new Job(value.identity, null, properties.title, properties.quantity, properties.location, properties.contact, properties.benefits, properties.description, properties.duration, properties.remote, properties.companyName, properties.endDate, properties.minSalary, properties.maxSalary, properties.status);
            listJob.push(jobObj);
        });
        await session.close();
        return listJob;
    }

    // static async getJobRequiredSkill(jobID){
    //     let session = driver.session();
    //     let query = `MATCH (j:Job {jobID: ${jobID}})-[:REQUIRES_SKILL]->(res:Skill) RETURN res`;
    //     let resultListSkill = await session.run(query);
    //     let listSkill = [];
    //     resultListSkill.records.forEach((item, index) => {
    //         let value = item.get('res').properties;
    //         let skillObj = new Skill(value.label, value.uri);
    //         listSkill.push(skillObj);
    //     });
    //     await session.close();
    //     return listSkill;
    // }
    
}

module.exports = Job;