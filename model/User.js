const Model = require("./Model");

class User extends Model {
    // Property of user (private)
    #name;
    #email;
    #address;
    #number;
    #programStudi;
    #angkatan;
    #skills;

    constructor(name, email, address, number, programStudi, angkatan, skill){
        super(1);   // Default id
        this.#name = name;
        this.#email = email;
        this.#address = address;
        this.#number = number;
        this.#programStudi = programStudi
        this.#angkatan = angkatan;
        this.#skills = skill;
    }

    // Setter
    setName(newName){
        this.#name = newName;
    }
    setEmail(newEmail){
        this.#email = newEmail;
    }
    setAddress(newAddress){
        this.#address = newAddress;
    }
    setNumber(newNumber){
        this.#number = newNumber;
    }
    setProgramStudi(newProgramStudi){
        this.#programStudi = newProgramStudi;
    }
    setAngkatan(newAngkatan){
        this.#angkatan = newAngkatan;
    }

    // Getter
    getName(){
        return this.#name;
    }
    getEmail(){
        return this.#email;
    }
    getAddress(){
        return this.#address;
    }
    getNumber(){
        return this.#number;
    }
    getProgramStudi(){
        return this.#programStudi;
    }
    getAngkatan(){
        return this.#angkatan;
    }
    getSkill(){
        return this.#skills;
    }
    
}

module.exports = User;