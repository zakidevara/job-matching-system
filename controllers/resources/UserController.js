const ResourceController = require('./ResourceController');
const User = require('../../model/User');

class UserController extends ResourceController{

    constructor(label){
        super(label);
    }

    // Get all user
    static async all(){
        let userList = await User.all();
        return userList;
    }

    // Get user by ID
    static async findByID(userID){
        let userData = await User.find(userID);
        return userData;
    }

}

module.exports = UserController;
