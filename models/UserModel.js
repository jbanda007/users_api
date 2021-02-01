/* eslint-disable no-param-reassign */
/* eslint-disable no-self-assign */
/* eslint-disable no-dupe-class-members */
const visibilityPlugin = require('objection-visibility').default;
const Model = require('../config/database');

class UsersModel extends visibilityPlugin(Model) {
  // Table name is the only required property.
  static get tableName() {
    return 'users';
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
      required: ['organization_id', 'firstname', 'lastname', 'email'],

      properties: {
        id: { type: 'integer' },
        organization_id: { type: 'integer' },
        firstname: { type: 'string', minLength: 1, maxLength: 50 },
        lastname: { type: 'string', minLength: 1, maxLength: 50 },
        email: { type: 'string', minLength: 1, maxLength: 100 },
        status: { type: 'integer' },
      },
    };
  }

  // Relation Mapping
  static get relationMappings() {
    // eslint-disable-next-line global-require
    const Organization = require('./OrganizationModel');
    return {
      organization: {
        relation: Model.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'users.organization_id',
          to: 'organizations.id',
        },
      },
    };
  }

  // Get User Data
  static async getUserdata(filter, select = '') {
    if (select !== '') {
      // eslint-disable-next-line no-param-reassign
      select = select;
    } else {
      select = '*';
    }
    const getData = await UsersModel
      .query()
      .withGraphFetched('organization')
      .select(select)
      .where(filter)
      .first();

    return getData;
  }

  // Update data
	static async update( filter, updateData ){
		var getData = await UsersModel			
      .query()
      .withGraphFetched('organization')
			.where(filter)
			.first();

		if( getData != undefined ){
			var data = await getData
      .$query()
      .withGraphFetched('organization')
			.patchAndFetch( updateData );	
			return data;
		}else{
			return 0;
		}		
  }    

  // Delete data
	static async delete( id ){
    console.log('id',id);
    var deleteData = await UsersModel
      .query()
      .deleteById(id);	      
    console.log('deleteData',deleteData);
		if( deleteData != undefined ){
      return 1;
		}else{
			return 0;
		}		
  }    

   // List data
	static async list(filter){
    const {
      pageNumber,
      limit,
      sorting,
      searchText,
    } = filter;
    console.log('parseInt(pageNumber - 1)',parseInt(pageNumber - 1));
    var fetchData = await UsersModel
      .query()
      .select('users.*')
      .withGraphFetched('organization')
      .leftJoin("organizations", "organizations.id", "users.organization_id")
      .where("users.status", "=", 1)
      .andWhere(builder => {
          if (searchText) {
              builder.where("users.email", "LIKE", '%' + searchText + '%')
                  .orWhere("users.firstname", "LIKE", '%' + searchText + '%')
                  .orWhere("users.lastname", "LIKE", '%' + searchText + '%')
                  .orWhere("organizations.name", "LIKE", '%' + searchText + '%')
          }
      })
      .page(parseInt(pageNumber - 1), limit)
      .orderBy(sorting.sortCol, sorting.sortVal);
      
    
    console.log('fetchData',fetchData);
		if( fetchData ){
      return fetchData;
		}else{
			return 0;
		}		
  }  
}

module.exports = UsersModel;
