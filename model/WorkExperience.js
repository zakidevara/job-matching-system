const Model = require("./Model");

class WorkExperience extends Model{
    // Property of work experience (private)
    #userID;
    #title;
    #workExpType;
    #companyName;
    #location;
    #startDate;
    #endDate;
    #description;

    constructor(userID, title, workExpType, companyName, location, startDate, endDate, description){
        this.#userID = userID;
        this.#title = title;
        this.#workExpType = workExpType;
        this.#companyName = companyName;
        this.#location = location;
        this.#startDate = startDate;
        this.#endDate = endDate;
        this.#description = description;
    }

    // Setter
    setTitle(newTitle){
        this.#title = newTitle;
    }
    setWorkExpType(newType){
        this.#workExpType = newType;
    }
    setCompanyName(newName){
        this.#companyName = newName;
    }
    setLocation(newLoc){
        this.#location = newLoc;
    }
    setStartDate(newDate){
        this.#startDate = newDate;
    }
    setEndDate(newDate){
        this.#endDate = newDate;
    }
    setDesc(newDesc){
        this.#description = newDesc;
    }

    // Getter
    getTitle(){
        return this.#title;
    }
    getWorkExpType(){
        return this.#workExpType;
    }
    getCompanyName(){
        return this.#companyName;
    }
    getLocation(){
        return this.#location;
    }
    getStartDate(){
        return this.#startDate;
    }
    getEndDate(){
        return this.#endDate;
    }
    getDesc(newDesc){
        return this.#description;
    }
}