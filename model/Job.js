const {Model, driver, uuidv4} = require("./Model");
const Skill = require('./Skill');

const JobStudentMatcher = require("../application/matcher/JobStudentMatcher");
const User = require("./User");
const Applicant = require("./Applicant");
const JobRequirement = require("./JobRequirement");
const Religion = require("./Religion");
const JobType = require("./JobType");

class Job extends Model {
    // Property of job (private)
    #jobID;
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

    constructor(jobID, userID, title, quantity, location='', contact='', benefits='', description='', duration='', remote=false, companyName='', endDate='', minSalary=0, maxSalary=0, status=true){
        super();
        this.#jobID = jobID;
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
        return this.#jobID;
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
        let session = driver.session();
        let query = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES_SKILL]->(s:Skill) Return s`;
        let resultListSkill = await session.run(query);
        let listSkill = [];
        resultListSkill.records.forEach((item, index) => {
            let value = item.get('s');
            let properties = value.properties;
            let skillObj = new Skill(properties.name, properties.uri);
            listSkill.push(skillObj);
        });
        await session.close();
        return listSkill;
    }
    async getApplicant(){
        let session = driver.session();
        let query = `MATCH (j:Job {jobID: '${this.#jobID}'})<-[res:APPLY]-(:User) RETURN res`;
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
            jobID: this.#jobID,
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

    // Database related

    // Get all job
    static async getAllAvailableJob(){
        let session = driver.session();
        let resultListJob = await session.run(`MATCH (j:Job {status: true})<-[:POSTS]-(u:User) RETURN j, u ORDER BY j.jobID`);
        let jobData = [];
        resultListJob.records.forEach((item, index) => {
           let propJob = item.get('j').properties;
           let propUser = item.get('u').properties;
           let job = new Job(propJob.jobID, propUser.nim, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status);
           let objJob = {};
           objJob['job'] = job.toObject();
           objJob['jobReq'] = {};
           objJob['jobType'] = {};
           jobData.push(objJob);
        });

        for(let i=0; i<jobData.length; i++){
            let value = jobData[i];
            // Get the rest of requirement of Job
            let queryJobReq = `MATCH (j:Job {jobID : '${value.job.jobID}'})-[:REQUIRES]->(jr:JobReq), (j)-[:CLASSIFIED]->(jt:JobType), (jr)-[:REQUIRES_SKILL]->(s:Skill) RETURN jr, jt, s`;
            let resultJobReq = await session.run(queryJobReq);
            let listSkills = [];
            let listReligions = [];
            let jobReqData = {};
            if(resultJobReq.records.length > 0){
                resultJobReq.records.forEach((item, index) => {
                    if(index == 0){
                        let propJobReq = item.get('jr').properties;
                        let jobReq = new JobRequirement(propJobReq.classYearRequirement, propJobReq.studyProgramRequirement, propJobReq.documentRequirement, [], propJobReq.softSkillRequirment, propJobReq.maximumAge, [], propJobReq.requiredGender, propJobReq.description);
                        jobReqData = jobReq;

                        let propJobType = item.get('jt').properties;
                        let jobType = new JobType(propJobType.id, propJobType.name);
                        value.jobType = jobType.toObject();
                    }

                    let propSkill = item.get('s').properties;
                    let skill = new Skill(propSkill.name, propSkill.uri);
                    if(listSkills.length == 0){
                        listSkills.push(skill.toObject());
                    } else {
                        let validateItem = listSkills.some(sk => (sk.name === skill.getName()) && (sk.uri === skill.getUri()));
                        if(!validateItem){
                            listSkills.push(skill.toObject());
                        }
                    }
                });
                jobReqData.setSkills(listSkills);

                let queryReligions = `MATCH (j:Job {jobID : '${value.job.jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_RELIGION]->(r:Religion) RETURN r`;
                let resultReligions = await session.run(queryReligions);
                if(resultReligions.records.length > 0){
                    resultReligions.records.forEach((item, index) => {
                        let value = item.get('r').properties;
                        let religion = new Religion(value.id, value.name);
                        listReligions.push(religion.toObject());
                    });
                    jobReqData.setReligions(listReligions);
                }
                value.jobReq = jobReqData.toObject();
            }
            jobData[i] = value;
        }
        let finalJobData = [];
        jobData.forEach((item, index) => {
            let requirements = {
                studyProgramReq: item.jobReq.studyProgramRequirement,
                classYearRequirement: item.jobReq.classYearRequirement,
                documentsRequirement: item.jobReq.documentsRequirement,
                requiredSkills: item.jobReq.requiredSkills,
                softSkillRequirment: item.jobReq.softSkillRequirment,
                maximumAge: item.jobReq.maximumAge,
                requiredReligion: item.jobReq.requiredReligion,
                requiredGender: item.jobReq.requiredGender,
                description: item.jobReq.description
            };
            let objJobType = {
                id: item.jobType.id,
                name: item.jobType.name
            };
            let objJob = {
                jobID: item.job.jobID,
                title: item.job.title,
                description: item.job.description,
                jobType: objJobType,
                companyName: item.job.companyName,
                remote: item.job.remote,
                location: item.job.location,
                duration: item.job.duration,
                benefits: item.job.benefits,
                contact: item.job.contact,
                quantity: item.job.quantity,
                minSalary: item.job.minSalary,
                maxSalary: item.job.maxSalary,
                endDate: item.job.endDate,
                requirements: requirements,
                status: item.job.status
            };
            finalJobData.push(objJob);
        });
        return finalJobData;
    }

    // Create new job
    static async create(jobData){
        let session = driver.session();
        let jobID = uuidv4();
        let userID = '181511041';

        let contact = jobData.contact;
        contact = contact.replace(/\\n/g, function(x) {
            return '\\\\n';
        });
        contact = contact.replace(/\\r/g, function(x) {
            return '\\\\r';
        });
        // First section of query
        let query = `MERGE (j:Job {jobID: '${jobID}'})
                     SET j.title = '${jobData.title}',
                     j.quantity = ${jobData.quantity},
                     j.contact = '${contact}',
                     j.status = true,
                     j.endDate = '${jobData.endDate}',`;
        delete jobData['title'];
        delete jobData['quantity'];
        delete jobData['contact'];
        delete jobData['endDate'];
        let jobProperty = Object.keys(jobData);
        for(let i=0; i < jobProperty.length; i++){
            let currProp = jobProperty[i];
            if(jobData[currProp] !== null && currProp !== 'requirements' && currProp !== 'jobType'){
                let value = jobData[currProp];
                if(currProp !== 'remote' && currProp !== 'minSalary' && currProp !== 'maxSalary'){
                    value = value.replace(/\\n/g, function(x) {
                        return '\\\\n';
                    });
                    value = value.replace(/\\r/g, function(x) {
                        return '\\\\r';
                    });
                    query += `j.` + currProp + ` = '${value}',`
                } else {
                    query += `j.` + currProp + ` = ${value},`;
                }
            }
        }
        // Remove comma at the end of char from current query
        query = query.substr(0, query.length-1);
        
        // Second section of query 
        query += ` CREATE (jr:JobReq) 
                    SET `;
        let requirementProperty = Object.keys(jobData.requirements);
        if(jobData.hasOwnProperty('requirements')){
            requirementProperty.forEach((item, index, array) => {
                if(jobData.requirements[item] !== null){
                    if(item !== 'requiredSkills' && item !== 'requiredReligion'){
                        if(Array.isArray(jobData.requirements[item])){
                            query += ` jr.` + item + ` = [${jobData.requirements[item].join()}],`;
                        } else {
                            let value = jobData.requirements[item];
                            if(item !== 'maximumAge'){
                                value = value.replace(/\\n/g, function(x) {
                                    return '\\\\n';
                                });
                                value = value.replace(/\\r/g, function(x) {
                                    return '\\\\r';
                                });
                                query += ` jr.` + item + ` = '${value}',`;
                            } else {
                                query += ` jr.` + item + ` = ${value},`;
                            }
                        }
                    }
                } else {
                    delete array[index];
                }
            });

            // Remove comma at the end of char from current query
            query = query.substr(0, query.length-1);

            // Third section of query
            query += ` MERGE (j)-[:REQUIRES]->(jr)`;
            var reqRelStat = false;
            if(requirementProperty.includes('requiredSkills')){
                let requiredSkills = jobData.requirements.requiredSkills;
                query += ` WITH j, jr
                          UNWIND [`; 
                for(let i=0; i < requiredSkills.length; i++){
                    let value = requiredSkills[i];
                    query += `"${value}",`;
                }
                // Remove comma at the end of char from current query
                query = query.substr(0, query.length-1);
                query += `] AS sk
                          MERGE (s:Skill {id: sk})
                          MERGE (jr)-[:REQUIRES_SKILL]->(s)`;
            }
            if(requirementProperty.includes('requiredReligion')){
                let requiredReligion = jobData.requirements.requiredReligion;
                query += ` WITH j, jr, s
                            UNWIND [`;
                for(let i=0; i < requiredReligion.length; i++){
                    let value = requiredReligion[i];
                    query += `"${value}",`;
                }
                // Remove comma at the end of char from current query
                query = query.substr(0, query.length-1);
                query += `] AS rl
                            MERGE (r:Religion {id: rl})
                            MERGE (jr)-[:REQUIRES_RELIGION]->(r)`;
                reqRelStat = true;
            }
        }
        if(reqRelStat){
            query += ` WITH j,jr,s,r
                  MERGE (jt:JobType {id: '${jobData.jobType}'})
                  MERGE (j)-[:CLASSIFIED]->(jt)
                  MERGE (u:User {nim: '${userID}'})
                  MERGE (u)-[:POSTS]->(j)
                  RETURN j,jr,s,r,jt,u`;
        } else {
            query += ` WITH j,jr,s
                  MERGE (jt:JobType {id: '${jobData.jobType}'})
                  MERGE (j)-[:CLASSIFIED]->(jt)
                  MERGE (u:User {nim: '${userID}'})
                  MERGE (u)-[:POSTS]->(j)
                  RETURN j,jr,s,jt,u`;
        }
        console.log(query);
        let resultCreateJob = await session.run(query);
        let newJob = {};
        let jobRequirement = {};
        let tempJobReq = {};
        let listSkills = [];
        let listReligions = [];
        let jobTypeData = {};

        resultCreateJob.records.forEach((item, index) => {
            if(reqRelStat){
                if(index == 0){
                    // Job, Job Requirement, Job Type and User data appears in every index of array (same value)
                    // So... just get at first index 
                    let propJob = item.get('j').properties;
                    let propUser = item.get('u').properties;
                    let job =  new Job(propJob.jobID, propUser.nim, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status);
                    newJob = job.toObject();

                    let propJobReq = item.get('jr').properties;
                    tempJobReq = new JobRequirement(propJobReq.classYearRequirement, propJobReq.studyProgramRequirement, propJobReq.documentRequirement, [], propJobReq.softSkillRequirment, propJobReq.maximumAge, [], propJobReq.requiredGender, propJobReq.description);

                    let propJobType = item.get('jt').properties;
                    let jobType = new JobType(propJobType.id, propJobType.name);
                    jobTypeData = jobType.toObject();
                }

                let propSkill = item.get('s').properties;
                let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                if(listSkills.length == 0){
                    listSkills.push(skill.toObject());
                } else {
                    let validateItem = listSkills.some(sk => sk.id === skill.getID());
                    if(!validateItem){
                        listSkills.push(skill.toObject());
                    }
                }

                let propReligion = item.get('r').properties;
                let religion = new Religion(propReligion.id, propReligion.name);
                if(listReligions.length == 0){
                    listReligions.push(religion.toObject());
                } else {
                    let validateItem = listReligions.some(rl => (rl.id === religion.getReligionID()) && (rl.name === religion.getName()));
                    if(!validateItem){
                        listReligions.push(religion.toObject());
                    }
                }
            } else {
                if(index == 0){
                    // Job, Job Requirement, Job Type and User data appears in every index of array (same value)
                    // So... just get at first index 
                    let propJob = item.get('j').properties;
                    let propUser = item.get('u').properties;
                    let job =  new Job(propJob.jobID, propUser.nim, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status);
                    newJob = job.toObject();

                    let propJobReq = item.get('jr').properties;
                    tempJobReq = new JobRequirement(propJobReq.classYearRequirement, propJobReq.studyProgramRequirement, propJobReq.documentRequirement, [], propJobReq.softSkillRequirment, propJobReq.maximumAge, [], propJobReq.requiredGender, propJobReq.description);

                    let propJobType = item.get('jt').properties;
                    let jobType = new JobType(propJobType.id, propJobType.name);
                    jobTypeData = jobType.toObject();
                }

                let propSkill = item.get('s').properties;
                let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                if(listSkills.length == 0){
                    listSkills.push(skill);
                } else {
                    let validateItem = listSkills.some(sk => sk.id === skill.getID());
                    if(!validateItem){
                        listSkills.push(skill);
                    }
                }
            }
        });
        tempJobReq.setSkills(listSkills);
        if(reqRelStat){
            tempJobReq.setReligions(listReligions);
        }
        jobRequirement = tempJobReq.toObject();

        let finalRequirements = {
            studyProgramReq: jobRequirement.studyProgramRequirement,
            classYearRequirement: jobRequirement.classYearRequirement,
            documentsRequirement: jobRequirement.documentsRequirement,
            requiredSkills: jobRequirement.requiredSkills,
            softSkillRequirment: jobRequirement.softSkillRequirment,
            maximumAge: jobRequirement.maximumAge,
            requiredReligion: jobRequirement.requiredReligion,
            requiredGender: jobRequirement.requiredGender,
            description: jobRequirement.description
        };
        let resultObj = {
            jobID: newJob.jobID,
            title: newJob.title,
            description: newJob.description,
            jobType: jobTypeData,
            companyName: newJob.companyName,
            remote: newJob.remote,
            location: newJob.location,
            duration: newJob.duration,
            benefits: newJob.benefits,
            contact: newJob.contact,
            quantity: newJob.quantity,
            minSalary: newJob.minSalary,
            maxSalary: newJob.maxSalary,
            endDate: newJob.endDate,
            requirements: finalRequirements,
            status: newJob.status
        }
        await session.close();
        return resultObj;
    }

    static async find(jobID){
        let session = driver.session();
        let query = `MATCH (j:Job {jobID: '${jobID}'})-[:REQUIRES]->(jr:JobReq), (j)<-[:POSTS]-(u:User), (j)-[:CLASSIFIED]->(jt:JobType), (jr)-[:REQUIRES_SKILL]->(s:Skill) RETURN j,jr,u,jt,s`;

        let result = await session.run(query);
        if(result.records.length > 0){
            // Extract the data
            let propJob = result.records[0].get('j').properties;
            let propUser = result.records[0].get('u').properties;
            let propJobType = result.records[0].get('jt').properties;
            let propJobReq = result.records[0].get('jr').properties;

            let job = new Job(propJob.jobID, propUser.nim, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status);

            let jobType = new JobType(propJobType.id, propJobType.name);

            let jobReq = new JobRequirement(propJobReq.classYearRequirement, propJobReq.studyProgramRequirement, propJobReq.documentRequirement, [], propJobReq.softSkillRequirment, propJobReq.maximumAge, [], propJobReq.requiredGender, propJobReq.description);

            let listSkills = [];
            result.records.forEach((item, index) => {
                let propSkill = item.get('s').properties;
                let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                if(listSkills.length == 0){
                    listSkills.push(skill.toObject());
                } else {
                    let validateItem = listSkills.some(sk => sk.id === skill.getID());
                    if(!validateItem){
                        listSkills.push(skill.toObject());
                    }
                }
            });

            let queryReligions = `MATCH (j:Job {jobID: '${jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_RELIGION]->(r:Religion) RETURN r`;
            let resultReligions = await session.run(queryReligions);
            let listReligions = [];
            if(resultReligions.records.length > 0){
                resultReligions.records.forEach((item, index) => {
                    let value = item.get('r').properties;
                    let religion = new Religion(value.id, value.name);
                    listReligions.push(religion.toObject());
                });
            }
            jobReq.setSkills(listSkills);
            jobReq.setReligions(listReligions);
            
            let resultObj = {
                job: job,
                jobType: jobType,
                jobReq: jobReq
            };
            await session.close();
            return resultObj;
        } else {
            await session.close();
            return null;
        }
    }

    async update(updatedJobData, jobReq, jobType){
        let session = driver.session();
        
        // Cleaning string data
        let contact = updatedJobData.contact;
        contact = contact.replace(/\\n/g, function(x) {
            return '\\\\n';
        });
        contact = contact.replace(/\\r/g, function(x) {
            return '\\\\r';
        });

        // First section of query
        let query = ``;
        let valReqRel = jobReq.getReligion().length > 0;
        if(valReqRel){
            query += `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq), (j)-[:CLASSIFIED]->(ojt:JobType), (jr)-[:REQUIRES_RELIGION]->(ore:Religion)   
                     SET j.title = '${updatedJobData.title}',
                     j.quantity = ${updatedJobData.quantity},
                     j.contact = '${contact}',
                     j.status = ${updatedJobData.status},
                     j.endDate = '${updatedJobData.endDate}',`;
        } else {
            query += `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq), (j)-[:CLASSIFIED]->(ojt:JobType)  
                     SET j.title = '${updatedJobData.title}',
                     j.quantity = ${updatedJobData.quantity},
                     j.contact = '${contact}',
                     j.status = ${updatedJobData.status},
                     j.endDate = '${updatedJobData.endDate}',`;
        }
        delete updatedJobData['jobId'];
        delete updatedJobData['title'];
        delete updatedJobData['quantity'];
        delete updatedJobData['contact'];
        delete updatedJobData['status'];
        delete updatedJobData['endDate'];

        let jobProperty = Object.keys(updatedJobData);
        for(let i=0; i < jobProperty.length; i++){
            let currProp = jobProperty[i];
            if(currProp !== 'requirements' && currProp !== 'jobType'){
                let value = updatedJobData[currProp];
                if(currProp !== 'remote' && currProp !== 'minSalary' && currProp !== 'maxSalary'){
                    value = value.replace(/\\n/g, function(x) {
                        return '\\\\n';
                    });
                    value = value.replace(/\\r/g, function(x) {
                        return '\\\\r';
                    });
                    query += ` j.` + currProp + ` = '${value}',`;
                } else {
                    query += ` j.` + currProp + ` = ${value},`;
                }
            }
        }
        // Remove comma at the end of char from current query
        query = query.substr(0, query.length-1);

        // Second section of query
        if(valReqRel){
            query += ` WITH j, jr, ojt, ore 
                    SET `;
        } else {
            query += ` WITH j, jr, ojt 
                    SET `;
        }
        
        if(updatedJobData.hasOwnProperty('requirements')){
            let requirementsProp = Object.keys(updatedJobData.requirements);
            requirementsProp.forEach((item, array, index) => {
                if(item !== 'requiredSkills' && item !== 'requiredReligion'){
                    if(Array.isArray(updatedJobData.requirements[item])){
                        query += ` jr.` + item + ` = [${updatedJobData.requirements[item].join()}],`;
                    } else {
                        let value = updatedJobData.requirements[item];
                        if(item !== 'maximumAge'){
                            value = value.replace(/\\n/g, function(x) {
                                return '\\\\n';
                            });
                            value = value.replace(/\\r/g, function(x) {
                                return '\\\\r';
                            });
                            query += ` jr.` + item + ` = '${value}',`;
                        } else {
                            query += ` jr.` + item + ` = ${value},`;
                        }
                    }
                }
            });
            // Remove comma at the end of char from current query
            query = query.substr(0, query.length-1);
            var reqRelStat = false;
            if(requirementsProp.includes('requiredSkills')){
                // First delete removed skill
                if(valReqRel){
                    query += ` WITH j, jr, ojt, ore
                    UNWIND [`;
                } else {
                    query += ` WITH j, jr, ojt 
                    UNWIND [`;
                }
                let newListSkills = updatedJobData.requirements.requiredSkills;
                let currListSkills = jobReq.getSkills();
                let diffSkill = currListSkills.filter((el) => {
                    return !newListSkills.some(sk => el.id === sk);
                });
                if(diffSkill.length > 0){
                    for(let i=0; i < diffSkill.length; i++){
                        let value = diffSkill[i].id;
                        query += `"${value}",`;
                    }
                    query = query.substr(0, query.length-1);
                    query += `] AS sk
                             MERGE (jr)-[re:REQUIRES_SKILL]->(s:Skill {id: sk})
                             DELETE re`;
                }
                
                // Next add newest skills
                if(valReqRel){
                    query += ` WITH j, jr, ojt, ore 
                    UNWIND [`;
                } else {
                    query += ` WITH j, jr, ojt 
                    UNWIND [`;
                }
                for(let i=0; i < newListSkills.length; i++){
                    let value = newListSkills[i];
                    query += `"${value}",`;
                }
                query = query.substr(0, query.length-1);
                query += `] AS sk
                            MERGE (s:Skill {id: sk})
                            MERGE (jr)-[:REQUIRES_SKILL]->(s) `;
            }
            if(requirementsProp.includes('requiredReligion')){
                // First delete removed religion
                let newListReligion = updatedJobData.requirements.requiredReligion;
                if(newListReligion.length > 0){
                    let currListReligion = jobReq.getReligion();
                    let diffReligion = currListReligion.filter((el) => {
                        return !newListReligion.some(rl => el.id === rl);
                    });
                    if(diffReligion.length > 0){
                        query += ` WITH j, jr, ojt, s 
                        UNWIND [`;
                        for(let i=0; i < diffReligion.length; i++){
                            let value = diffReligion[i].id;
                            query += `"${value}",`;
                        }
                        query = query.substr(0, query.length-1);
                        query += `] AS rl
                                MERGE (jr)-[re:REQUIRES_RELIGION]->(r:Religion {id: rl})
                                DELETE re`;

                        // Next add newest religion
                        query += `WITH j, jr, ojt, s 
                                    UNWIND [`;
                        for(let i=0; i < newListReligion.length; i++){
                            let value = newListReligion[i];
                            query += `"${value}",`;
                        }
                        query = query.substr(0, query.length-1);
                        query += `] AS rl
                                MERGE (r:Religion {id: rl})
                                MERGE (jr)-[:REQUIRES_RELIGION]->(r) `;
                        reqRelStat = true;
                    }
                }
                // Delete current
            }
        }
        let jtChanges = false;
        if(reqRelStat){
            if(jobType.getID() !== updatedJobData.jobType){
                jtChanges = true;
                query += ` WITH j, jr, s, r
                            MERGE (j)-[re:CLASSIFIED]->(:JobType {id: '${jobType.getID()}'})
                            DELETE re
                            MERGE (jt:JobType {id: '${updatedJobData.jobType}'})
                            MERGE (j)-[:CLASSIFIED]->(jt)
                            RETURN j, jr, s, r, jt`;
            } else {
                query += `RETURN j, jr, s, r, ojt, ore`;
            }
        } else {
            if(jobType.getID() !== updatedJobData.jobType){
                jtChanges = true;
                query += ` WITH j, jr, s, ore
                            MERGE (j)-[re:CLASSIFIED]->(:JobType {id: '${jobType.getID()}'})
                            DELETE re
                            MERGE (jt:JobType {id: '${updatedJobData.jobType}'})
                            MERGE (j)-[:CLASSIFIED]->(jt)
                            RETURN j, jr, s, r, jt, ore`;
            } else {
                query += `RETURN j, jr, s, ojt, ore`;
            }
        }
        console.log('newest query: ', query);
        // let result = await session.run(query);
    }

    async delete(){
        let session = driver.session();
        let query = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq) DETACH DELETE j,jr RETURN COUNT(j)`;
        let result = await session.run(query);
        if(result.records.length > 0){
            return 'Success';
        } else {
            return 'Failed';
        }
    }

    async apply(user){
        let session = driver.session();
        let userID = user.getNim();
        let jobID = this.#jobID;
        let query = `MATCH (u:User {nim: '${userID}'})-[:APPLY]->(j:Job {jobID: '${jobID}'}) RETURN u,j`;
        let validateUserAndJob = await session.run(query);
        if(validateUserAndJob.records.length != 0){
            await session.close();
            return 5;   // User already apply to selected job
        } else {
            // Calculate similarity applicant with selected job
            let similarity = await JobStudentMatcher.match(this, user);
            let currentDate = new Date();
            let dateApplied = currentDate.getFullYear() + "-" + 
                              (currentDate.getMonth()+1) + "-" +
                              currentDate.getDate();    
            
            let secQuery = `MATCH (u:User), (j:Job) WHERE u.nim = '${userID}' AND j.jobID = '${jobID}' CREATE (u)-[rel:APPLY {userID: '${userID}', dateApplied: '${dateApplied}', similarity: ${similarity}}]->(j) RETURN rel`;
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
}

module.exports = Job;