class Applicant{
    // Property of applicant (private)
    #userID;
    #dateApplied;
    #similarity;

    constructor(userID, date, sim){
        this.#userID = userID;
        this.#dateApplied = date;
        this.#similarity = sim;
    }

    setUserID(newID){
        this.#userID = newID;
    }
    setDateApplied(newDate){
        this.#dateApplied = newDate;
    }
    setSimilarity(newSim){
        this.#similarity = newSim;
    }

    getUserID(){
        return this.#userID;
    }
    getDateApplied(){
        return this.#dateApplied;
    }
    getSimilarity(){
        return this.#similarity;
    }

    toObject(){
        let resultObj = {
            userID: this.#userID,
            dateApplied: this.#dateApplied,
            similarity: this.#similarity
        }
        return resultObj;
    }
}

module.exports = Applicant;