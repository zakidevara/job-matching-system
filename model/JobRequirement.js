const { Model } = require("./Model");

class JobRequirement extends Model{
    // Property of job requirement (private)
    #classYearReq;
    #studyProgramReq;
    #docReq;
    #requiredSkills;
    #softSkillReq;
    #maximumAge;
    #requiredReligion;
    #requiredGender;
    #description;

    constructor(classYear=[], studyProgram=[], documents='', skills=[], softSkill='', maxAge=0, religions=[], gender=[], desc=''){
        super();
        this.#classYearReq = classYear;
        this.#studyProgramReq = studyProgram;
        this.#docReq = documents;
        this.#requiredSkills = skills;
        this.#softSkillReq = softSkill;
        this.#maximumAge = maxAge;
        this.#requiredReligion = religions;
        this.#requiredGender = gender;
        this.#description = desc;
    }

    setSkills(newSkillList){
        this.#requiredSkills = newSkillList;
    }

    setReligions(newReligionsList){
        this.#requiredReligion = newReligionsList;
    }

    getSkills(){
        return this.#requiredSkills;
    }
    getReligion(){
        return this.#requiredReligion;
    }

    toObject(){
        let objResult = {
            classYearRequirement: this.#classYearReq,
            studyProgramRequirement: this.#studyProgramReq,
            documentsRequirement: this.#docReq,
            requiredSkills: this.#requiredSkills,
            softSkillReq: this.#softSkillReq,
            maximumAge: this.#maximumAge,
            requiredReligion: this.#requiredReligion,
            requiredGender: this.#requiredGender,
            description: this.#description
        };
        return objResult;
    }
}

module.exports = JobRequirement;