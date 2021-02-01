/* eslint-disable guard-for-in */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
const { Validator } = require('node-input-validator');
const { jsonFormat } = require('../config/helpers');
const constants = require('../config/constants');
const AdminModel = require('../models/AdminModel');

class AdminContoller {
  /* Login API */
  // eslint-disable-next-line class-methods-use-this
  async login(req, res) {
    try {
      const reqBody = req.body;
      const validator = new Validator(reqBody, {
        email: 'required|email',
        password: 'required',
      });

      const matched = await validator.check();
      if (!matched) {
        // eslint-disable-next-line no-restricted-syntax
        // eslint-disable-next-line guard-for-in
        for (const key in validator.errors) {
          return jsonFormat(res, constants.BAD_REQUEST_CODE, validator.errors[key].message, []);
        }
      }

      const filterData = {
        email: (reqBody.email).toLowerCase(),
      };
      const getUserData = await AdminModel.getUserdata(filterData);
      if (getUserData === undefined) {
        return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.ACCOUNT_NOT_EXISTS, []);
      }

      // eslint-disable-next-line max-len
      const checkValidity = await AdminModel.validateCredentials(reqBody, getUserData); // Check Credentials Validity
      if (!checkValidity.status) {
        return jsonFormat(res, constants.SERVER_ERROR_CODE, checkValidity.message, []);
      }
      return jsonFormat(res, constants.SUCCESS_CODE, checkValidity.message, AdminModel.generateToken(checkValidity.data));
    } catch (err) {
      console.log('err', err);
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.SERVER_ERROR, []);
    }
  }

  /* Approve Video */
  // eslint-disable-next-line class-methods-use-this
  async updateVideoStatus(req, res) {
    try {
      if (!req.session.is_admin) {
        return jsonFormat(res, constants.FORBIDDEN_CODE, constants.UNAUTHORIZED_ACCESS, []);
      }
      const reqBody = req.body;
      const validator = new Validator(reqBody, {
        video_id: 'required',
        is_approved: 'required|integer|in:1,0',
      });

      const matched = await validator.check();
      if (!matched) {
        for (const key in validator.errors) {
          return jsonFormat(res, constants.BAD_REQUEST_CODE, validator.errors[key].message, []);
        }
      }

      const filter = {
        id: reqBody.video_id,
      };
      const updateData = await VideoModel.update(filter, { is_approved: reqBody.is_approved });
      if (updateData) {
        return jsonFormat(
          res,
          constants.SUCCESS_CODE,
          (reqBody.is_approved ? constants.VIDEO_APPROVED : constants.VIDEO_DECLINED),
          [],
        );
      }
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.VIDEO_NOT_UPDATED, []);
    } catch (err) {
      console.log('err', err);
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.SERVER_ERROR, []);
    }
  }
}

module.exports = new AdminContoller();
