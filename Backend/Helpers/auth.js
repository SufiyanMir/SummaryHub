const bcrypt=require('bcrypt')

async function hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (err) {
      throw new Error('Error hashing password: ' + err.message);
    }
  }
async function comparePassword(candidatePassword, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(candidatePassword, hashedPassword);
      return isMatch;
    } catch (err) {
      throw new Error('Error comparing passwords: ' + err.message);
    }
  }
module.exports={hashPassword,comparePassword};