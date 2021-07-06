const DB = require("../services/DB");
const Model = require("./Model");

class JobType extends Model {
    // Property of job type (private)
    #id;
    #name;

    constructor(id, name){
        super("id");
        this.#id = id;
        this.#name = name;
    }

    constructFromObject(obj){
        let {
            id,
            name
        } = obj;
        return new this.constructor(id, name);
    }

    setName(newName){
        this.name = newName;
    }
    getName(){
        return this.#name;
    }
    getId(){
        return this.#id;
    }

    toObject(){
        let objResult = {
            id: this.#id,
            name: this.#name
        };
        return objResult;
    }

    // Database related
    async save(){
        let query = `MERGE (jt:JobType {id: '${this.#id}'})
                     SET jt.name = '${this.#name}'
                     RETURN jt`;
        try{
            let result = await DB.query(query);
            return result.records.length > 0 ? true : false;
        } catch(e){
            throw e;
        }
    }

    async findById(jobTypeID){
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

    async update(updatedJobType){
        let newName = updatedJobType.name;
        let query = `MATCH (jt:JobType {id: '${this.#id}'}) 
                     SET jt.name = '${newName}' 
                     RETURN jt`;
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

    async delete(){
        let query = `MATCH (jt:JobType {id: '${jobTypeID}'}) DETACH DELETE jt RETURN COUNT(jt)`;
        try{
            let result = await DB.query(query);
            
            if(result.records.length > 0){
                return 'Success';
            } else {
                throw new Error('Tidak ada data JobType yang dihapus');
            }
        } catch(e){
            throw e;
        }
    }

}

module.exports = JobType;