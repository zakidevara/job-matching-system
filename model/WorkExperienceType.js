const Model = require("./Model");

const {v4: uuidv4 } = require('uuid');
const DB = require("../services/DB");


class WorkExperienceType extends Model{
    #id;
    #name;

    constructor(id, name){
        super('id');
        this.#id = id;
        this.#name = name;
    }
    
    setName(newName){
        this.#name = newName;
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

    
}

module.exports = WorkExperienceType;
