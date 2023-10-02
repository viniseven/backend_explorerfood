const { Router } = require('express');

const OrdersController = require('../controllers/OrdersController');
const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const ordersRoutes = Router();

const ordersController = new OrdersController();

ordersRoutes.post('/', ensureAuthenticated, ordersController.create);

module.exports = ordersRoutes;
