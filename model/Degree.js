const Model = require("./Model");
const {v4: uuidv4 } = require('uuid');
const DB = require("../services/DB");

class Degree extends Model{
    // Property of degree
    #id;
    #name;

    constructor(id, name){
        super();
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

    getID(){
        return this.#id;
    }

    toObject(){
        let objResult = {
            id: this.#id,
            name: this.#name
        };
        return objResult;
    }

    static async find(degreeId){
        let query = `MATCH (d:Degree {id: '${degreeId}'}) RETURN d`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                let propDeg = result.records[0].get('d').properties;
                let degree = new Degree(propDeg.id, propDeg.name);
                return degree;
            } else {
                return null;
            }
        } catch(e){
            throw e;
        }
    }

    
}

module.exports = Degree;