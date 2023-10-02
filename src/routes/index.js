const { Router } = require('express');

const usersRoutes = require('./users.routes');
const dishesRoutes = require('./dishes.routes');
const sessionsRoutes = require('./sessions.routes');
const ordersRoutes = require('./orders.routes');

const routes = Router();

routes.use('/users', usersRoutes);
routes.use('/sessions', sessionsRoutes);
routes.use('/dishes', dishesRoutes);
routes.use('/orders', ordersRoutes);

module.exports = routes;
