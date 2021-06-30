const DB = require("../services/DB");
const Model = require("./Model");

class Religion extends Model{
    // Property of religion (private)
    #id;
    #name;

    constructor(id, name){
        super();
        this.#id = id;
        this.#name = name;
    }

    getID(){
        return this.#id;
    }
    getName(){
        return this.#name;
    }
    toObject(){
        let resultObj = {
            id: this.#id,
            name: this.#name
        };
        return resultObj;
    }

    static async getAll(){
        
        let query = `MATCH (r:Religion) RETURN r`;
        let result = await DB.query(query);
        let fResult = [];
        result.records.forEach((item, iedex) => {
            let value = item.get('r').properties;
            let obj = new Religion(value.id, value.name);
            fResult.push(obj);
        });
        
        return fResult;
    }

    static async find(id){
        let query = `MATCH (r:Religion {id: '${id}'}) RETURN r`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propRel = result.records[0].get('r').properties;
                let religion = new Religion(propRel.id, propRel.name);
                return religion;
            } else {
                return null;
            }
        } catch(e){
            throw e;
        }
    }
}

module.exports = Religion;