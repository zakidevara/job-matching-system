const DB = require("../services/DB");
const Model = require("./Model");

class Religion extends Model{
    // Property of religion (private)
    #name;

    constructor(name){
        super();
        this.#name = name;
    }

    constructFromObject(obj){
        let {
            name
        } = obj;
        return new this.constructor(name);
    }

    getName(){
        return this.#name;
    }
    toObject(){
        let resultObj = {
            name: this.#name
        };
        return resultObj;
    }


    async findById(name){
        let query = `MATCH (r:Religion {name: '${name}'}) RETURN r`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propRel = result.records[0].get('r').properties;
                let religion = new Religion(propRel.name);
                return religion;
            } else {
                return null;
            }
        } catch(e){
            throw e;
        }
    }


    // Admin section
    async save(){
        let query = `MERGE (r:Religion {name: '${this.#name}'})
                     RETURN r`;
        try{
            let result = await DB.query(query);
            return result.records.length > 0 ? true : false;
        } catch(e){
            throw e;
        }
    }

    async update(updateRelData){
        let query = `MATCH (r:Religion {name: '${this.#name}'})
                     SET r.name = '${updateRelData.name}'
                     RETURN r`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propRel = result.records[0].get('r').properties;
                let religion = new Religion(propRel.name);
                return religion;
            } else {
                return null;
            }
        } catch(e){
            throw e;
        }
    }

    async delete(){
        let query = `MATCH (r:Religion {name: '${this.#name}'}) DETACH DELETE r RETURN COUNT(r)`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                return 'Success';
            } else {
                throw new Error('Gagal menghapus agama');
            }
        } catch(e){
            throw e;
        }

    }
}

module.exports = Religion;