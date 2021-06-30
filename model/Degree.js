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

    getID(){
        return this.#id;
    }

    toObject(){
        let objResult = {
            degreeId: this.#id,
            name: this.#name
        };
        return objResult;
    }

    
}

module.exports = Degree;