const Model = require("./Model");
const Skill = require('./Skill');
// UUID
const {v4: uuidv4 } = require('uuid');
const DB = require("../services/DB");

const JobStudentMatcher = require("../application/matcher/JobStudentMatcher");
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

    constructor(jobID='', userID='', title='', quantity=0, location='', contact='', benefits='', description='', duration='', remote=false, companyName='', endDate='', minSalary=0, maxSalary=0, status=true){
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
        let query = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_SKILL]->(s:Skill) RETURN s`;
        try{
            let resultListSkill = await DB.query(query);
            let listSkill = [];
            resultListSkill.records.forEach((item) => {
                let propSkill = item.get('s').properties;
                let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                if(listSkill.length == 0){
                    listSkill.push(skill);
                } else {
                    let validateItem = listSkill.some(sk => sk.getID() === skill.getID());
                    if(!validateItem){
                        listSkill.push(skill);
                    }
                }
            });
            return listSkill;
        }catch(e){
            throw e;
        }
    }
    async getApplicant(){
        let query = `MATCH (j:Job {jobID: '${this.#jobID}'})<-[re:APPLY]-(:User) RETURN re`;
        try{
            let resultApplicant = await DB.query(query);
            let listApplicant = [];
            resultApplicant.records.forEach((item) => {
                let propApl = item.get('re').properties;
                let applicant = new Applicant(propApl.userID, propApl.dateApplied, propApl.similarity, propApl.status);
                listApplicant.push(applicant);
            });
            return listApplicant;
        }catch(e){
            throw e;
        }
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
        let date = new Date();
        let currentDate = `${date.getFullYear()}-0${date.getMonth()+1}-${date.getDate()}`;
        let query = `WITH split('${currentDate}', '-') AS cd 
                    MATCH (j:Job)<-[:POSTS]-(u:User) 
                    WITH cd, split(j.endDate, '-') AS ed, j, u
                    WHERE (cd[0] < ed[0]) OR (cd[0] = ed[0] AND ((cd[1] < ed[1]) OR (cd[1] = ed[1] AND (cd[2] < ed[2])))) 
                    RETURN j, u ORDER BY j.jobID`;
        try{
            let resultListJob = await DB.query(query);
            if(resultListJob.records.length > 0){
                let jobData = [];
                resultListJob.records.forEach((item) => {
                    // Extract every job
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
                    try{
                        let resultJobReq = await DB.query(queryJobReq);
                        let listSkills = [];
                        let listReligions = [];
                        let jobReqData = {};
                        if(resultJobReq.records.length > 0){
                            resultJobReq.records.forEach((item, index) => {
                                if(index === 0){
                                    let propJobReq = item.get('jr').properties;
                                    let jobReq = new JobRequirement(propJobReq.classYearRequirement, propJobReq.studyProgramRequirement, propJobReq.documentRequirement, [], propJobReq.softSkillRequirment, propJobReq.maximumAge, [], propJobReq.requiredGender, propJobReq.description);
                                    jobReqData = jobReq;
        
                                    let propJobType = item.get('jt').properties;
                                    let jobType = new JobType(propJobType.id, propJobType.name);
                                    value.jobType = jobType.toObject();
                                }
        
                                let propSkill = item.get('s').properties;
                                let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                                if(listSkills.length === 0){
                                    listSkills.push(skill.toObject());
                                } else {
                                    let validateItem = listSkills.some(sk => sk.id === skill.getID());
                                    if(!validateItem){
                                        listSkills.push(skill.toObject());
                                    }
                                }
                            });
                            jobReqData.setSkills(listSkills);
        
                            let queryReligions = `MATCH (j:Job {jobID : '${value.job.jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_RELIGION]->(r:Religion) RETURN r`;
                            try{
                                let resultReligions = await DB.query(queryReligions);
                                if(resultReligions.records.length > 0){
                                    resultReligions.records.forEach((item) => {
                                        let propRel = item.get('r').properties;
                                        let religion = new Religion(propRel.id, propRel.name);
                                        if(listReligions.length === 0){
                                            listReligions.push(religion.toObject());
                                        } else {
                                            let validateItem = listReligions.some(rl => rl.id === religion.getID());
                                            if(!validateItem){
                                                listReligions.push(religion.toObject());
                                            }
                                        }
                                    });
                                    jobReqData.setReligions(listReligions);
                                }
                                value.jobReq = jobReqData.toObject();
                            } catch(e){
                                throw e;
                            }
                        }
                        jobData[i] = value;
                    }catch(e){
                        throw e;
                    }
                }
                let finalJobData = [];
                jobData.forEach((item) => {
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
            } else {
                return null;
            }
        }catch(e){
            throw e;
        }
    }

    // Create new job
    static async create(jobData){
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
        
        // Delete properties from jobData
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
        try{
            let resultCreateJob = await DB.query(query);
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
                        let validateItem = listReligions.some(rl => rl.id === religion.getReligionID());
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
            return resultObj;
        }catch(e){
            throw e;
        }
    }

    static async find(jobID){
        let query = `MATCH (j:Job {jobID: '${jobID}'})-[:REQUIRES]->(jr:JobReq), (j)<-[:POSTS]-(u:User), (j)-[:CLASSIFIED]->(jt:JobType), (jr)-[:REQUIRES_SKILL]->(s:Skill) RETURN j,jr,u,jt,s`;
        try{
            let result = await DB.query(query);
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
                result.records.forEach((item) => {
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
                try{
                    let resultReligions = await DB.query(queryReligions);
                    let listReligions = [];
                    if(resultReligions.records.length > 0){
                        resultReligions.records.forEach((item) => {
                            let value = item.get('r').properties;
                            let religion = new Religion(value.id, value.name);
                            if(listReligions.length == 0){
                                listReligions.push(religion.toObject());
                            } else {
                                let validateItem = listReligions.some(rl => rl.id === religion.getID());
                                if(!validateItem){
                                    listReligions.push(religion.toObject());
                                }
                            }
                        });
                    }
                    jobReq.setSkills(listSkills);
                    jobReq.setReligions(listReligions);
                    
                    let resultObj = {
                        job: job,
                        jobType: jobType,
                        jobReq: jobReq
                    };
                    return resultObj;
                } catch(e){
                    throw e;
                }
            } else {
                return null;
            }
        }catch(e){
            throw e;
        }
    }

    async update(updatedJobData, jobReq, jobType){
        // Update data job and jobRequirement (properties only)
        // Cleaning string data
        let finalUpdatedJobData = {};
        let contact = updatedJobData.contact;
        contact = contact.replace(/\\n/g, function(x) {
            return '\\\\n';
        });
        contact = contact.replace(/\\r/g, function(x) {
            return '\\\\r';
        });

        // First section of query (update node Job)
        let query = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq), (j)-[re:CLASSIFIED]->(ojt:JobType)  
                    SET j.title = '${updatedJobData.title}',
                    j.quantity = ${updatedJobData.quantity},
                    j.contact = '${contact}',
                    j.status = ${updatedJobData.status},
                    j.endDate = '${updatedJobData.endDate}',`;
        
        // Delete properties from current jobData
        delete updatedJobData['jobId'];
        delete updatedJobData['title'];
        delete updatedJobData['quantity'];
        delete updatedJobData['contact'];
        delete updatedJobData['status'];
        delete updatedJobData['endDate'];

        // Rest of properties
        let jobProperty = Object.keys(updatedJobData);
        for(let i=0; i < jobProperty.length; i++){
            let currProp = jobProperty[i];
            if(currProp !== 'requirements' && currProp !== 'jobType'){
                let propValue = updatedJobData[currProp];
                if(currProp !== 'remote' && currProp !== 'minSalary' && currProp !== 'maxSalary'){
                    if(propValue !== null){
                        propValue = propValue.replace(/\\n/g, function(x) {
                            return '\\\\n';
                        });
                        propValue = propValue.replace(/\\r/g, function(x) {
                            return '\\\\r';
                        });
                        query += ` j.` + currProp + ` = '${propValue}',`;
                    } else {
                        query += ` j.` + currProp + ` = null,`;
                    }
                } else {
                    if(propValue !== null){
                        query += ` j.` + currProp + ` = ${propValue},`;
                    } else {
                        query += ` j.` + currProp + ` = null,`;
                    }
                }
            }
        }

        // Remove comma at the end of char from current query
        query = query.substr(0, query.length-1);

        // Second section of query (update relationship JobType if changed)
        let isUpdateJobType = false;
        if(updatedJobData.jobType !== jobType.getID()){
            query += `
                      WITH j, jr, re
                      DELETE re
                      MATCH (jt:JobType {id: '${updatedJobData.jobType}'})
                      MERGE (j)-[:CLASSIFIED]->(jt)`;
            isUpdateJobType = true;
        }

        // Third section of query (update node JobReq)
        if(isUpdateJobType){
            query += `
                      WITH j, jr, jt 
                      SET `;
        } else {
            query += `
                      WITH j, jr, ojt
                      SET `
        }
        if(updatedJobData.hasOwnProperty('requirements')){
            // Get properties of requirements object inside updatedJobData
            let requirementsProp = Object.keys(updatedJobData.requirements);
            requirementsProp.forEach((item) => {
                if(item !== 'requiredSkills' && item !== 'requiredReligion'){
                    let propValue = updatedJobData.requirements[item];
                    if(Array.isArray(propValue)){
                        if(propValue !== null){
                            query += ` jr.` + item + ` = [${updatedJobData.requirements[item].join()}],`;
                        } else {
                            query += ` jr.` + item + ` = null,`;
                        }
                    } else {
                        if(item !== 'maximumAge'){
                            if(propValue !== null){
                                propValue = propValue.replace(/\\n/g, function(x) {
                                    return '\\\\n';
                                });
                                propValue = propValue.replace(/\\r/g, function(x) {
                                    return '\\\\r';
                                });
                                query += ` jr.` + item + ` = '${propValue}',`;
                            } else {
                                query += ` jr.` + item + ` = null,`;
                            }
                        } else {
                            if(propValue !== null){
                                query += ` jr.` + item + ` = ${propValue},`;
                            } else {
                                query += ` jr.` + item + ` = null,`;
                            }
                        }
                    }
                }
            });

            // Remove comma at the end of char from current query
            query = query.substr(0, query.length-1);
            if(isUpdateJobType){
                query += `
                          RETURN j, jr, jt`;
            } else {
                query += `
                          RETURN j, jr, ojt`;
            }
            try{
                let resultUpdateJobdata = await DB.query(query);
                if(resultUpdateJobdata.records.length > 0){
                    let propJob = resultUpdateJobdata.records[0].get('j').properties;
                    let propJobReq = resultUpdateJobdata.records[0].get('jr').properties;
                    let propJobType = null;

                    if(isUpdateJobType){
                        propJobType = resultUpdateJobdata.records[0].get('jt').properties;
                    } else {
                        propJobType = resultUpdateJobdata.records[0].get('ojt').properties;
                    }

                    let updatedJob = new Job(this.#jobID, this.#userID, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status);
                    let updatedJobReq = new JobRequirement(propJobReq.classYearRequirement, propJobReq.studyProgramRequirement, propJobReq.documentRequirement, [], propJobReq.softSkillRequirment, propJobReq.maximumAge, [], propJobReq.requiredGender, propJobReq.description);
                    let updatedJobType = new JobType(propJobType.id, propJobType.name);

                    finalUpdatedJobData.job = updatedJob.toObject();
                    finalUpdatedJobData.jobReq = updatedJobReq.toObject();
                    finalUpdatedJobData.jobType = updatedJobType.toObject();

                    // Update requires skill
                    if(requirementsProp.includes('requiredSkills')){
                        let scndQuery = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq) `;
                        // Check current requires skill from database
                        // Get every value in currListSkill that is not in newListSkills
                        let newReqSkills = updatedJobData.requirements.requiredSkills;
                        let currReqSkills = jobReq.getSkills();
                        let diffSkill = currReqSkills.filter(el => {
                            return !newReqSkills.some(sk => sk === el.id);
                        });
                        // Delete relationship with that skills from database
                        if(diffSkill.length > 0){
                            if(diffSkill.length == 1){
                                scndQuery += `
                                             WITH jr
                                             MATCH (jr)-[re:REQUIRES_SKILL]->(:Skill {id: '${diffSkill[0].id}'})
                                             DELETE re`;
                            } else {
                                scndQuery += `
                                             WITH jr
                                             UNWIND [`;
                                for(let i=0; i < diffSkill.length; i++){
                                    let diffValue = diffSkill[i].id;
                                    scndQuery += `"${diffValue}",`;
                                }
                                // Remove comma at the end of char from current query
                                scndQuery = scndQuery.substr(0, scndQuery.length-1);
                                scndQuery += `] AS sk
                                            MERGE (jr)-[re:REQUIRES_SKILL]->(:Skill {id: sk})
                                            DELETE re`;
                            }
                        }
                        
                        // Add newest skill
                        scndQuery += `
                                     WITH jr
                                     UNWIND [`;
                        for(let i=0; i < newReqSkills.length; i++){
                            let newSkill = newReqSkills[i];
                            scndQuery += `"${newSkill}",`;
                        }
                        // Remove comma at the end of char from current query
                        scndQuery = scndQuery.substr(0, scndQuery.length-1);
                        scndQuery += `] as sk
                                     MERGE (s:Skill {id: sk})
                                     MERGE (jr)-[:REQUIRES_SKILL]->(s)
                                     RETURN s`;
                        try{
                            let resultUpdateSkill = await DB.query(scndQuery);
                            if(resultUpdateSkill.records.length > 0){
                                let listSkill = [];
                                resultUpdateSkill.records.forEach((item) => {
                                    let propSkill = item.get('s').properties;
                                    let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                                    if(listSkill.length == 0){
                                        listSkill.push(skill.toObject());
                                    } else {
                                        let validateItem = listSkill.some(sk => sk.id === skill.getID());
                                        if(!validateItem){
                                            listSkill.push(skill.toObject());
                                        }
                                    }
                                });
                                finalUpdatedJobData.requiredSkills = listSkill;
                                // Update religion (if exist)
                                if(requirementsProp.includes('requiredReligion')){
                                    if(updatedJobData.requirements.requiredReligion !== null){
                                        // Add or update current required religion
                                        let currReqReligion = jobReq.getReligion();
                                        let newReqReligion = updatedJobData.requirements.requiredReligion;
                                        let thirdQuery = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq) `;
                                        if(currReqReligion.length == 0){
                                            thirdQuery += ` 
                                                           WITH jr
                                                           UNWIND [`;
                                            for(let i=0; i < newReqReligion.length; i++){
                                                let propValue = newReqReligion[i];
                                                thirdQuery += `"${propValue}",`;
                                            }
                                            // Remove comma at the end of char from current query
                                            thirdQuery = thirdQuery.substr(0, thirdQuery.length-1);
                                            thirdQuery += `] AS rl
                                                           MERGE (r:Religion {id: rl})
                                                           MERGE (jr)-[:REQUIRES_RELIGION]->(r)
                                                           RETURN r`;
                                            try{
                                                let resultUpdateReligion = await DB.query(thirdQuery);
                                                if(resultUpdateReligion.records.length > 0){
                                                    let listReligions = [];
                                                    resultUpdateReligion.records.forEach((item) => {
                                                        let propRel = item.get('r').properties;
                                                        let religion = new Religion(propRel.id, propRel.name);
                                                        listReligions.push(religion.toObject());
                                                    });
                                                    finalUpdatedJobData.requiredReligion = listReligions;
                                                }
                                            }catch(e){
                                                throw e;
                                            }
                                        } else {
                                            // Check if current required religion are same
                                            let diffReligion = currReqReligion.filter(el => {
                                                return !newReqReligion.some(rl => rl === el.id);
                                            });
                                            if(diffReligion.length > 0){
                                                if(diffReligion.length == 1){
                                                    thirdQuery += `
                                                                   WITH jr
                                                                   MATCH (jr)-[re:REQUIRES_RELIGION]->(:Religion {id: '${diffReligion[0].id}'})
                                                                   DELETE re`;
                                                } else {
                                                    thirdQuery += `
                                                                   WITH jr 
                                                                   UNWIND [`;
                                                    for(let i=0; i < diffReligion.length; i++){
                                                        let diffValue = diffReligion[i].id;
                                                        thirdQuery += `"${diffValue}",`;
                                                    }
                                                    // Remove comma at the end of char from current query
                                                    thirdQuery = thirdQuery.substr(0, thirdQuery.length-1);
                                                    thirdQuery += `] AS rl
                                                                   MERGE (jr)-[re:REQUIRES_RELIGION]->(:Religion {id: rl})
                                                                   DELETE re`;
                                                }
                                            }

                                            // Add newest religion
                                            thirdQuery += `
                                                            WITH jr
                                                            UNWIND [`;
                                            for(let i=0; i < newReqReligion.length; i++){
                                                let newRel = newReqReligion[i];
                                                thirdQuery += `"${newRel}",`;
                                            }
                                            thirdQuery = thirdQuery.substr(0, thirdQuery.length-1);
                                            thirdQuery += `] AS rl
                                                            MERGE (r:Religion {id: rl})
                                                            MERGE (jr)-[:REQUIRES_RELIGION]->(r)
                                                            RETURN r`;
                                            try{
                                                let resultUpdateReligion = await DB.query(thirdQuery);
                                                if(resultUpdateReligion.records.length > 0){
                                                    let listReligions = [];
                                                    resultUpdateReligion.records.forEach((item) => {
                                                        let propRel = item.get('r').properties;
                                                        let religion = new Religion(propRel.id, propRel.name);
                                                        if(listReligions.length == 0){
                                                            listReligions.push(religion.toObject());
                                                        } else {
                                                            let validateItem = listReligions.some(rl => rl === religion.getID());
                                                            if(!validateItem){
                                                                listReligions.push(religion.toObject());
                                                            }
                                                        }
                                                    });
                                                    finalUpdatedJobData.requiredReligion = listReligions;
                                                }
                                            }catch(e){
                                                throw e;
                                            }
                                        }
                                    } else {
                                        let currReqReligion = jobReq.getReligion();
                                        if(currReqReligion.length > 0){
                                            // Remove every relationship with node religion
                                            let forthQuery = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[re:REQUIRES_RELIGION]->(r:Religion) DELETE re RETURN COUNT(re)`;
                                            try{
                                                let resultDeleteRel = await DB.query(forthQuery);
                                                if(resultDeleteRel.records.length > 0){
                                                    finalUpdatedJobData.requiredReligion = [];
                                                }
                                            }catch(e){
                                                throw e;
                                            }
                                        }
                                    }
                                }
                            }
                        }catch(e){
                            throw e;
                        }
                    }
                }
            }catch(e){
                throw e;   
            }
        }
        return finalUpdatedJobData;
    }

    async delete(){
        let query = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq) DETACH DELETE j,jr RETURN COUNT(j)`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                return 'Success';
            } else {
                return 'Failed';
            }
        }catch(e){
            throw e;
        }
    }

    static async searchByName(title){
        let date = new Date();
        let currentDate = `${date.getFullYear()}-0${date.getMonth()+1}-${date.getDate()}`;
        let query = `WITH split('${currentDate}', '-') AS cd 
                    MATCH (j:Job)<-[:POSTS]-(u:User), (j)-[:CLASSIFIED]->(jt:JobType)
                    WITH cd, split(j.endDate, '-') AS ed, j, u, jt
                    WHERE (cd[0] < ed[0]) OR (cd[0] = ed[0] AND ((cd[1] < ed[1]) OR (cd[1] = ed[1] AND (cd[2] < ed[2])))) AND j.title CONTAINS '${title}'
                    RETURN j, u, jt ORDER BY j.jobID`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let jobData = [];
                // Extract every job
                result.records.forEach((item) => {
                    let propJob = item.get('j').properties;
                    let propUser = item.get('u').properties;
                    let propJobType = item.get('jt').properties;

                    let job = new Job(propJob.jobID, propUser.nim, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status);
                    let jobType = new JobType(propJobType.id, propJobType.name);

                    let objJob = {};
                    objJob['job'] = job.toObject();
                    objJob['jobReq'] = {};
                    objJob['jobType'] = jobType.toObject();
                    jobData.push(objJob);
                });

                // Get job requirement
                for(let i=0; i < jobData.length; i++){
                    let value = jobData[i];

                    let queryJobReq = `MATCH (j:Job {jobID: '${value.job.jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_SKILL]->(s:Skill) RETURN jr, s`;
                    try {
                        let resultJobReq = await DB.query(queryJobReq);
                        let listSkills = [];
                        let listReligions = [];
                        let jobReqData = {};

                        if(resultJobReq.records.length > 0){
                            resultJobReq.records.forEach((item, index) => {
                                if(index === 0){
                                    let propJobReq = item.get('jr').properties;
                                    let jobReq = new JobRequirement(propJobReq.classYearRequirement, propJobReq.studyProgramRequirement, propJobReq.documentRequirement, [], propJobReq.softSkillRequirment, propJobReq.maximumAge, [], propJobReq.requiredGender, propJobReq.description);
                                    jobReqData = jobReq;
                                }

                                let propSkill = item.get('s').properties;
                                let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                                if(listSkills.length === 0){
                                    listSkills.push(skill.toObject());
                                } else {
                                    let validateItem = listSkills.some(sk => sk.id === skill.getID());
                                    if(!validateItem){
                                        listSkills.push(skill.toObject());
                                    }
                                }
                            });
                            jobReqData.setSkills(listSkills);

                            // Get required religion (if exist)
                            let queryReligion = `MATCH (j:Job {jobID: '${value.job.jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_RELIGION]->(r:Religion) RETURN r`;
                            try {
                                let resultRel = await DB.query(queryReligion);
                                if(resultRel.records.length > 0){
                                    resultRel.records.forEach((item) => {
                                        let propRel = item.get('r').properties;
                                        let religion = new Religion(propRel.id, propRel.name);
                                        if(listReligions.length === 0){
                                            listReligions.push(religion.toObject());
                                        } else {
                                            let validateItem = listReligions.some(rl => rl.id === religion.getID());
                                            if(!validateItem){
                                                listReligions.push(religion.toObject());
                                            }
                                        }
                                    });
                                    jobReqData.setReligions(listReligions);
                                }
                                value.jobReq = jobReqData.toObject();
                            } catch (e) {
                                throw e;
                            }
                        }
                        jobData[i] = value;
                    } catch (e) {
                        throw e;
                    }
                }
                let finalJobData = [];
                jobData.forEach((item) => {
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
            } else {
                return null;
            }
        }catch(e){
            throw e;
        }
    }

    async apply(user){
        let userID = user.getNim();
        let jobID = this.#jobID;
        let query = `MATCH (u:User {nim: '${userID}'})-[:APPLY]->(j:Job {jobID: '${jobID}'}) RETURN u,j`;
        try{
            let validateUserAndJob = await DB.query(query);
            if(validateUserAndJob.records.length != 0){
                return 5;   // User already apply to selected job
            } else {
                // Calculate similarity applicant with selected job
                let similarity = await JobStudentMatcher.match(this, user);
                let currentDate = new Date();
                let dateApplied = currentDate.getFullYear() + "-0" + 
                                (currentDate.getMonth()+1) + "-" +
                                currentDate.getDate();    
                
                let secQuery = `MATCH (u:User), (j:Job) WHERE u.nim = '${userID}' AND j.jobID = '${jobID}' CREATE (u)-[rel:APPLY {userID: '${userID}', dateApplied: '${dateApplied}', similarity: ${similarity}, status: false}]->(j) RETURN rel`;
                try{
                    let result = await DB.query(secQuery);
                    if(result.records.length > 0){
                        return 1;
                    } else {
                        return 0;
                    }
                } catch(e){
                    throw e;
                }
            }
        }catch(e){
            throw e;
        }
    }

    async acceptApplicant(applicantId){
        let query = `MATCH (j:Job {jobID: '${this.#jobID}'})<-[re:APPLY]-(u:User) WHERE re.userID = '${applicantId}' SET re.status = true RETURN re, u`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let value = result.records[0].get('re').properties;
                if(value.status){
                    // Do email things
                    return 'Success';
                } else {
                    return 'Failed';
                }
            }
        } catch(e){
            throw e;
        }
    }

    async refuseApplicant(applicantId){
        let query = `MATCH (j:Job {jobID: '${this.#jobID}'})<-[re:APPLY]-(u:User) WHERE re.userID = '${applicantId}' AND re.status = false RETURN re, u`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let value = result.records[0].get('re').properties;
                if(!value.status){
                    // Do email things
                    return 'Success';
                } else {
                    return 'Failed';
                }
            }
        } catch(e){
            throw e;
        }
    }
}

module.exports = Job;