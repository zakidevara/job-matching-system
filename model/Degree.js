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

    getID(){
        return this.#id;
    }
    getName(){
        return this.#name;
    }

    toObject(){
        let objResult = {
            degreeId: this.#id,
            name: this.#name
        };
        return objResult;
    }
    constructFromObject(obj){
        let {id, name} = obj;
        return new this.constructor(id, name);
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