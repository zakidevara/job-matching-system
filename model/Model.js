const DB = require("../services/DB");

class Model {
    constructor(){
        if(this.constructor === Model){
            throw new Error('Abstract class "Model" cannot be instantiated directly');
        }
    }
}

module.exports = Model;
