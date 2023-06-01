
exports.up = knex => knex.schema.createTable('dishes', table => {
  table.increments('id')
  table.integer('user_id').references('id').inTable('users').onDelete('CASCADE')
  table.text('name')
  table.text('img_dishe')
  table.text('category')
  table.float('price')
  table.text('description')
  table.timestamp('created_at').default(knex.fn.now())
  table.timestamp('updated_at').default(knex.fn.now())
});
  
exports.down = knex => knex.schema.dropTable('dishes', table => {

});
  
