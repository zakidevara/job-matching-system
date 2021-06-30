const DB = require("../../services/DB");

class ResourceController {
    // Property of controller (private)
    #model;

    constructor(model){
        this.#model = model;
        if(this.constructor == ResourceController){
            throw new TypeError(`Kelas abstrak "${this.constructor.name}" tidak bisa diinstansiasikan secara langsung`);
        }
        if (this.getAll === undefined) {
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if (this.getByID === undefined) {
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if (this.create === undefined) {
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if (this.update === undefined) {
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if (this.delete === undefined) {
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
        if (this.validate === undefined) {
            throw new TypeError(`Classes extending the "${this.constructor.name}" abstract class`);
        }
    }

    getModel(){
        return this.#model;
    }

    getModelAttributes(){
        let instance = new this.#model();
        return Object.keys(instance.toObject());
    }

    // Validate target of class
    validate(){
        return true;
    }

    // Return all data based on label
    async getAll(){
        try {
            let modelInstance = new this.#model();
            let result = await modelInstance.all();
            return result.map((val) => val.toObject());
        } catch (error) {
            throw error;
        }
    }

    // Get data by id
    async getByID(idData){
        let modelInstance = new this.#model();
        try {
            let result = await modelInstance.findById(idData);
            return result.toObject();
        } catch (error) {
            throw error;
        }
    }

    // Create new data to database based on Model
    async create(Model){
        if(Model !== ModelClass){
            throw new TypeError("Type nya salah bruh");
        }
    }

    // Update selection data to database based on Model
    async update(Model){
        if(Model !== ModelClass){
            throw new TypeError("Type nya salah bruh");
        }
    }

    async delete(idData){
        let modelInstance = new this.#model();        
        try {
            let result = await modelInstance.deleteById(idData);
            return result.toObject() || result;
        } catch (error) {
            throw error;
        }
    }


}

module.exports = ResourceController;