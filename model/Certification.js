const Model = require("./Model");

class Certification extends Model {
    // Property of certification (private);
    #id;
    #userID;
    #name;
    #issuer;
    #dateIssued;
    #expiryDate;
    #credentialID;
    #credentialURL;

    constructor(id, userID, name, issuer, dateIssued, expiryDate, credentialID, credentialURL){
        this.#id = id;
        this.#userID = userID;
        this.#name = name;
        this.#issuer = issuer;
        this.#dateIssued = dateIssued;
        this.#expiryDate = expiryDate;
        this.#credentialID = credentialID;
        this.#credentialURL = credentialURL;
    }

    // Setter
    setName(newName){
        this.#name = newName;
    }
    setIssuer(newIssuer){
        this.#issuer = newIssuer;
    }
    setDateIssued(newDate){
        this.#dateIssued = newDate;
    }
    setExpiredDate(newDate){
        this.#expiryDate = newDate;
    }
    setCredentialID(newID){
        this.#credentialID = newID;
    }
    setCredentialURL(newURL){
        this.#credentialURL = newURL;
    }

    // Getter
    getId(){
        return this.#id;
    }
    getUserID(){
        return this.#userID;
    }
    getName(){
        return this.#name;
    }
    getIssuer(){
        return this.#issuer;
    }
    getDateIssued(){
        return this.#dateIssued;
    }
    getExpiryDate(){
        return this.#expiryDate;
    }
    getCredentialID(){
        return this.#credentialID;
    }
    getCredentialURL(){
        return this.#credentialURL;
    }
}