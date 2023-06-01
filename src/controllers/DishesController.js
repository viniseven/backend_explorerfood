const knex = require('../database/knex')

class DishesController {
  async create(request, response){
    const { user_id } = request.params
    const { name, category, ingredients, price, description } = request.body

    const [dishe_id] = await knex('dishes').insert({ user_id, name, category, price, description})

    const ingredientsInsert = ingredients.map(ingredient => {
      return {
        name: ingredient,
        dishe_id
      }
    })

    await knex('ingredients').insert(ingredientsInsert)

    return response.json('Prato cadastrado com sucesso')
  }
}

module.exports = DishesController