const Model = require("./Model");

class Education extends Model{
    // Private of education (private)
    #userID;
    #schoolName;
    #degree;
    #fieldOfStudy;
    #startYear;
    #endYear;
    #grade;
    #activity;
    #description;

    constructor(userID, schoolName, degree, fieldOfStudy, startYear, endYear, grade, activity, description){
        this.#userID = userID;
        this.#schoolName = schoolName;
        this.#degree = degree;
        this.#fieldOfStudy = fieldOfStudy;
        this.#startYear = startYear;
        this.#endYear = endYear;
        this.#grade = grade;
        this.#activity = activity;
        this.#description = description;
    }

    // Setter
    setSchoolName(newName){
        this.#schoolName = newName;
    }
    setDegree(newDegree){
        this.#degree = newDegree;
    }
    setFieldOfStudy(newFieldOfStudy){
        this.#fieldOfStudy = newFieldOfStudy;
    }
    setStartYear(newYear){
        this.#startYear = newYear;
    }
    setEndYear(newYear){
        this.#endYear = newYear;
    }
    setGrade(newGrade){
        this.#grade = newGrade;
    }
    setActivity(newAct){
        this.#activity = newAct;
    }
    setDesc(newDesc){
        this.#description = newDesc;
    }

    // Getter
    getUserID(){
        return this.#userID;
    }
    getSchoolName(){
        return this.#schoolName;
    }
    getDegree(){
        return this.#degree;
    }
    getFieldOfStudy(){
        return this.#fieldOfStudy;
    }
    getStartYear(){
        return this.#startYear;
    }
    getEndYear(){
        return this.#endYear;
    }
    getGrade(){
        return this.#grade;
    }
    getActivity(){
        return this.#activity;
    }
    getDescription(){
        return this.#description;
    }
}