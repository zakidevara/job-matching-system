const Model = require("./Model");
const DB = require("../services/DB");

class Degree extends Model{
    // Property of degree
    #id;
    #name;

    constructor(id, name){
        super('id');
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

    getId(){
        return this.#id;
    }
    getName(){
        return this.#name;
    }

    toObject(){
        let objResult = {
            id: this.#id,
            name: this.#name
        };
        return objResult;
    }
    constructFromObject(obj){
        let {id, name} = obj;
        return new this.constructor(id, name);
    }

    async findById(degreeId){
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

    // Admin section
    async save(){
        let query = `MERGE (d:Degree {id: '${this.#id}'})
                     SET d.name = '${this.#name}'
                     RETURN d`;
        try{
            let result = await DB.query(query);
            return result.records.length > 0 ? true : false;
        } catch(e){
            throw e;
        }
    }

    async update(updatedDegData){
        let query = `MATCH (d:Degree {id: '${this.#id}'})
                     SET d.name = '${updatedDegData.name}'
                     RETURN d`;
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

    async delete(){
        let query = `MATCH (d:Degree {id: '${this.#id}'}) DETACH DELETE r RETURN COUNT(r)`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                return 'Success';
            } else {
                throw new Error('Gagal menghapus gelar');
            }
        } catch(e){
            throw e;
        }
    }

    
}


module.exports = Degree;