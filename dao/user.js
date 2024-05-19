const bcrypt = require('bcrypt');
const User = require('../models/user');

module.exports = {};

module.exports.createUser = async (email, password, roles) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        email: email,
        password: hashedPassword,
        roles: roles
    })

    try {
        const savedUser = await newUser.save();
        return savedUser;
      } catch (error) {
        console.log(error);
        throw error;
      }
}

module.exports.getUser = async (email) => {
    return await User.findOne({ email }).lean();
}

module.exports.getUserById = async (id) => {
    return await User.findById(id);
}


module.exports.updateUserPassword = async (user, newPassword) => {
    try {
        const updatedUserPasswordHash = await bcrypt.hash(newPassword, 10);
        user.password = updatedUserPasswordHash;
        return await user.save();
    } catch (error) {
        throw new Error(`Error updating user password: ${error.message}`);
    }
};