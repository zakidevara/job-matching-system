const ResourceController = require('./ResourceController');
const User = require('../../model/User');
const Degree = require('../../model/Degree');
const Education = require('../../model/Education');
const {v4: uuidv4 } = require('uuid');

class UserController extends ResourceController{

    constructor(){
        super(User);
    }
    // Get all user
    async all(){
        try{
            let userList = await User.all();
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
            let userData = await User.find(userID);
            if(userData === null) throw new Error('User tidak ditemukan');

            return userData.toObject();
        }catch(e){
            throw e;
        }
    }

    // Update data user
    async updateData(userID, userData){
        let user = await User.find(userID);
        if(user === null) throw new Error('User tidak ditemukan');

        let updateResult = await user.update(userData);
        return updateResult.toObject();
    }

    // Add new skill
    async addSkill(userID, skillList){
        let user = await User.find(userID);
        if(user === null) throw new Error('User tidak ditemukan');

        let addSkillResult = await user.addSkill(skillList);
        return addSkillResult;
    }

    // Remove skill
    async removeSkill(userID, skillID){
        let user = await User.find(userID);
        if(user === null) throw new Error('User tidak ditemukan');

        let removeSkillResult = await user.removeSkill(skillID);
        return removeSkillResult;
    }

    // Get all skill
    async getUserSkills(userID){
        let user = await User.find(userID);
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
            let degree = await Degree.find(educationData.degreeId);
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
            let education = await Education.find(educationId);
            if(education === null) throw new Error('Data pendidikan tidak ditemukan');

            let result = await education.delete();
            return result;
        } catch(e){
            throw e;
        }
    }

}

module.exports = UserController;
