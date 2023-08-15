const knex = require('../database/knex')
const AppError = require('../utils/AppError')
const DiskStorage = require('../providers/DiskStorage')

class DishesController {
  async create(request, response) {
    const user_id = request.user.id
    const { name, category, price, description, ingredients } = request.body

    console.log(name)

    const disheImage = request.file.filename

    const diskStorage = new DiskStorage()

    const filename = await diskStorage.saveFile(disheImage)

    const [dishe_id] = await knex('dishes').insert({
      user_id,
      name,
      img_dishe: filename,
      category,
      price,
      description
    })

    const ingredientsInsert = ingredients.map((ingredient) => {
      return {
        ingredient,
        dishe_id
      }
    })

    await knex('ingredients').insert(ingredientsInsert)

    return response.json('Prato cadastrado com sucesso')
  }

  async update(request, response) {
    const { id } = request.params
    const { name, category, ingredients, price, description } = request.body

    const dishe = await knex('dishes').where({ id }).first()

    if (!dishe) {
      throw new AppError('Este prato não existe')
    }

    dishe.name = name ?? dishe.name
    dishe.category = category ?? dishe.category
    dishe.price = price ?? dishe.price
    dishe.description = description ?? dishe.description

    await knex('dishes').where({ id }).update({
      name: dishe.name,
      category: dishe.category,
      price: dishe.price,
      description: dishe.description
    })

    const ingredientsUpdate = ingredients.map((ingredient) => {
      return {
        ingredient
      }
    })

    await knex('ingredients')
      .where({ dishe_id: id })
      .update({ ingredient: ingredientsUpdate })

    return response.json('Prato atualizado com sucesso')
  }

  async delete(request, response) {
    const { id } = request.params

    await knex('dishes').where({ id }).del()

    return response.json('Prato excluído com sucesso')
  }

  async show(request, response) {
    const { id } = request.params

    const dishe = await knex('dishes').where({ id })

    const ingredients = await knex('ingredients').where({ dishe_id: id })

    return response.json({
      ...dishe,
      ingredients
    })
  }

  async index(request, response) {
    const { name, ingredients } = request.query

    let dishes

    if (ingredients) {
      const filterIngredients = ingredients.split(',').map((tag) => tag.trim())

      dishes = await knex('ingredients')
        .select([
          'dishes.id',
          'dishes.name',
          'dishes.category',
          'dishes.price',
          'dishes.description'
        ])
        .whereLike('ingredient', `%${filterIngredients}%`)
        .innerJoin('dishes', 'dishes.id', 'ingredients.dishe_id')
        .orderBy('name')
    } else {
      dishes = await knex('dishes').whereLike('name', `%${name}%`)
    }

    const userIngredients = await knex('ingredients')
    const disheWithIngredients = dishes.map((dishe) => {
      const disheFromIngredients = userIngredients.filter(
        (ingredient) => ingredient.dishe_id == dishe.id
      )

      return {
        ...dishe,
        ingredients: disheFromIngredients
      }
    })

    return response.json(disheWithIngredients)
  }
}

module.exports = DishesController
