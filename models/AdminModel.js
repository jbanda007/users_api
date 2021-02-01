/* eslint-disable no-self-assign */
/* eslint-disable no-param-reassign */
const visibilityPlugin = require('objection-visibility').default;
const jwt = require('jwt-simple');
const bcrypt = require('bcryptjs');
const Model = require('../config/database');
const constants = require('../config/constants');

class AdminModel extends visibilityPlugin(Model) {
  // Table name is the only required property.
  static get tableName() {
    return 'admins';
  }

  // Each model must have a column (or a set of columns) that uniquely
  static get idColumn() {
    return 'id';
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString();
  }

  // User Schema
  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstname', 'lastname', 'email', 'password'],

      properties: {
        id: { type: 'integer' },
        firstname: { type: 'string', minLength: 1, maxLength: 50 },
        lastname: { type: 'string', minLength: 1, maxLength: 50 },
        email: { type: 'string', minLength: 1, maxLength: 100 },
        password: { type: 'string', minLength: 1, maxLength: 255 },
        status: { type: 'integer' },
      },
    };
  }

  // Hide column
  static get hidden() {
    return ['password'];
  }

  // Filter before insert
  // eslint-disable-next-line no-dupe-class-members
  async $beforeInsert() {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Get User Data
  static async getUserdata(filter, select = '') {
    if (select !== '') {
      select = select;
    } else {
      select = '*';
    }
    const getData = await AdminModel
      .query()
      .select(select)
      .where(filter)
      .first();

    return getData;
  }

  // Validate User Credentials
  static async validateCredentials(reqBody, userData) {
    try {
      const passwordValid = await bcrypt.compareSync(reqBody.password, userData.password); // true
      if (!passwordValid) {
        return {
          status: false,
          message: constants.INVALID_CREDENTIALS,
        };
      }
      if (!userData.status) {
        return {
          status: false,
          message: constants.ACCOUNT_NOT_ACTIVATED,
        };
      }
      return {
        status: true,
        message: constants.LOGIN_SUCCESS,
        data: userData,
      };
    } catch (e) {
      console.log(e);
      return {
        status: false,
        message: e,
      };
    }
  }

  // Generate JWT Token
  static generateToken(user) {
    const dateObj = new Date();
    const expires = dateObj.setDate(dateObj.getDate() + 7);
    const token = jwt.encode({
      exp: expires,
      id: user.id,
      is_admin: true,
    }, process.env.JWT_SECRET);

    return {
      token,
      expires,
      admin: user,
    };
  }
}

module.exports = AdminModel;
