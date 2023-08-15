const { Router } = require('express')
const multer = require('multer')
const uploadConfig = require('../configs/upload')

const DishesController = require('../controllers/DishesController')
const ensureAuthenticated = require('../middlewares/ensureAuthenticated')

const dishesRoutes = Router()

const dishesController = new DishesController()

const upload = multer(uploadConfig.MULTER)

dishesRoutes.post(
  '/',
  ensureAuthenticated,
  upload.single('image'),
  dishesController.create
)
dishesRoutes.put('/:id', dishesController.update)
dishesRoutes.delete('/:id', dishesController.delete)
dishesRoutes.get('/:id', dishesController.show)
dishesRoutes.get('/', dishesController.index)

module.exports = dishesRoutes
