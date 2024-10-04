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
    return db("users").where({ username }).first();
  },

  async create(user_data) {
    const { username, password } = user_data;
    const hashed_password = bcrypt.hashSync(password, 10);
    const [id] = await db("users").insert({
      username,
      password: hashed_password,
    });
    return await this.get_by_id(id);
  },

  async update(user_id, changes) {
    if (changes.password) {
      changes.password = bcrypt.hashSync(changes.password, 10);
    }
    await db("users").where({ user_id }).update(changes);
    return await this.get_by_id(user_id)
  },

  async delete(user_id) {
    return db("users").where({ user_id }).del();
  }
};

module.exports = User;
