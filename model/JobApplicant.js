class JobApplicant{
    // Property of applicant (private)
    #user;
    #dateApplied;
    #similarity;
    #applicantDocuments;
    #status;

    constructor(user, date, sim, stat, appDoc=''){
        this.#user = user;
        this.#dateApplied = date;
        this.#similarity = sim;
        this.#status = stat;
        this.#applicantDocuments = appDoc;
    }

    setSimilarity(newSim){
        this.#similarity = newSim;
    }
    setStatus(newStat){
        this.#status = newStat;
    }
    getUser(){
        return this.#user;
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
            status: this.#status,
            applicantDocuments: this.#applicantDocuments
        }
        return resultObj;
    }
}

module.exports = JobApplicant;