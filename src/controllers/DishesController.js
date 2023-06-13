const knex = require('../database/knex')
const AppError = require('../utils/AppError')

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

  async update(request, response){
    const { id } = request.params
    const { name, category, ingredients, price, description } = request.body

    const dishe = await knex('dishes').where({id}).first()

    if(!dishe){
      throw new AppError('Este prato não existe')
    }

    dishe.name = name ?? dishe.name
    dishe.category = category ?? dishe.category
    dishe.ingredients = ingredients ?? dishe.ingredients
    dishe.price = price ?? dishe.price
    dishe.description = description ?? dishe.description

    await knex('dishes')
    .where({ id })
    .update({name: dishe.name, category: dishe.category, price:dishe.price, 
      description: dishe.description})

   const ingredientsUpdate = ingredients.map(ingredient => {
    return {
      name: ingredient
    }
  })

  await knex('ingredients').where({ dishe_id: id }).update({ name: ingredientsUpdate })
    
  return response.json('Prato atualizado com sucesso')

  }

  async delete(request, response){
      const { id } = request.params

      await knex('dishes').where({ id }).del()

      return response.json('Prato excluído com sucesso')
  }

  async show(request, response){
    const { id } = request.params
  }
}

module.exports = DishesController