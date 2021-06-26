const Model = require("./Model");

class JobType extends Model {
    #id;
    #name;

    constructor(id, name){
        super();
        this.#id = id;
        this.#name = name;
    }

    setName(newName){
        this.name = newName;
    }
    getName(){
        return this.#name;
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

}

module.exports = JobType;