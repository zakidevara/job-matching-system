class Applicant{
    // Property of applicant (private)
    #userID;
    #dateApplied;
    #similarity;
    #status;

    constructor(userID, date, sim, stat){
        this.#userID = userID;
        this.#dateApplied = date;
        this.#similarity = sim;
        this.#status = stat;
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
    setStatus(newStat){
        this.#status = newStat;
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
    getStatus(){
        return this.#status;
    }

    toObject(){
        let resultObj = {
            userID: this.#userID,
            dateApplied: this.#dateApplied,
            similarity: this.#similarity,
            status: this.#status
        }
        return resultObj;
    }
}

module.exports = Applicant;