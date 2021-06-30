const DB = require("../services/DB");
const Model = require("./Model");
const {v4: uuidv4 } = require('uuid');

class JobType extends Model {
    #id;
    #name;

    constructor(id, name){
        super();
        this.#id = id;
        this.#name = name;
    }

    setName(newName){
        this.name = newName;
    }
    getName(){
        return this.#name;
    }
    getID(){
        return this.#id;
    }

    toObject(){
        let objResult = {
            jobTypeId: this.#id,
            name: this.#name
        };
        return objResult;
    }

    // Database related
    static async create(name){
        let jobTypeID = uuidv4();
        let query = `MERGE (jt:JobType {id: '${jobTypeID}'}) SET jt.name = '${name}' RETURN jt`;
        try{
            let result = await DB.query(query);

            if(result.records.length > 0){
                let propJobType = result.records[0].get('jt').properties;
                let jobType = new JobType(propJobType.id, propJobType.name);
                return jobType.toObject();
            } else {
                return null;
            }
        } catch(e){
            throw e;
        }

    }

    static async getAllJobType(){
        let query = `MATCH (jt:JobType) RETURN jt`;
        try{
            let result = await DB.query(query);
            let listJobType = [];
            
            if(result.records.length > 0){
                result.records.forEach((item) => {
                    let propJobType = item.get('jt').properties;
                    let jobType = new JobType(propJobType.id, propJobType.name);
                    if(listJobType.length == 0){
                        listJobType.push(jobType.toObject());
                    } else {
                        let validateItem = listJobType.some(jt => jt.id === jobType.getID());
                        if(!validateItem){
                            listJobType.push(jobType.toObject());
                        }
                    }
                });
            }
            return listJobType;
        } catch(e){
            throw e;
        }
    }

    static async find(jobTypeID){
        let query = `MATCH (jt:JobType {id: '${jobTypeID}'}) RETURN jt`;
        try{
            let result = await DB.query(query);

            if(result.records.length > 0){
                let propJobType = result.records[0].get('jt').properties;
                let jobType = new JobType(propJobType.id, propJobType.name);
                return jobType;
            } else {
                return null;
            }
        } catch(e){
            throw e;
        }
    }

    static async update(updatedJobType){
        let jobTypeID = updatedJobType.jobTypeID;
        let newName = updatedJobType.name;
        let query = `MATCH (jt:JobType {id: '${jobTypeID}'}) SET jt.name = '${newName}' RETURN jt`;
        try{
            let result = await DB.query(query);
            
            if(result.records.length > 0){
                let propJobType = result.records[0].get('jt').properties;
                let jobType = new JobType(propJobType.id, propJobType.name);
                return jobType;
            } else {
                return null;
            }
        } catch(e){
            throw e;
        }
    }

    static async delete(jobTypeID){
        let query = `MATCH (jt:JobType {id: '${jobTypeID}'}) DETACH DELETE jt RETURN COUNT(jt)`;
        try{
            let result = await DB.query(query);
            
            if(result.records.length > 0){
                return 'Success';
            } else {
                return 'Failed';
            }
        } catch(e){
            throw e;
        }
    }

}

module.exports = JobType;