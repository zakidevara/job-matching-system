const Model = require("./Model");

class WorkExperienceType extends Model{
    #name;

    constructor(name){
        this.#name = name;
    }

    setName(newName){
        this.name = newName;
    }
    getName(){
        return this.#name;
    }
}

module.exports = WorkExperienceType;