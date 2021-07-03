class Applicant{
    // Property of applicant (private)
    #user;
    #dateApplied;
    #similarity;
    #status;

    constructor(user, date, sim, stat){
        this.#user = user;
        this.#dateApplied = date;
        this.#similarity = sim;
        this.#status = stat;
    }

    setSimilarity(newSim){
        this.#similarity = newSim;
    }
    setStatus(newStat){
        this.#status = newStat;
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
            user: this.#user.toObject(),
            dateApplied: this.#dateApplied,
            similarity: this.#similarity,
            status: this.#status
        }
        return resultObj;
    }
}

module.exports = Applicant;