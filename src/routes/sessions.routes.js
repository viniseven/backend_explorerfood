const { Router } = require('express');

const SessionsController = require('../controllers/SessionsController');
const sessionsControlller = new SessionsController();

const sessionsRoutes = Router();

sessionsRoutes.post('/', sessionsControlller.create);

module.exports = sessionsRoutes;
