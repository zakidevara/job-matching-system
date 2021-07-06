const ResourceController = require('./ResourceController');
const User = require('../../model/User');
const Degree = require('../../model/Degree');
const Education = require('../../model/Education');
const {v4: uuidv4 } = require('uuid');
const WorkExperience = require('../../model/WorkExperience');
const WorkExperienceType = require('../../model/WorkExperienceType');

class UserController extends ResourceController{

    constructor(){
        super(User);
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

    // Get user by ID
    async findByID(userID){
        try{
            let userModel = new User();
            let userData = await userModel.findById(userID);
            if(userData === null) throw new Error('User tidak ditemukan');

            return userData.toObject();
        }catch(e){
            throw e;
        }
    }

    // Update data user
    async updateData(userID, userData){
        
        let userModel = new User();
        let user = await userModel.findById(userID);
        if(user === null) throw new Error('User tidak ditemukan');

        let updateResult = await user.update(userData);
        return updateResult.toObject();
    }

    // Add new skill
    async addSkill(userID, skillList){
        
        let userModel = new User();
        let user = await userModel.findById(userID);
        if(user === null) throw new Error('User tidak ditemukan');

        let addSkillResult = await user.addSkill(skillList);
        return addSkillResult;
    }

    // Remove skill
    async removeSkill(userID, skillID){
        
        let userModel = new User();
        
        let user = await userModel.findById(userID);
        if(user === null) throw new Error('User tidak ditemukan');

        let removeSkillResult = await user.removeSkill(skillID);
        return removeSkillResult;
    }

    // Get all skill
    async getUserSkills(userID){
        
        let userModel = new User();
        let user = await userModel.findById(userID);
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
        try{
            let degModel = new Degree();
            let degree = await degModel.findById(educationData.degreeId);
            let newEdu = new Education(uuidv4(), educationData.userId, educationData.schoolName, degree, educationData.fieldOfStudy, educationData.startYear, educationData.endYear);
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
