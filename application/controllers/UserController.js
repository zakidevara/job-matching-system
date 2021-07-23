const ResourceController = require('./ResourceController');
const User = require('../../model/User');
const Degree = require('../../model/Degree');
const Education = require('../../model/Education');
const {v4: uuidv4 } = require('uuid');
const WorkExperience = require('../../model/WorkExperience');
const WorkExperienceType = require('../../model/WorkExperienceType');
const Validator = require('validatorjs');

class UserController extends ResourceController{

    constructor(){
        super(User);
    }

    validate(userData){
        let rules = {
            nim: 'required|string',
            name: 'required|string',
            birthDate: 'required|date',
            gender: 'required|integer',
            phoneNumber: 'required|string',
            gender: 'required|integer',
            studyProgram: 'required|integer',
            classYear: 'required|integer'
        };
        let validator = new Validator(userData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    validateProfilPictureInput(photo){
        if(photo.mimetype !== 'image/png' || photo.mimetype !== 'image/jpeg'){
            let errors = {
                formatPhoto : [
                    'Format foto harus bertipe png atau jpg'
                ]
            };
            return errors;
        }
        if(photo.size > 500000){
            let errors = {
                sizePhoto : [
                    'Ukuran foto maksimum 500 kb'
                ]
            };
            return errors;
        }
        return true;
    }

    validateAddSkillInput(inputData){
        let rules = {
            nim: 'required|string',
            skillList: 'array'
        };
        let validator = new Validator(inputData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    validateEducationInput(eduData){
        let rules = {
            educationId: 'required|string',
            nim: 'required|string',
            schoolName: 'required|string',
            degreeId: 'required|string',
            fieldOfStudy: 'string',
            startYear: 'required|integer',
            endYear: 'integer'
        };
        let validator = new Validator(eduData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    validateWorkExpInput(workExpData){
        let rules = {
            nim: 'required|string',
            title: 'required|string',
            companyName: 'required|string',
            workExperienceType: {
                id: 'required|string'
            },
            startDate: 'required|date',
            endDate: 'after:startDate|date'
        };
        let validator = new Validator(workExpData, rules);
        if(validator.passes()){
            return true;
        } else {
            return validator.errors;
        }
    }

    // Get all user
    async all(){
        try{
            let userModel = new User();
            let userList = await userModel.all();
            userList.forEach((item, index, array) => {
                let user = item.toObject();
                array[index] = user;
            });

            return userList;
        }catch(e){
            throw e;
        }
    }

    async create(userData) {
        let validInput = this.validate(userData);
        if(validInput !== true){
            return validInput;
        }

        let validPhoto = this.validateProfilPictureInput(userData.photo);
        if(validPhoto !== true){
            return validPhoto;
        }

        try{
            let userModel = new User();
            let user = await userModel.findById(userData.nim);
            if(user === null) throw new Error('User tidak ditemukan');

            user.setName(userData.name);
            user.setGender(userData.gender);
            user.setBirthDate(userData.birthDate);
            user.setNumber(userData.phoneNumber);
            user.setStudyProgram(userData.studyProgram.studyProgramId);
            user.setClassYear(userData.classYear);
            user.init();
            let pathPhoto = '';
            let isPhotoValid = false;
            if(userData.photo !== undefined){
                pathPhoto = user.savePhoto(userData.photo);
                if(pathPhoto !== null){
                    user.setPhoto(pathPhoto);
                    isPhotoValid = true;
                }
            }
            if(!isPhotoValid) user.setPhoto(pathPhoto);

            try{
                let result = await user.save();
                if(result){
                    return user.toObject();
                } else {
                    throw new Error('Gagal menambahkan data user');
                }
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    // Get user by ID
    async findByID(userId){
        try{
            let userModel = new User();
            let userData = await userModel.findById(userId);
            if(userData === null) throw new Error('User tidak ditemukan');

            return userData.toObject();
        }catch(e){
            throw e;
        }
    }

    // Update data user
    async update(userId, userData){
        let validInput = this.validate(userData);
        if(validInput !== true){
            return validInput;
        }

        let validPhoto = this.validateProfilPictureInput(userData.photo);
        if(validPhoto !== true){
            return validPhoto;
        }

        let userModel = new User();
        let user = await userModel.findById(userId);
        if(user === null) throw new Error('User tidak ditemukan');

        let updateResult = await user.update(userData);
        return updateResult.toObject();
    }

    // Add new skill
    async addSkill(userId, skillList){
        let inputData = {
            nim: userId,
            skillList: skillList
        };
        let validInput = this.validateAddSkillInput(inputData);
        if(validInput !== true){
            return validInput;
        }
        
        let userModel = new User();
        let user = await userModel.findById(userId);
        if(user === null) throw new Error('User tidak ditemukan');

        let addSkillResult = await user.addSkill(skillList);
        return addSkillResult;
    }

    // Remove skill
    async removeSkill(userId, skillId){
        
        let userModel = new User();
        
        let user = await userModel.findById(userId);
        if(user === null) throw new Error('User tidak ditemukan');

        let removeSkillResult = await user.removeSkill(skillId);
        return removeSkillResult;
    }

    // Get all skill
    async getUserSkills(userId){
        
        let userModel = new User();
        let user = await userModel.findById(userId);
        if(user == null) throw new Error('User tidak ditemukan');

        let tempSkills = await user.getSkills();
        let listSkills = [];
        tempSkills.forEach((item, index) => {
            let obj = item.toObject();
            listSkills.push(obj);
        });
        return listSkills;
    }

    async addEducation(educationData){
        let educationId = uuidv4();
        let eduData = educationData;
        eduData.educationId = educationId;
        let validInput = this.validateEducationInput(eduData);
        if(validInput !== true){
            return validInput;
        }

        try{
            let degModel = new Degree();
            let degree = await degModel.findById(educationData.degreeId);
            let newEdu = new Education(educationId, educationData.nim, educationData.schoolName, degree, educationData.fieldOfStudy, educationData.startYear, educationData.endYear);
            try{
                let result = await newEdu.save();
                if(result){
                    return newEdu.toObject();
                } else {
                    throw new Error('Gagal menambahkan data pendidikan');
                }
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async deleteEducation(educationId){
        try{
            let eduModel = new Education();
            let education = await eduModel.findById(educationId);
            if(education === null) throw new Error('Data pendidikan tidak ditemukan');

            try{
                let result = await education.delete();
                return result;
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async updateEducation(educationId, updatedEduData){
        let eduData = updatedEduData;
        eduData.educationId = educationId;
        let validInput = this.validateEducationInput(eduData);
        if(validInput !== true){
            return validInput;
        }

        try{
            let eduModel = new Education();
            let education = await eduModel.findById(educationId);
            if(education === null) throw new Error('Data pendidikan tidak ditemukan');

            try{
                let resultUpdate = await education.update(updatedEduData);
                if(resultUpdate === null) throw new Error('Data pendidikan gagal diperbarui');
                
                return resultUpdate.toObject();
            } catch(e){
                throw e;
            }
        } catch(e){
            throw e;
        }
    }

    async addWorkExperience(workExperience, userId){
        let workExpData = workExperience;
        workExpData.nim = userId;
        let validInput = this.validateWorkExpInput(workExpData);
        if(validInput !== true){
            return validInput;
        }

        try{
            let workExpTypeObj = new WorkExperienceType('', '');
            let userModel = new User();
            userModel = await userModel.findById(userId);
            let workExpType = await workExpTypeObj.findById(workExperience.workExperienceType.id);
            let newWorkExp = new WorkExperience(uuidv4(), workExperience.title, workExpType, workExperience.companyName, workExperience.startDate, workExperience.endDate);

            console.log(userModel);
            let result = await userModel.addWorkExp(newWorkExp);
            if(result){
                return newWorkExp.toObject();
            } else {
                throw new Error('Gagal menambahkan data pengalaman kerja');
            }
        } catch(e){
            throw e;
        }
    }



}

module.exports = UserController;
