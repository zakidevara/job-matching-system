const Model = require("./Model");

class WorkExperienceType extends Model{
    #name;

    constructor(name){
        super('name');
        this.#name = name;
    }
    
    setName(newName){
        this.#name = newName;
    }
    getName(){
        return this.#name;
    }

    toObject(){
        let objResult = {
            name: this.#name
        };
        return objResult;
    }
    constructFromObject(obj){
        let {name} = obj;
        return new this.constructor(name);
    }

    
}

module.exports = WorkExperienceType;
