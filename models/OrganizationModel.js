/* eslint-disable no-dupe-class-members */
const visibilityPlugin = require('objection-visibility').default;
const Model = require('../config/database');

class OrganizationModel extends visibilityPlugin(Model) {
  // Table name is the only required property.
  static get tableName() {
    return 'organizations';
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
      required: ['name', 'description', 'status'],

      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 50 },
        description: { type: 'string' },
        status: { type: 'integer' },
      },
    };
  }

  // Relation Mapping
  static get relationMappings() {
    // eslint-disable-next-line global-require
    const User = require('./UserModel');
    return {
      user: {
        relation: Model.HasManyRelation,
        modelClass: User,
        join: {
          from: 'users.organization_id',
          to: 'organizations.id',
        },
      },
    };
  }

  // Get Organization Data
  static async getSingleData(filter, select = '') {
    if (select !== '') {
      // eslint-disable-next-line no-param-reassign
      select = select;
    } else {
      select = '*';
    }
    const getData = await OrganizationModel
      .query()
      .select(select)
      .where(filter)
      .first();

    return getData;
  }
}

module.exports = OrganizationModel;
