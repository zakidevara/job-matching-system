const Model = require("./Model");

class Job extends Model {
    // Property of job (private)
    #userID;
    #title;
    #description;
    #companyLogo;
    #companyName;
    #jobType;
    #salary;
    #createdAt;
    #updatedAt;
    #requiredSkills;
    #applicant

    constructor(userID, title, desc, companyLogo, companyName, jobType, salary, createdAt = null, requiredSkills, applicant = null){
        this.#userID = userID;
        this.#title = title;
        this.#description = desc;
        this.#companyLogo = companyLogo;
        this.#companyName = companyName;
        this.#jobType = jobType;
        this.#salary = salary;
        if(createdAt === null){
            let currentDate = new Date();
            this.#createdAt = currentDate.getDate() + "-" + 
                              (currentDate.getMonth()+1) + "-" +
                              currentDate.getFullYear() + "-" + " " + 
                              currentDate.getHours() + ":" +
                              currentDate.getMinutes() + ":" +
                              currentDate.getSeconds();
        }
        this.#requiredSkills = requiredSkills;
        if(applicant === null){
            this.#applicant = [];
        } else {
            this.#applicant = applicant;
        }
    }

    // Setter
    setTitle(newTitle){
        this.#title = newTitle;
    }
    setDesc(newDesc){
        this.#description = newDesc;
    }

    // Getter
    getTitle(){
        return this.#title;
    }
    getDesc(){
        return this.#description;
    }
    getRequiredSkills(){
        return this.#requiredSkills;
    }
    
}

module.exports = Job;