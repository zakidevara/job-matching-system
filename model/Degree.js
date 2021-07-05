const Model = require("./Model");
const {v4: uuidv4 } = require('uuid');
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

    getID(){
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


// TEST FUNCTION
// Test Command: `node model/Degree.js`
async function test(){
    let degree = new Degree('', '');

    // TESTING CREATE NEW DATA FUNCTIONALITY
    // let createResult = await degree.create({id: uuidv4(), name: "S1"});
    // console.log(createResult);

    // TESTING GET ALL DATA FUNCTIONALITY
    let getAllResult = await degree.all();
    console.log(getAllResult.map((item) => item.toObject()));
}
test();

module.exports = Degree;