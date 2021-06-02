class Model {
    #id;
    constructor(id){
        this.#id = id;
    }

    setID(newID){
        this.#id = newID;
    }

    getID(){
        return this.#id;
    }
    
    static async all(){}
    static async find(){}
    static async findById(){}
    static async create(){}
    static async update(){}
    static async deleteByID(){}
    async delete(){}
    async save(){}
}

module.exports = Model;