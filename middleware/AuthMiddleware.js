/* eslint-disable consistent-return */
/* eslint-disable max-len */
/* eslint-disable func-names */
// Auth Middleware for validate Token and Client Key
const jwt = require('jwt-simple');
const { Validator } = require('node-input-validator');
const constants = require('../config/constants');
const { jsonFormat } = require('../config/helpers');

module.exports = async (req, res, next) => {
  const validator = new Validator(req.headers, {
    authorization: 'required',
  });
  const val = await validator.check();
  if (!val) return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.AUTHORIZATION_NOT_SENT, []);
  // Check authentication
  const token = req.headers.authorization;
  console.log('toke', token);
  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET);
    if (decoded.exp <= Date.now()) {
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.TOKEN_EXPIRED, []);
    }
    // Authorize the user to see if (s)he can access our resources
    req.session.user_id = decoded.id;
    req.session.is_admin = (decoded.is_admin ? decoded.is_admin : false);
    next();
  } catch (err) {
    console.log('err', err);
    return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.INVALID_TOKEN_EXPIRED, []);
  }
};
