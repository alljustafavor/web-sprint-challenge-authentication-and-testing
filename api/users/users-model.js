const db = require("../../data/dbConfig");
const bcrypt = require("bcryptjs");

const User = {

  async get_all() {
    return db("users");
  },

  async get_by_id(id) {
    return db("users").where({ id }).first();
  },

  async find_by_username(username) {
    const user = await db("users").where({ username }).first();
    return user;
  },

  async create(user_data) {
    const { username, password } = user_data;
    const hashed_password = bcrypt.hashSync(password, 10);
      const [id] = await db("users").insert({
        username,
        password: hashed_password,
      });
      const newUser = await this.get_by_id(id);
      return newUser;
  },

  async verify_password(user, password) {
    console.log("Verifying password for user:", user);
    return bcrypt.compareSync(password, user.password);
  }

};

module.exports = User;
