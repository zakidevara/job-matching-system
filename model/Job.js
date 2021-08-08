const Model = require("./Model");
const Skill = require('./Skill');
const User = require('./User');
const DB = require("../services/DB");

const JobApplicant = require("./JobApplicant");
const JobRequirement = require("./JobRequirement");
const Religion = require("./Religion");
const JobType = require("./JobType");
const EmailService = require("../services/EmailService");

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
    #companyLogo;
    #endDate;
    #minSalary;
    #maxSalary;
    #status;
    #requirements;
    #type;

    constructor(jobID='', userID='', title='', quantity=0, location='', contact='', benefits='', description='', duration='', remote=false, companyName='', companyLogo='', endDate='', minSalary=0, maxSalary=0, status=true, jobReq = {}, jobType = 0){
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
        this.#companyLogo = companyLogo;
        this.#endDate = endDate;
        this.#minSalary = minSalary;
        this.#maxSalary = maxSalary;
        this.#status = status;
        this.#requirements= jobReq;
        this.#type = jobType;
    }

    // Getter
    getId(){
        return this.#jobID;
    }
    getUserID(){
        return this.#userID;
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
    setCompanyLogo(newLogo){
        this.#companyLogo = newLogo;
    }
    async getApplicant(){
        let query = `MATCH (j:Job)<-[:APPLIED_TO]-(ja:JobApplication), (u:User)-[:HAS_APPLIED]->(ja), (u)-[:HAS_RELIGION]->(r:Religion) WHERE j.id = '${this.#jobID}' RETURN ja{.*, user: u{.*, religion: r{.*}}}`;
        try{
            let resultApplicant = await DB.query(query);
            let listApplicant = [];
            resultApplicant.records.forEach((item) => {
                let propApl = item.get('ja');
                let religion = new Religion(propApl.user.religion.name);
                let user = new User(propApl.user.nim, propApl.user.name, propApl.user.email, propApl.user.password, propApl.user.birthDate, propApl.user.classYear, propApl.user.photo, propApl.user.phoneNumber, propApl.user.gender, propApl.user.studyProgram, propApl.user.status, religion);
                user.init();

                let applicant = new JobApplicant(user, propApl.dateApplied, propApl.status, propApl.applicantDocuments);
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
            id: this.#jobID,
            userId: this.#userID,
            title: this.#title,
            quantity: this.#quantity,
            location: this.#location,
            contact: this.#contact,
            benefits: this.#benefits,
            description: this.#description,
            jobType: JobType.toString(this.#type),
            duration: this.#duration,
            remote: this.#remote,
            companyName: this.#companyName,
            companyLogo: this.#companyLogo,
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

    saveCompanyLogo(companyLogo){
        let pathLogo = '';
        if(companyLogo !== null){
            pathLogo = './uploads/job/' + this.#jobID + '/logo/' + companyLogo.name;
            companyLogo.mv(pathLogo); 
            return pathLogo;
        }
        return null;
    }

    // Database related
    async save(){
        console.log(this.#jobID);
        // Formatted string
        let contact = this.cleaningStringFormat(this.#contact);
        // Object data
        let objRequirement = this.#requirements.toObject();
        let objJob = this.toObject();
        let jobType = this.#type;

        // Create node Job
        let query = `MERGE (j:Job {id: '${this.#jobID}'})
                     SET j.title = '${this.#title}',
                     j.contact = '${contact}',
                     j.quantity = ${this.#quantity},
                     j.endDate = '${this.#endDate}',
                     j.status = ${this.#status},`;
            
        delete objJob['id'];
        delete objJob['title'];
        delete objJob['contact'];
        delete objJob['quantity'];
        delete objJob['endDate'];
        delete objJob['status'];

        let restOfJobProperty = Object.keys(objJob);
        for(let i=0; i < restOfJobProperty.length; i++){
            let property = restOfJobProperty[i];
            if(objJob[property] !== null && objJob[property] !== undefined && property !== 'requirements'){
                let value = objJob[property];
                if(property === 'jobType'){
                    query += `j.` + property + ` = ${jobType},`;
                } else {
                    if(property !== 'remote' && property !== 'minSalary' && property !== 'maxSalary'){
                        value = this.cleaningStringFormat(value);
                        query += `j.` + property + ` = '${value}',`;
                    } else {
                        query += `j.` + property + ` = ${value},`;
                    }
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
                            query += `jr.` + property + ` = [`;
                            if(value.length > 0){
                                value.forEach((item) => {
                                    if(property === 'studyProgramRequirement'){
                                        query += item.studyProgramId + `,`;
                                    } else {
                                        query += item.genderId + `,`;
                                    }
                                });
                                query = query.substr(0, query.length-1);
                                query += `],`;
                            } else {
                                query += `],`;
                            }
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
                query += `"${item.name}",`;
            });
            // Remove comma at the end of char from current query
            query = query.substr(0, query.length-1);
            query += `] AS rl
                      MATCH (r:Religion {name: rl})
                      MERGE (jr)-[:REQUIRES_RELIGION]->(r) `;
            isAddReligion = true;
        }

        if(isAddReligion){
            query += `
                      WITH j, jr, s, r
                      MATCH (u:User {nim: '${this.#userID}'})
                      MERGE (u)-[:POSTS]->(j)
                      RETURN j, jr, s, r, u`;
        } else {
            query += `
                      WITH j, jr, s
                      MATCH (u:User {nim: '${this.#userID}'})
                      MERGE (u)-[:POSTS]->(j)
                      RETURN j, jr, s, u`;
        }
        console.log('Last Query: ', query);
        try{
            let resultSave = await DB.query(query);
            return resultSave.records.length > 0 ? true : false;
        } catch(e){
            throw e;
        }
    }
    // Get all job
    async all(userId){
        if(userId === undefined){
            try{
                let result = await this.searchByName('');
                return result;
            } catch(e){
                console.log(e);
                throw e;
            }
        } else {
            let date = new Date();
            let currentDate = `${date.getFullYear()}-0${date.getMonth()+1}-${date.getDate()}`;
            let query = `MATCH (j:Job)<-[:POSTS]-(u:User {nim: '${userId}'}), (j)-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_SKILL]->(s:Skill)
                         RETURN j{.*, userId: u.nim, requirements: jr{.*, requiredSkills: collect(s{.*})}}`;
            // let query = `WITH split('${currentDate}', '-') AS cd 
            //             MATCH (j:Job)<-[:POSTS]-(u:User), (j)-[:CLASSIFIED]->(jt:JobType), (j)-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_SKILL]->(s:Skill) 
            //             WHERE j.title CONTAINS '${title}'
            //             WITH cd, split(j.endDate, '-') AS ed, j, u, jt, jr, s
            //             WHERE (cd[0] < ed[0]) OR (cd[0] = ed[0] AND ((cd[1] < ed[1]) OR (cd[1] = ed[1] AND (cd[2] < ed[2])))) 
            //             RETURN j{.*, userId: u.nim, jobType: jt{.*}, requirements: jr{.*, requiredSkills: collect(s{.*})}}`;
            try{
                let result = await DB.query(query);
                let jobData = [];
                if(result.records.length > 0){
                    for(let i=0; i < result.records.length; i++){
                        let listSkills = [];
                        let listReligion = [];
                        let propJob =  result.records[i].get('j');
    
                        // let jobType = new JobType(propJob.jobType.id, propJob.jobType.name);
                        let jobType = propJob.jobType;
                        let jobReq = new JobRequirement(propJob.requirements.classYearRequirement, propJob.requirements.studyProgramRequirement, propJob.requirements.documentRequirement, [], propJob.requirements.softSkillRequirement, propJob.requirements.maximumAge, [], propJob.requirements.requiredGender, propJob.requirements.description);
                        await jobReq.init();
                        
                        propJob.requirements.requiredSkills.forEach((item) => {
                            let skill = new Skill(item.id, item.name, item.uri);
                            if(listSkills.length === 0){
                                listSkills.push(skill);
                            } else {
                                let validateItem = listSkills.some(sk => sk.getId() === skill.getId());
                                if(!validateItem) listSkills.push(skill);
                            }
                        });
                        jobReq.setSkills(listSkills);
    
                        let queryReligion = `MATCH (j:Job {id: '${propJob.id}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_RELIGION]->(r:Religion) RETURN r`;
                        try{
                            let resultReligion = await DB.query(queryReligion);
                            if(resultReligion.records.length > 0){
                                resultReligion.records.forEach((item) => {
                                    let propRel = item.get('r').properties;
                                    let religion = new Religion(propRel.name);
                                    if(listReligion.length === 0){
                                        listReligion.push(religion);
                                    } else {
                                        let validateItem = listReligion.some(rl => rl.getName() === religion.getName());
                                        if(!validateItem) listReligion.push(religion);
                                    }
                                });
                                jobReq.setReligions(listReligion);
                            }
                        } catch(e){
                            console.log(e);
                            throw e;
                        }
    
                        let job = new Job(propJob.id, propJob.userId, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.companyLogo, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status, jobReq, jobType);
                        jobData.push(job);
                    }
                }
                return jobData;
            } catch(e){
                console.log(e);
                throw e;
            }
        }
    }

    async findById(jobID){
        let query = `MATCH (j:Job {id: '${jobID}'})-[:REQUIRES]->(jr:JobReq), (j)<-[:POSTS]-(u:User), (jr)-[:REQUIRES_SKILL]->(s:Skill) RETURN j{.*, userID: u.nim, requirements: jr{.*, requiredSkills: s{.*}}}`;
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
                        // let jobType = new JobType(jobData.jobType.id, jobData.jobType.name);
                        let jobType = jobData.jobType;
                        let jobReq = new JobRequirement(jobData.requirements.classYearRequirement, jobData.requirements.studyProgramRequirement, jobData.requirements.documentRequirement, [], jobData.requirements.softSkillRequirment, jobData.requirements.maximumAge, [], jobData.requirements.requiredGender, jobData.requirements.description);
                        jobReqObject = jobReq;

                        let job = new Job(jobData.id, jobData.userID, jobData.title, jobData.quantity, jobData.location, jobData.contact, jobData.benefits, jobData.description, jobData.duration, jobData.remote, jobData.companyName, jobData.companyLogo, jobData.endDate, jobData.minSalary, jobData.maxSalary, jobData.status, {}, jobType);
                        jobObject = job;
                    }

                    let propSkill = jobData.requirements.requiredSkills;
                    let skill = new Skill(propSkill.id, propSkill.name, propSkill.uri);
                    if(listSkills.length === 0){
                        listSkills.push(skill);
                    } else {
                        let validateItem = listSkills.some(sk => sk.getId() === skill.getId());
                        if(!validateItem){
                            listSkills.push(skill);
                        }
                    }
                });

                let queryReligions = `MATCH (j:Job {id: '${jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_RELIGION]->(r:Religion) RETURN r`;
                try{
                    let resultReligion = await DB.query(queryReligions);
                    if(resultReligion.records.length > 0){
                        resultReligion.records.forEach((item) => {
                            let propRel = item.get('r').properties;
                            let religion = new Religion(propRel.name);
                            if(listReligion.length === 0){
                                listReligion.push(religion);
                            } else {
                                let validateItem = listReligion.some(rl => rl.getName() === religion.getName());
                                if(!validateItem){
                                    listReligion.push(religion);
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
        updatedJobData.jobType = parseInt(updatedJobData.jobType);
        

        // First section of query (update node Job)
        let query = `MATCH (j:Job {id: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq) 
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
            if(currProp !== 'requirements' && currProp !== 'companyLogo'){
                let propValue = updatedJobData[currProp];
                if(currProp !== 'remote' && currProp !== 'minSalary' && currProp !== 'maxSalary' && currProp !== 'jobType'){
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

        // Check if company logo is change
        let oldLogo = this.#companyLogo;
        let newLogo = '';
        if(updatedJobData.companyLogo !== null){
            let pathLogo = this.saveCompanyLogo(updatedJobData.companyLogo);
            if(pathLogo !== null){
                newLogo = pathLogo;
                query += `j.companyLogo = '${newLogo}',`;
            }
        } else {
            query += `j.companyLogo = '${oldLogo}',`;
        }

        // Remove comma at the end of char from current query
        query = query.substr(0, query.length-1);

        // // Second section of query (update relationship JobType if changed)
        // let isUpdateJobType = false;
        // if(updatedJobData.jobType !== currJobType.getId()){
        //     query += `
        //               WITH j, jr, re
        //               DELETE re
        //               MATCH (jt:JobType {id: '${updatedJobData.jobType}'})
        //               MERGE (j)-[:CLASSIFIED]->(jt)`;
        //     isUpdateJobType = true;
        // }

        // // Third section of query (update node JobReq)
        // if(isUpdateJobType){
        //     query += `
        //               WITH j, jr, jt 
        //               SET `;
        // } else {
        //     query += `
        //               WITH j, jr, ojt
        //               SET `
        // }
        query += `
                  WITH j, jr 
                  SET `;
        if(updatedJobData.hasOwnProperty('requirements')){
            // Get properties of requirements object inside updatedJobData
            let requirementsProp = Object.keys(updatedJobData.requirements);
            requirementsProp.forEach((item) => {
                if(item !== 'requiredSkills' && item !== 'requiredReligion'){
                    let propValue = updatedJobData.requirements[item];
                    if(Array.isArray(propValue)){
                        // if(item === 'classYearRequirement'){
                        //     query += ` jr.` + item + ` = [${propValue.join()}],`;
                        // } else {
                        //     query += `jr.` + item + ` = [`;
                        //     if(propValue.length > 0){
                        //         propValue.forEach((item) => {
                        //             query
                        //         });
                        //     } else {
                        //         query += `jr.` + item + `],`;
                        //     }
                        // }
                        query += ` jr.` + item + ` = [${propValue.join()}],`;
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
            query += `
                        RETURN j, jr`;
            // if(isUpdateJobType){
            //     query += `
            //               RETURN j, jr`;
            // } else {
            //     query += `
            //               RETURN j, jr`;
            // }
            try{
                let resultUpdateJobdata = await DB.query(query);
                if(resultUpdateJobdata.records.length > 0){
                    let propJob = resultUpdateJobdata.records[0].get('j').properties;
                    let propJobReq = resultUpdateJobdata.records[0].get('jr').properties;
                    let listSkills = [];
                    let listReligion = [];

                    // if(isUpdateJobType){
                    //     propJobType = resultUpdateJobdata.records[0].get('jt').properties;
                    // } else {
                    //     propJobType = resultUpdateJobdata.records[0].get('ojt').properties;
                    // }

                    // let updatedJobType = new JobType(propJobType.id, propJobType.name);
                    
                    let updatedJobReq = new JobRequirement(propJobReq.classYearRequirement, propJobReq.studyProgramRequirement, propJobReq.documentRequirement, [], propJobReq.softSkillRequirement, propJobReq.maximumAge, [], propJobReq.requiredGender, propJobReq.description);
                    await updatedJobReq.init();

                    // Update requires skill
                    if(requirementsProp.includes('requiredSkills')){
                        let scndQuery = `MATCH (j:Job {id: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq) `;
                        // Check current requires skill from database
                        // Get every value in currListSkill that is not in newListSkills
                        let newReqSkills = updatedJobData.requirements.requiredSkills;
                        let currReqSkills = this.#requirements.getSkills();
                        let diffSkill = currReqSkills.filter(el => {
                            return !newReqSkills.some(sk => sk === el.getId());
                        });
                        // Delete relationship with that skills from database
                        if(diffSkill.length > 0){
                            if(diffSkill.length == 1){
                                scndQuery += `
                                             WITH jr
                                             MATCH (jr)-[re:REQUIRES_SKILL]->(:Skill {id: '${diffSkill[0].getId()}'})
                                             DELETE re`;
                            } else {
                                scndQuery += `
                                             WITH jr
                                             UNWIND [`;
                                for(let i=0; i < diffSkill.length; i++){
                                    let diffValue = diffSkill[i].getId();
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
                                        tempListSkill.push(skill);
                                    } else {
                                        let validateItem = tempListSkill.some(sk => sk.getId() === skill.getId());
                                        if(!validateItem){
                                            tempListSkill.push(skill);
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
                                        let thirdQuery = `MATCH (j:Job {id: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq) `;
                                        if(currReqReligion.length === 0){
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
                                                           MERGE (r:Religion {name: rl})
                                                           MERGE (jr)-[:REQUIRES_RELIGION]->(r)
                                                           RETURN r`;
                                            try{
                                                let resultUpdateReligion = await DB.query(thirdQuery);
                                                if(resultUpdateReligion.records.length > 0){
                                                    let templistReligion = [];
                                                    resultUpdateReligion.records.forEach((item) => {
                                                        let propRel = item.get('r').properties;
                                                        let religion = new Religion(propRel.name);
                                                        if(templistReligion.length === 0){
                                                            templistReligion.push(religion);
                                                        } else {
                                                            let validateItem = templistReligion.some(rl => rl.getName() === religion.getName());
                                                            if(!validateItem){
                                                                templistReligion.push(religion);
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
                                                return !newReqReligion.some(rl => rl === el.getName());
                                            });
                                            if(diffReligion.length > 0){
                                                if(diffReligion.length == 1){
                                                    thirdQuery += `
                                                                   WITH jr
                                                                   MATCH (jr)-[re:REQUIRES_RELIGION]->(:Religion {name: '${diffReligion[0].getName()}'})
                                                                   DELETE re`;
                                                } else {
                                                    thirdQuery += `
                                                                   WITH jr 
                                                                   UNWIND [`;
                                                    for(let i=0; i < diffReligion.length; i++){
                                                        let diffValue = diffReligion[i].getName();
                                                        thirdQuery += `"${diffValue}",`;
                                                    }
                                                    // Remove comma at the end of char from current query
                                                    thirdQuery = thirdQuery.substr(0, thirdQuery.length-1);
                                                    thirdQuery += `] AS rl
                                                                   MERGE (jr)-[re:REQUIRES_RELIGION]->(:Religion {name: rl})
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
                                                            MERGE (r:Religion {name: rl})
                                                            MERGE (jr)-[:REQUIRES_RELIGION]->(r)
                                                            RETURN r`;
                                            try{
                                                let resultUpdateReligion = await DB.query(thirdQuery);
                                                if(resultUpdateReligion.records.length > 0){
                                                    let templistReligion = [];
                                                    resultUpdateReligion.records.forEach((item) => {
                                                        let propRel = item.get('r').properties;
                                                        let religion = new Religion(propRel.name);
                                                        if(templistReligion.length === 0){
                                                            templistReligion.push(religion);
                                                        } else {
                                                            let validateItem = templistReligion.some(rl => rl.getName() === religion.getName());
                                                            if(!validateItem){
                                                                templistReligion.push(religion);
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
                                            let forthQuery = `MATCH (j:Job {id: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq), (jr)-[re:REQUIRES_RELIGION]->(r:Religion) DELETE re RETURN COUNT(re)`;
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
                                let updatedJob = new Job(this.#jobID, this.#userID, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.companyLogo, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status, updatedJobReq, propJob.jobType);
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
        let query = `MATCH (j:Job {id: '${this.#jobID}'})-[:REQUIRES]->(jr:JobReq) DETACH DELETE j,jr RETURN COUNT(j)`;
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

    async searchByName(title){
        let date = new Date();
        let currentDate = `${date.getFullYear()}-0${date.getMonth()+1}-${date.getDate()}`;
        let query = `MATCH (j:Job)<-[:POSTS]-(u:User), (j)-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_SKILL]->(s:Skill) 
                     WHERE j.title CONTAINS '${title}'
                     RETURN j{.*, userId: u.nim, requirements: jr{.*, requiredSkills: collect(s{.*})}}`;
        // let query = `WITH split('${currentDate}', '-') AS cd 
        //             MATCH (j:Job)<-[:POSTS]-(u:User), (j)-[:CLASSIFIED]->(jt:JobType), (j)-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_SKILL]->(s:Skill) 
        //             WHERE j.title CONTAINS '${title}'
        //             WITH cd, split(j.endDate, '-') AS ed, j, u, jt, jr, s
        //             WHERE (cd[0] < ed[0]) OR (cd[0] = ed[0] AND ((cd[1] < ed[1]) OR (cd[1] = ed[1] AND (cd[2] < ed[2])))) 
        //             RETURN j{.*, userId: u.nim, jobType: jt{.*}, requirements: jr{.*, requiredSkills: collect(s{.*})}}`;
        try{
            let result = await DB.query(query);
            let jobData = [];
            if(result.records.length > 0){
                for(let i=0; i < result.records.length; i++){
                    let listSkills = [];
                    let listReligion = [];
                    let propJob =  result.records[i].get('j');

                    // let jobType = new JobType(propJob.jobType.id, propJob.jobType.name);
                    let jobReq = new JobRequirement(propJob.requirements.classYearRequirement, propJob.requirements.studyProgramRequirement, propJob.requirements.documentRequirement, [], propJob.requirements.softSkillRequirement, propJob.requirements.maximumAge, [], propJob.requirements.requiredGender, propJob.requirements.description);
                    await jobReq.init();
                    
                    propJob.requirements.requiredSkills.forEach((item) => {
                        let skill = new Skill(item.id, item.name, item.uri);
                        if(listSkills.length === 0){
                            listSkills.push(skill);
                        } else {
                            let validateItem = listSkills.some(sk => sk.getId() === skill.getId());
                            if(!validateItem) listSkills.push(skill);
                        }
                    });
                    jobReq.setSkills(listSkills);

                    let queryReligion = `MATCH (j:Job {id: '${propJob.id}'})-[:REQUIRES]->(jr:JobReq), (jr)-[:REQUIRES_RELIGION]->(r:Religion) RETURN r`;
                    try{
                        let resultReligion = await DB.query(queryReligion);
                        if(resultReligion.records.length > 0){
                            resultReligion.records.forEach((item) => {
                                let propRel = item.get('r').properties;
                                let religion = new Religion(propRel.name);
                                if(listReligion.length === 0){
                                    listReligion.push(religion);
                                } else {
                                    let validateItem = listReligion.some(rl => rl.getName() === religion.getName());
                                    if(!validateItem) listReligion.push(religion);
                                }
                            });
                            jobReq.setReligions(listReligion);
                        }
                    } catch(e){
                        console.log(e);
                        throw e;
                    }

                    let job = new Job(propJob.id, propJob.userId, propJob.title, propJob.quantity, propJob.location, propJob.contact, propJob.benefits, propJob.description, propJob.duration, propJob.remote, propJob.companyName, propJob.companyLogo, propJob.endDate, propJob.minSalary, propJob.maxSalary, propJob.status, jobReq, propJob.jobType);
                    jobData.push(job);
                }
            }
            return jobData;
        } catch(e){
            console.log(e);
            throw e;
        }
    }

    async apply(user, applicantDocuments){
        // dont use it, being repaired
        let userId = user.getNim();
        let jobId = this.#jobID;
        let pathDocuments = '';
        if(applicantDocuments !== null){
            if(applicantDocuments.mimetype !== 'application/zip'){
                return 6;
            }
            pathDocuments = './uploads/job/' + jobID + '/documents/' + userID + '/' + applicantDocuments.name;
            applicantDocuments.mv(pathDocuments); 
        }

        let checkQuery = `MATCH (u:User {nim: '${userId}'})-[:HAS_APPLIED]->(ja:JobApplication)-[:APPLIED_TO]->(j:Job {id: '${jobId}'}) RETURN ja`;
        try{
            let validateApply = await DB.query(checkQuery);
            if(validateApply.records.length > 0) return 5;  // User already apply to selected job
            let currentDate = new Date();
            let dateApplied = '';
            if(currentDate.getMonth()+1 < 10){
                dateApplied = currentDate.getFullYear() + "-0" + (currentDate.getMonth()+1) + "-" + currentDate.getDate();
            } else {
                dateApplied = currentDate.getFullYear() + "-" + (currentDate.getMonth()+1) + "-" + currentDate.getDate();
            }

            let queryApply = `MATCH (u:User), (j:Job) WHERE u.nim = '${userId}' AND j.id = '${jobId}'
                              CREATE (ja:JobApplication {dateApplied: '${dateApplied}', applicantDocuments: '${pathDocuments}', status: 0})
                              CREATE (u)-[:HAS_APPLIED]->(ja)
                              CREATE (ja)-[:APPLIED_TO]->(j)
                              RETURN ja`;
            try{
                let resultApply = await DB.query(queryApply);
                if(resultApply.records.length > 0){
                    return 1;
                } else {
                    return 0;
                }
            } catch(e){
                console.log(e);
                throw e;
            }
        } catch(e){
            console.log(e);
            throw e;
        }

        // let query = `MATCH (u:User {nim: '${userID}'})-[:APPLY]->(j:Job {id: '${jobID}'}) RETURN u,j`;
        // try{
        //     let validateUserAndJob = await DB.query(query);
        //     if(validateUserAndJob.records.length > 0){
        //         return 5;   // User already apply to selected job
        //     } else {
        //         // Calculate similarity applicant with selected job
        //         // let similarity = await JobStudentMatcher.match(this, user);
        //         let currentDate = new Date();
        //         let dateApplied = currentDate.getFullYear() + "-0" + 
        //                         (currentDate.getMonth()+1) + "-" +
        //                         currentDate.getDate();    
                
        //         let secQuery = `MATCH (u:User), (j:Job) WHERE u.nim = '${userID}' AND j.id = '${jobID}' 
        //                         MERGE (u)-[rel:APPLY {userId: '${userID}', dateApplied: '${dateApplied}', applicantDocuments: '${pathDocuments}', status: 0}]->(j) 
        //                         RETURN rel`;
        //         try{
        //             let result = await DB.query(secQuery);
        //             if(result.records.length > 0){
        //                 return 1;
        //             } else {
        //                 return 0;
        //             }
        //         } catch(e){
        //             throw e;
        //         }
        //     }
        // }catch(e){
        //     throw e;
        // }
    }

    async acceptApplicant(applicantData){
        let query = `MATCH (j:Job)<-[:APPLIED_TO]-(ja:JobApplication), (u:User)-[:HAS_APPLIED]->(ja) 
                     WHERE j.id = '${this.#jobID}' AND u.nim = '${applicantData.applicantId}'
                     SET ja.status = 1
                     RETURN ja{.*, user: u{.*}};`;
        // let query = `MATCH (j:Job {id: '${this.#jobID}'})<-[re:APPLY]-(u:User) 
        //              WHERE re.userId = '${applicantData.applicantId}' SET re.status = true 
        //              RETURN re{.*, userData: u{.*}}`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propRel = result.records[0].get('ja');
                if(propRel.status === 1){
                    let emailMessage = '';
                    if(applicantData.message.length === 0){
                        emailMessage += '<p>Selamat anda diterima pada lowongan pekerjaan ' + this.#title + '.</p>';
                    } else {
                        emailMessage += '<p>' + applicantData.message + '</p>';
                    }
                    const subject = "Hasil Lamaran Lowongan Pekerjaan";
                    try{
                        let sendEmailStatus = await EmailService.sendEmail(propRel.user.email, subject, emailMessage);
                        if(sendEmailStatus){
                            return 'Success';
                        } else {
                            throw new Error('Ai kamu gagal');
                        }
                    } catch(e){
                        console.log(e);
                        throw e;
                    }
                } else {
                    throw new Error('Ai kamu gagal');
                }
            }
        } catch(e){
            console.log(e);
            throw e;
        }
    }

    async refuseApplicant(applicantData){
        let query = `MATCH (j:Job)<-[:APPLIED_TO]-(ja:JobApplication), (u:User)-[:HAS_APPLIED]->(ja) 
                     WHERE j.id = '${this.#jobID}' AND u.nim = '${applicantData.applicantId}'
                     SET ja.status = 2
                     RETURN ja{.*, user: u{.*}};`;
        // let query = `MATCH (j:Job {id: '${this.#jobID}'})<-[re:APPLY]-(u:User) 
        //              WHERE re.userId = '${applicantData.applicantId}' AND re.status = false 
        //              RETURN re{.*, userData: u{.*}}`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propRel = result.records[0].get('ja');
                if(propRel.status === 2){
                    let emailMessage = '';
                    if(applicantData.message.length === 0){
                        emailMessage += '<p>Sangat disayangkan anda tidak diterima di lowongan pekerjaan ' + this.#title + '. Coba lagi di lain kesempatan oke.</p>';
                    } else {
                        emailMessage += '<p>' + applicantData.message + '</p>';
                    }
                    const subject = "Hasil Lamaran Lowongan Pekerjaan";
                    try{
                        let sendEmailStatus = await EmailService.sendEmail(propRel.user.email, subject, emailMessage);
                        if(sendEmailStatus){
                            return 'Success';
                        } else {
                            throw new Error('Ai kamu gagal');
                        }
                    } catch(e){
                        console.log(e);
                        throw e;
                    }
                } else {
                    throw new Error('Ai kamu gagal');
                }
            }
        } catch(e){
            throw e;
        }
    }
}

module.exports = Job;