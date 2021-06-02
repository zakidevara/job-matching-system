const Model = require("./Model");

class JobType extends Model {
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

module.exports = JobType;