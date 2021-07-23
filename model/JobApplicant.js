class JobApplicant{
    // Property of applicant (private)
    #user;
    #dateApplied;
    #applicantDocuments;
    #status;

    constructor(user, date, stat, appDoc=''){
        this.#user = user;
        this.#dateApplied = date;
        this.#status = stat;
        this.#applicantDocuments = appDoc;
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
    getStatus(){
        return this.#status;
    }

    toObject(){
        let resultObj = {
            user: this.#user.toObject(),
            dateApplied: this.#dateApplied,
            status: this.#status,
            applicantDocuments: this.#applicantDocuments
        }
        return resultObj;
    }
}

module.exports = JobApplicant;