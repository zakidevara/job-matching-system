const ResourceController = require('./ResourceController');
const User = require('../../model/User');

class UserController extends ResourceController{

    constructor(label){
        super(label);
    }

    async create(userData){
        let newUser = await User.create(userData);
        return newUser.toObject();
    }

    // Get all user
    async all(){
        let userList = await User.all();
        return userList;
    }

    // Get user by ID
    async findByID(userID){
        let userData = await User.find(userID);
        return userData.toObject();
    }

    // Update data user
    async updateData(userID, userData){
        let user = await User.find(userID);
        if(user === null) return null;

        let updateResult = await user.update(userData);
        return updateResult.toObject();
    }

    // Add new skill
    async addSkill(userID, skillList){
        let user = await User.find(userID);
        if(user === null) return null;

        let addSkillResult = await user.addSkillv2(skillList);
        return addSkillResult;
    }

    // Remove skill
    async removeSkill(userID, skillID){
        let user = await User.find(userID);
        if(user === null) return null;

        let removeSkillResult = await user.removeSkill(skillID);
        return removeSkillResult;
    }

    // Get all skill
    async getUserSkills(userID){
        let user = await User.find(userID);
        if(user == null) return null;

        let tempSkills = await user.getSkills();
        let listSkills = [];
        tempSkills.forEach((item, index) => {
            let obj = item.toObject();
            listSkills.push(obj);
        });
        return listSkills;
    }

}

module.exports = UserController;
