const Model = require("./Model");

class Achievement extends Model{
    // Property of achievement (private);
    #userID;
    #title;
    #issuer;
    #dateIssued;
    #description;

    constructor(userID, title, issuer, dateIssued, description){
        this.#userID = userID;
        this.#title = title;
        this.#issuer = issuer;
        this.#dateIssued = dateIssued;
        this.#description = description;
    }

    // Setter
    setTitle(newTitle){
        this.#title = newTitle;
    }
    setIssuer(newIssuer){
        this.#issuer = newIssuer;
    }
    setDateIssued(newDate){
        this.#dateIssued = newDate;
    }
    setDesc(newDesc){
        this.#description = newDesc;
    }

    // Getter
    getUserID(){
        return this.#userID;
    }
    getTitle(){
        return this.#title;
    }
    getIssuer(){
        return this.#issuer;
    }
    getDateIssued(){
        return this.#dateIssued;
    }
    getDesc(){
        return this.#description;
    }

}

module.exports = Achievement;