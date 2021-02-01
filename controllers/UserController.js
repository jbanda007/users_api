/* eslint-disable no-restricted-syntax */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-len */
/* eslint-disable guard-for-in */
const { Validator } = require('node-input-validator');
const { jsonFormat } = require('../config/helpers');
const constants = require('../config/constants');
const UsersModel = require('../models/UserModel');
const OrganizationModel = require('../models/OrganizationModel');

class UserContoller {
  /* Create API */
  // eslint-disable-next-line class-methods-use-this
  async create(req, res) {
    try {
      const reqBody = req.body;
      const validator = new Validator(reqBody, {
        email: 'required|email',
        firstname: 'required',
        lastname: 'required',
        organization_id: 'required|integer',
      });
      const matched = await validator.check();
      if (!matched) {
        // eslint-disable-next-line no-restricted-syntax
        for (const key in validator.errors) {
          return jsonFormat(res, constants.BAD_REQUEST_CODE, validator.errors[key].message, []);
        }
      }

      const orginizationExists = await OrganizationModel.getSingleData({id:reqBody.organization_id});      
      if(!orginizationExists){
        return jsonFormat(res, constants.BAD_REQUEST_CODE, constants.ORGANIZATION_NOT_EXISTS, []);
      }

      const filterData = {
        email: (reqBody.email).toLowerCase(),
      };
      const getUserData = await UsersModel.getUserdata(filterData);

      if (getUserData) {
        return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.ACCOUNT_ALREADY_REGISTERED, []);
      }
      const newData = {
        email: reqBody.email,
        firstname: reqBody.firstname,
        lastname: reqBody.lastname,
        organization_id: reqBody.organization_id,
      };
      const userResult = await UsersModel
        .query()
        .withGraphFetched('organization')
        .insert(newData);

      return jsonFormat(res, constants.SUCCESS_CODE, constants.USER_CREATED, userResult);
    } catch (err) {
      console.log('err', err);
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.SERVER_ERROR, []);
    }
  }  

  /* Update User */
  // eslint-disable-next-line class-methods-use-this
  async update(req, res) {
    try {
      const reqBody = req.body;
      const validator = new Validator(reqBody, {
        firstname: 'required',
        lastname: 'required',
        organization_id: 'required|integer',
      });

      const matched = await validator.check();
      if (!matched) {
        for (const key in validator.errors) {
          return jsonFormat(res, constants.BAD_REQUEST_CODE, validator.errors[key].message, []);
        }
      }

      const filterData = {
        id: req.params.user_id,
      };
      const getUserData = await UsersModel.getUserdata(filterData);
      if (!getUserData) {
        return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.ACCOUNT_NOT_EXISTS, []);
      }

      const orginizationExists = await OrganizationModel.getSingleData({id:reqBody.organization_id});      
      if(!orginizationExists){
        return jsonFormat(res, constants.BAD_REQUEST_CODE, constants.ORGANIZATION_NOT_EXISTS, []);
      }

      const filter = {
        id: req.params.user_id,
      };
      const data = {
        firstname: reqBody.firstname,
        lastname: reqBody.lastname,
        organization_id: reqBody.organization_id,
      };
      const updateData = await UsersModel.update(filter, data);      
      if (updateData) {
        return jsonFormat(
          res,
          constants.SUCCESS_CODE,
          constants.USER_UPDATED,
          updateData,
        );
      }
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.USER_NOT_UPDATED, []);
    } catch (err) {
      console.log('err', err);
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.SERVER_ERROR, []);
    }
  }

  /* Delete User */
  // eslint-disable-next-line class-methods-use-this
  async delete(req, res) {
    try {
      const userId = req.params.user_id;
     
      const filterData = {
        id: userId,
      };
      const getUserData = await UsersModel.getUserdata(filterData);
      if (!getUserData) {
        return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.ACCOUNT_NOT_EXISTS, []);
      }

      const deleteData = await UsersModel.delete(userId);      
      console.log('deleteData',deleteData);
      if (deleteData) {
        return jsonFormat(
          res,
          constants.SUCCESS_CODE,
          constants.USER_DELETED,
          [],
        );
      }
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.USER_NOT_DELETED, []);
    } catch (err) {
      console.log('err', err);
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.SERVER_ERROR, []);
    }
  }

  /* Get User Listing */
  // eslint-disable-next-line class-methods-use-this
  async list(req, res) {
    try {
      const pageNumber = (req.body.pageNumber) ? (req.body.pageNumber) : (1);
      const limit = (req.body.limit) ? (req.body.limit) : (constants.LIMIT_PER_PAGE);
      const sorting = {
        sortCol: ( req.body.sortCol ? req.body.sortCol : 'created_at'),
        sortVal: ( req.body.sortVal ? req.body.sortVal : 'DESC')
      } 
      const searchText = req.body.searchText;
      const filter = {
        pageNumber,
        limit,
        sorting,
        searchText,
      };
      const fetchData = await UsersModel.list(filter);      
      console.log('fetchData',fetchData);
      if (fetchData) {
        return jsonFormat(
          res,
          constants.SUCCESS_CODE,
          constants.USER_LIST_SUCCESS,
          fetchData,
        );
      }
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.USER_LIST_SUCCESS, []);
    } catch (err) {
      console.log('err', err);
      return jsonFormat(res, constants.SERVER_ERROR_CODE, constants.SERVER_ERROR, []);
    }
  }
}

module.exports = new UserContoller();
