const knex = require('../database/knex');

class OrdersController {
  async create(request, response) {
    const user_id = request.user.id;
    const data = request.body;

    console.log(data);
  }
}

module.exports = OrdersController;
