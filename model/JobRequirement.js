const Gender = require("./Gender");
const Model = require("./Model");
const Religion = require("./Religion");
const Skill = require("./Skill");
const StudyProgram = require("./StudyProgram");

class JobRequirement extends Model{
    // Property of job requirement (private)
    #classYearRequirement;
    #studyProgramRequirement;
    #documentRequirement;
    #requiredSkills;
    #softSkillRequirement;
    #maximumAge;
    #requiredReligion;
    #requiredGender;
    #description;

    constructor(classYear=[], studyProgram=[], documents='', skills=[], softSkill='', maxAge=0, religions=[], gender=[], desc=''){
        super();
        this.#classYearRequirement = classYear; 
        this.#studyProgramRequirement = studyProgram;
        this.#documentRequirement = documents;
        this.#requiredSkills = skills;
        this.#softSkillRequirement = softSkill;
        this.#maximumAge = maxAge;
        this.#requiredReligion = religions;
        this.#requiredGender = gender;
        this.#description = desc;
    }

    async init(){
        let requiredStuPro = this.#studyProgramRequirement;
        if(requiredStuPro !== null && requiredStuPro.length > 0){
            requiredStuPro.forEach((item, index, array) => {
                if(typeof item !== 'object'){
                    let objStuPro = {
                        studyProgramId: item,
                        name: StudyProgram.toString(item)
                    };
                    array[index] = objStuPro;
                }
            });
            this.#studyProgramRequirement = requiredStuPro;
        }
        let requiredGenderTemp = this.#requiredGender;
        if(requiredGenderTemp !== null && requiredGenderTemp.length > 0){
            requiredGenderTemp.forEach((item, index, array) => {
                if(typeof item !== 'object'){
                    let objGen = {
                        genderId: item,
                        name: Gender.toString(item)
                    };
                    array[index] = objGen;
                }
            });
            this.#requiredGender = requiredGenderTemp;
        }
        let requiredSkillsTemp = [];
        if(this.#requiredSkills !== null && this.#requiredSkills.length > 0){
            for(let i=0; i < this.#requiredSkills.length; i++){
                let value = this.#requiredSkills[i];
                if(typeof value !== Skill){
                    let skillModel = new Skill();
                    let skill = await skillModel.findById(value);
                    if(skill !== null) requiredSkillsTemp.push(skill);
                }
            }
            this.#requiredSkills = requiredSkillsTemp;
        }
        let requiredReligionTemp = [];
        if(this.#requiredReligion !== null && this.#requiredReligion.length > 0){
            for(let i=0; i < this.#requiredReligion.length; i++){
                let value = this.#requiredReligion[i];
                if(typeof value !== Religion){
                    let relModel = new Religion();
                    let religion = await relModel.findById(value);
                    if(religion !== null) requiredReligionTemp.push(religion);
                }
            }
            this.#requiredReligion = requiredReligionTemp;
        }
    }

    setSkills(newSkillList){
        this.#requiredSkills = newSkillList;
    }
    setStudyProgram(newStuPro){
        this.#studyProgramRequirement = newStuPro;
    }
    setGender(newGender){
        this.#requiredGender = newGender;
    }

    setReligions(newReligionsList){
        this.#requiredReligion = newReligionsList;
    }

    getClassYear(){
        return this.#classYearRequirement;
    }
    getStudyProgram(){
        return this.#studyProgramRequirement;
    }
    getGender(){
        return this.#requiredGender;
    }

    getSkills(){
        return this.#requiredSkills;
    }
    getReligion(){
        return this.#requiredReligion;
    }

    toObject(){
        let listSkillsObj = [];
        if(this.#requiredSkills.length > 0){
            for(let i=0; i < this.#requiredSkills.length; i++){
                let value = this.#requiredSkills[i];
                let skill = value.toObject();
                listSkillsObj.push(skill);
            }
        }

        let listReligionObj = [];
        if(this.#requiredReligion.length > 0){
            for(let i=0; i < this.#requiredReligion.length; i++){
                let value = this.#requiredReligion[i];
                let religion = value.toObject();
                listReligionObj.push(religion);
            }
        }

        let objResult = {
            classYearRequirement: this.#classYearRequirement,
            studyProgramRequirement: this.#studyProgramRequirement,
            documentRequirement: this.#documentRequirement,
            requiredSkills: listSkillsObj,
            softSkillRequirement: this.#softSkillRequirement,
            maximumAge: this.#maximumAge,
            requiredReligion: listReligionObj,
            requiredGender: this.#requiredGender,
            description: this.#description
        };
        return objResult;
    }
}

module.exports = JobRequirement;