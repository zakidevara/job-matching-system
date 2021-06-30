const Model = require("./Model");
const {v4: uuidv4 } = require('uuid');
const DB = require("../services/DB");
const Degree = require("./Degree");

class Education extends Model{
    // Private of education (private)
    #educationID;
    #userID;
    #schoolName;
    #degree;
    #fieldOfStudy;
    #startYear;
    #endYear;
    #grade;
    #activity;
    #description;

    constructor(educationID, userID, schoolName, degree, fieldOfStudy, startYear, endYear, grade, activity, description){
        super();
        this.#educationID = educationID;
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
    // Getter
    getID(){
        return this.#educationID;
    }
    setDegree(newDegree){
        this.#degree = newDegree;
    }

    cleaningStringFormat(stringInput){
        let result = stringInput;
        result = result.replace(/\\n/g, function(x) {
            return '\\\\n';
        });
        result = result.replace(/\\r/g, function(x) {
            return '\\\\r';
        });
        return result;
    }

    toObject(){
        let result = {
            educationId: this.#educationID,
            userId: this.#userID,
            schoolName: this.#schoolName,
            degree: this.#degree.toObject(),
            fieldOfStudy: this.#fieldOfStudy,
            startYear: this.#startYear,
            endYear: this.#endYear,
            grade: this.#grade,
            activity: this.#activity,
            description: this.#description
        };
        return result;
    }

    // Database related
    async save(){
        let query = `MATCH (u:User {nim: '${this.#userID}'})
                     MERGE (u)-[:STUDIED_AT]->(e:Education)
                     SET e.schoolName = '${this.#schoolName}',
                     e.fieldOfStudy = '${this.#fieldOfStudy}',
                     e.startYear = '${this.#startYear}',
                     e.endYear = '${this.#endYear}',
                     e.grade = ${this.#grade},
                     e.activity = '${this.#activity}',
                     e.description = '${this.#description}'
                     WITH e
                     MATCH (d:Degree {id: '${this.#degree.degreeId}'})
                     MERGE (e)-[:HAS_DEGREE]->(d)
                     RETURN e, d`;
        try{
            let result = await DB.query(query);
            return result.records.length > 0 ? true : false;
        } catch(e){
            throw e;
        }
    }

    static async getAllUserEducation(userID){
        let query = `MATCH (u:User {nim: '${userID}'})-[:STUDIED_AT]-(e:Education), (e)-[:HAS_DEGREE]->(d:Degree) RETURN e{.*, degree: d{.*}}`;
        try{
            let result = await DB.query(query);
            let listEdu = [];

            if(result.records.length > 0){
                result.records.forEach((item) => {
                    let propEdu = item.get('e');
                    let degree = new Degree(propEdu.degree.id, propEdu.degree.name);
                    let education = new Education(propEdu.id, userID, propEdu.schoolName, degree.toObject(), propEdu.fieldOfStudy, propEdu.startYear, propEdu.endYear, propEdu.grade, propEdu.activity, propEdu.description);
                    if(listEdu.length === 0){
                        listEdu.push(education.toObject());
                    } else {
                        let validateItem = listEdu.some(e => e.educationId === education.getID());
                        if(!validateItem) listEdu.push(education.toObject());
                    }
                });
                return listEdu;
            } else {
                return null;
            }
        } catch(e) {
            throw e;
        }
    }

    static async find(educationID){
        let query = `MATCH (e:Education {id: '${educationID}'})-[:HAS_DEGREE]-(d:Degree), (e)<-[:STUDIED_AT]-(u:User) RETURN e{.*, userId: u.nim, degree: d{.*}}`;
        try{
            let result = await DB.query(query);

            if(result.records.length > 0){
                let propEdu = result.records[0].get('e');
                let degree = new Degree(propEdu.degree.id, propEdu.degree.name);
                let education = new Education(propEdu.id, propEdu.userId, propEdu.schoolName, degree.toObject(), propEdu.fieldOfStudy, propEdu.startYear, propEdu.endYear, propEdu.grade, propEdu.activity, propEdu.description);
                return education;
            } else {
                return null;
            }
        } catch(e){
            throw e;
        }
    }

    async delete(){
        let query = `MATCH (e:Education {id: '${this.#educationID}'}) DETACH DELETE e RETURN COUNT(e)`;
        try{
            let result = await DB.query(query);
            if(result.records.length > 0){
                return 'Success';
            } else {
                return 'Failed';
            }
        } catch(e){
            throw e;
        }
    }

    async update(updatedEducation){
        let query = `MATCH (e:Education {id: '${this.#educationID}'})
                     SET `;

        let eduProperty = Object.keys(updatedEducation);
        eduProperty.forEach((item) => {
            let value = updatedEducation[item];
            if(value !== null){
                if(item !== 'grade'){
                    value = this.cleaningStringFormat(value);
                    query += `e.` + item + ` = '${value}',`;
                } else {
                    query += `e.` + item + ` = ${value},`;
                }
            }
        });

        query = query.substr(0, query.length-1);
    }
}

module.exports = Education;