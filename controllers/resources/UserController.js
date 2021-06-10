const ResourceController = require('./ResourceController');
const User = require('../../model/User');

class UserController extends ResourceController{

    constructor(label){
        super(label);
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
        return updateResult;
    }

    // Add new skill
    async addSkill(userID, skillList){
        let user = await User.find(userID);
        if(user === null) return null;

        let addSkillResult = await user.addSkill(skillList);
        return addSkillResult;
    }

    async removeSkill(userID, skillID){
        let user = await User.find(userID);
        if(user === null) return null;

        let removeSkillResult = await user.removeSkill(skillID);
        return removeSkillResult;
    }

}

module.exports = UserController;
