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
const StudyProgram = require("./StudyProgram");
const Gender = require("./Gender");

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
    #requirements;
    #type;

    constructor(jobID='', userID='', title='', quantity=0, location='', contact='', benefits='', description='', duration='', remote=false, companyName='', endDate='', minSalary=0, maxSalary=0, status=true, jobReq = {}, jobType = {}){
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
        this.#requirements= jobReq;
        this.#type = jobType;
    }

    // Getter
    getID(){
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
    getRequirements(){
        return this.#requirements;
    }
    setRequirements(newReq){
        this.#requirements = newReq;
    }
    setJobType(newType){
        this.#type = newType;
    }
    // async getRequiredSkills(){
    //     let query = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_SKILL]->(s:Skill) RETURN s`;
    //     try{
    //         let resultListSkill = await DB.query(query);
    //         let listSkill = [];
    //         resultListSkill.records.forEach((item) => {
    //             let propSkill = item.get('s').properties;
    //             let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
    //             if(listSkill.length == 0){
    //                 listSkill.push(skill);
    //             } else {
    //                 let validateItem = listSkill.some(sk => sk.getID() === skill.getID());
    //                 if(!validateItem){
    //                     listSkill.push(skill);
    //                 }
    //             }
    //         });
    //         return listSkill;
    //     }catch(e){
    //         throw e;
    //     }
    // }
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
            jobId: this.#jobID,
            userId: this.#userID,
            title: this.#title,
            quantity: this.#quantity,
            location: this.#location,
            contact: this.#contact,
            benefits: this.#benefits,
            description: this.#description,
            jobType: this.#type.toObject(),
            duration: this.#duration,
            remote: this.#remote,
            companyName: this.#companyName,
            endDate: this.#endDate,
            minSalary: this.#minSalary,
            maxSalary: this.#maxSalary,
            requirements: this.#requirements.toObject(),
            status: this.#status
        };
        return objResult;
    }

    cleaningStringFormat(stringInput){
        let result = stringInput;
        result = result.replace(/\\n/g, function(x) {
            return '\\\\n';
        });
        result = result.replace(/\\r/g, function(x) {
            return '\\\\r';
        });
        return result;
    }

    // Database related
    async save(){
        console.log(this.#jobID);
        // Formatted string
        let contact = this.cleaningStringFormat(this.#contact);
        // Object data
        let objRequirement = this.#requirements.toObject();
        let objJob = this.toObject();

        // Create node Job
        let query = `MERGE (j:Job {jobID: '${this.#jobID}'})
                     SET j.title = '${this.#title}',
                     j.contact = '${contact}',
                     j.quantity = ${this.#quantity},
                     j.endDate = '${this.#endDate}',
                     j.status = ${this.#status},`;
        
        let restOfJobProperty = ["description", "companyName", "remote", "location", "duration", "benefits", "minSalary", "maxSalary"];
        for(let i=0; i < restOfJobProperty.length; i++){
            let property = restOfJobProperty[i];
            if(objJob[property] !== null && property !== 'requirements' && property !== 'jobType'){
                let value = objJob[property];
                if(property !== 'remote' && property !== 'minSalary' && property !== 'maxSalary'){
                    value = this.cleaningStringFormat(value);
                    query += `j.` + property + ` = '${value}',`;
                } else {
                    query += `j.` + property + ` = ${value},`;
                }
            }
        }
        // Remove comma at the end of char from current query
        query = query.substr(0, query.length-1);
        
        query += `
                  WITH j
                  MERGE (j)-[:REQUIRES]->(jr:JobReq)
                  SET `;
        
        // Validate if value is (array, string or null)
        let jobReqProp = Object.keys(objRequirement);
        for(let i=0; i < jobReqProp.length; i++){
            let property = jobReqProp[i];
            if(objRequirement[property] !== null){
                let value = objRequirement[property];
                if(property !== 'requiredSkills' && property !== 'requiredReligion'){
                    if(Array.isArray(value)){
                        if(property === 'classYearRequirement'){
                            query += `jr.` + property + ` = [${value.join()}],`;
                        } else {
                            query += `jr. ` + property + ` = [`;
                            value.forEach((item) => {
                                if(property === 'studyProgramRequirement'){
                                    query += item.studyProgramId + `,`;
                                } else {
                                    query += item.genderId + `,`;
                                }
                            });
                            query = query.substr(0, query.length-1);
                            query += `],`;
                        }
                    } else {
                        if(property !== 'maximumAge'){
                            value = this.cleaningStringFormat(value);
                            query += `jr.` + property + ` = '${value}',`;
                        } else {
                            query += `jr.` + property + ` = ${value},`;
                        }
                    }
                }
            }
        }

        // Remove comma at the end of char from current query
        query = query.substr(0, query.length-1);

        // Merge Job dan JobReq
        // Add relationship with JobReq dan Skill and Religion (if any)
        let isAddReligion = false;
        if(objRequirement.requiredSkills.length > 0){
            let reqSkills = objRequirement.requiredSkills;
            query += `
                      WITH j, jr
                      UNWIND [`;
            reqSkills.forEach((item) => {
                query += `"${item.id}",`;
            });

            // Remove comma at the end of char from current query
            query = query.substr(0, query.length-1);
            query += `] AS sk
                      MATCH (s:Skill {id: sk})
                      MERGE (jr)-[:REQUIRES_SKILL]->(s) `;
        }
        if(objRequirement.requiredReligion.length > 0){
            let reqReligion = objRequirement.requiredReligion;
            query += `WITH j, jr, s
                      UNWIND [`;
            reqReligion.forEach((item) => {
                query += `"${item.id}",`;
            });
            // Remove comma at the end of char from current query
            query = query.substr(0, query.length-1);
            query += `] AS rl
                      MATCH (r:Religion {id: rl})
                      MERGE (jr)-[:REQUIRES_RELIGION]->(r) `;
            isAddReligion = true;
        }

        if(isAddReligion){
            query += `
                      WITH j, jr, s, r
                      MATCH (jt:JobType {id: '${this.#type.getID()}'}), (u:User {nim: '${this.#userID}'})
                      MERGE (j)-[:CLASSIFIED]->(jt)
                      MERGE (u)-[:POSTS]->(j)
                      RETURN j, jr, s, r, jt, u`;
        } else {
            query += `
                      WITH j, jr, s
                      MATCH (jt:JobType {id: '${this.#type.getID()}'}), (u:User {nim: '${this.#userID}'})
                      MERGE (j)-[:CLASSIFIED]->(jt)
                      MERGE (u)-[:POSTS]->(j)
                      RETURN j, jr, s, jt, u`;
        }
        try{
            let resultSave = await DB.query(query);
            return resultSave.records.length > 0 ? true : false;
        } catch(e){
            throw e;
        }
    }
    // Get all job
    static async getAllAvailableJob(){
        try{
            let result = await this.searchByName('');
            return result;
        } catch(e){
            console.log(e);
            throw e;
        }
    }

    static async find(jobID){
        let query = `MATCH (j:Job {jobID: '${jobID}'})-[:REQUIRES]->(jr:JobReq), (j)<-[:POSTS]-(u:User), (j)-[:CLASSIFIED]->(jt:JobType), (jr)-[:REQUIRES_SKILL]->(s:Skill) RETURN j{.*, userID: u.nim, jobType: jt{.*}, requirements: jr{.*, requiredSkills: s{.*}}}`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let jobObject = {};
                let jobReqObject = {};
                let listSkills = [];
                let listReligion = [];

                result.records.forEach((item, index) => {
                    let jobData = item.get('j');
                    if(index === 0){
                        let jobType = new JobType(jobData.jobType.id, jobData.jobType.id);
                        let jobReq = new JobRequirement(jobData.requirements.classYearRequirement, jobData.requirements.studyProgramRequirement, jobData.requirements.documentRequirement, [], jobData.requirements.softSkillRequirment, jobData.requirements.maximumAge, [], jobData.requirements.requiredGender, jobData.requirements.description);
                        jobReqObject = jobReq;

                        let job = new Job(jobData.jobID, jobData.userID, jobData.title, jobData.quantity, jobData.location, jobData.contact, jobData.benefits, jobData.description, jobData.duration, jobData.remote, jobData.companyName, jobData.endDate, jobData.minSalary, jobData.maxSalary, jobData.status, {}, jobType);
                        jobObject = job;
                    }

                    let propSkill = jobData.requirements.requiredSkills;
                    let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                    if(listSkills.length === 0){
                        listSkills.push(skill.toObject());
                    } else {
                        let validateItem = listSkills.some(sk => sk.skillId === skill.getID());
                        if(!validateItem){
                            listSkills.push(skill.toObject());
                        }
                    }
                });

                let queryReligions = `MATCH (j:Job {jobID: '${jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_RELIGION]->(r:Religion) RETURN r`;
                try{
                    let resultReligion = await DB.query(queryReligions);
                    if(resultReligion.records.length > 0){
                        resultReligion.records.forEach((item) => {
                            let propRel = item.get('r').properties;
                            let religion = new Religion(propRel.id, propRel.name);
                            if(listReligion.length === 0){
                                listReligion.push(religion.toObject());
                            } else {
                                let validateItem = listReligion.some(rl => rl.religionId === religion.getID());
                                if(!validateItem){
                                    listReligion.push(religion.toObject());
                                }
                            }
                        });
                    }
                } catch(e){
                    throw e;
                }
                await jobReqObject.init();
                jobReqObject.setSkills(listSkills);
                jobReqObject.setReligions(listReligion);
                jobObject.setRequirements(jobReqObject);
                return jobObject;
            } else {
                return null;
            }
        }catch(e){
            throw e;
        }
    }

    async update(updatedJobData){
        // First...
        // Update data job and jobRequirement (properties only)
        // Second...
        // Update data requiredSkills (if current not in new list deleted)
        // Last...
        // Update data requiredReligion (same with skills)  

        // Cleaning string data
        let finalUpdatedJobData = {};
        let contact = updatedJobData.contact;
        contact = this.cleaningStringFormat(contact);
        let currJobType = this.#type;
        

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
                        propValue = this.cleaningStringFormat(propValue);
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
        if(updatedJobData.jobType !== currJobType.getID()){
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
                                propValue = this.cleaningStringFormat(propValue);
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
                    let listSkills = [];
                    let listReligion = [];

                    if(isUpdateJobType){
                        propJobType = resultUpdateJobdata.records[0].get('jt').properties;
                    } else {
                        propJobType = resultUpdateJobdata.records[0].get('ojt').properties;
                    }

                    let updatedJobType = new JobType(propJobType.id, propJobType.name);
                    let updatedJobReq = new JobRequirement(propJobReq.classYearRequirement, propJobReq.studyProgramRequirement, propJobReq.documentRequirement, [], propJobReq.softSkillRequirement, propJobReq.maximumAge, [], propJobReq.requiredGender, propJobReq.description);
                    await updatedJobReq.init();

                    // Update requires skill
                    if(requirementsProp.includes('requiredSkills')){
                        let scndQuery = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq) `;
                        // Check current requires skill from database
                        // Get every value in currListSkill that is not in newListSkills
                        let newReqSkills = updatedJobData.requirements.requiredSkills;
                        let currReqSkills = this.#requirements.getSkills();
                        let diffSkill = currReqSkills.filter(el => {
                            return !newReqSkills.some(sk => sk === el.skillId);
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
                                let tempListSkill = [];
                                resultUpdateSkill.records.forEach((item) => {
                                    let propSkill = item.get('s').properties;
                                    let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                                    if(tempListSkill.length == 0){
                                        tempListSkill.push(skill.toObject());
                                    } else {
                                        let validateItem = tempListSkill.some(sk => sk.id === skill.getID());
                                        if(!validateItem){
                                            tempListSkill.push(skill.toObject());
                                        }
                                    }
                                });
                                listSkills = tempListSkill;
                                // Update religion (if exist)
                                if(requirementsProp.includes('requiredReligion')){
                                    if(updatedJobData.requirements.requiredReligion !== null){
                                        // Add or update current required religion
                                        let currReqReligion = this.#requirements.getReligion();
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
                                                    let templistReligion = [];
                                                    resultUpdateReligion.records.forEach((item) => {
                                                        let propRel = item.get('r').properties;
                                                        let religion = new Religion(propRel.id, propRel.name);
                                                        if(templistReligion.length === 0){
                                                            templistReligion.push(religion.toObject());
                                                        } else {
                                                            let validateItem = templistReligion.some(rl => rl.id === religion.getID());
                                                            if(!validateItem){
                                                                templistReligion.push(religion.toObject());
                                                            }
                                                        }
                                                    });
                                                    listReligion = templistReligion;
                                                }
                                            }catch(e){
                                                throw e;
                                            }
                                        } else {
                                            // Check if current required religion are same
                                            let diffReligion = currReqReligion.filter(el => {
                                                return !newReqReligion.some(rl => rl === el.religionId);
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
                                                    let templistReligion = [];
                                                    resultUpdateReligion.records.forEach((item) => {
                                                        let propRel = item.get('r').properties;
                                                        let religion = new Religion(propRel.id, propRel.name);
                                                        if(templistReligion.length == 0){
                                                            templistReligion.push(religion.toObject());
                                                        } else {
                                                            let validateItem = templistReligion.some(rl => rl.id === religion.getID());
                                                            if(!validateItem){
                                                                templistReligion.push(religion.toObject());
                                                            }
                                                        }
                                                    });
                                                    listReligion = templistReligion;
                                                }
                                            }catch(e){
                                                throw e;
                                            }
                                        }
                                    } else {
                                        let currReqReligion = this.#requirements.getReligion();
                                        if(currReqReligion.length > 0){
                                            // Remove every relationship with node religion
                                            let forthQuery = `MATCH (j:Job {jobID: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[re:REQUIRES_RELIGION]->(r:Religion) DELETE re RETURN COUNT(re)`;
                                            try{
                                                let resultDeleteRel = await DB.query(forthQuery);
                                                if(resultDeleteRel.records.length > 0){
                                                    listReligion = [];
                                                }
                                            }catch(e){
                                                throw e;
                                            }
                                        }
                                    }
                                }
                                updatedJobReq.setSkills(listSkills);
                                updatedJobReq.setReligions(listReligion);
                                let updatedJob = new Job(this.#jobID, this.#userID, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status, updatedJobReq, updatedJobType);
                                finalUpdatedJobData = updatedJob;
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
                throw new Error('Gagal menghapus job');
            }
        }catch(e){
            throw e;
        }
    }

    static async searchByName(title){
        let date = new Date();
        let currentDate = `${date.getFullYear()}-0${date.getMonth()+1}-${date.getDate()}`;
        let query = `WITH split('${currentDate}', '-') AS cd 
                    MATCH (j:Job)<-[:POSTS]-(u:User), (j)-[:CLASSIFIED]->(jt:JobType), (j)-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_SKILL]->(s:Skill) 
                    WHERE j.title CONTAINS '${title}'
                    WITH cd, split(j.endDate, '-') AS ed, j, u, jt, jr, s
                    WHERE (cd[0] < ed[0]) OR (cd[0] = ed[0] AND ((cd[1] < ed[1]) OR (cd[1] = ed[1] AND (cd[2] < ed[2])))) 
                    RETURN j{.*, userId: u.nim, jobType: jt{.*}, requirements: jr{.*, requiredSkills: collect(s{.*})}}`;
        try{
            let result = await DB.query(query);
            let jobData = [];
            if(result.records.length > 0){
                for(let i=0; i < result.records.length; i++){
                    let listSkills = [];
                    let listReligion = [];
                    let propJob =  result.records[i].get('j');

                    let jobType = new JobType(propJob.jobType.id, propJob.jobType.name);
                    let jobReq = new JobRequirement(propJob.requirements.classYearRequirement, propJob.requirements.studyProgramRequirement, propJob.requirements.documentRequirement, [], propJob.requirements.softSkillRequirement, propJob.requirements.maximumAge, [], propJob.requirements.requiredGender, propJob.requirements.description);
                    await jobReq.init();
                    
                    propJob.requirements.requiredSkills.forEach((item) => {
                        let skill = new Skill(item.id, item.name, item.uri);
                        if(listSkills.length === 0){
                            listSkills.push(skill);
                        } else {
                            let validateItem = listSkills.some(sk => sk.getID() === skill.getID());
                            if(!validateItem) listSkills.push(skill);
                        }
                    });
                    jobReq.setSkills(listSkills);

                    let queryReligion = `MATCH (j:Job {jobID: '${propJob.jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_RELIGION]->(r:Religion) RETURN r`;
                    try{
                        let resultReligion = await DB.query(queryReligion);
                        if(resultReligion.records.length > 0){
                            resultReligion.records.forEach((item) => {
                                let propRel = item.get('r').properties;
                                let religion = new Religion(propRel.id, propRel.name);
                                if(listReligion.length === 0){
                                    listReligion.push(religion);
                                } else {
                                    let validateItem = listReligion.some(rl => rl.getID() === religion.getID());
                                    if(!validateItem) listReligion.push(religion);
                                }
                            });
                            jobReq.setReligions(listReligion);
                        }
                    } catch(e){
                        console.log(e);
                        throw e;
                    }

                    let job = new Job(propJob.jobID, propJob.userId, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status, jobReq, jobType);
                    jobData.push(job);
                }
                return jobData;
            } else {
                return null;
            }
        } catch(e){
            console.log(e);
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