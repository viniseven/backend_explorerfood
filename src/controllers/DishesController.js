const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const DiskStorage = require('../providers/DiskStorage');

class DishesController {
  async create(request, response) {
    const user_id = request.user.id;
    const data = request.body.data;

    const { name, category, price, description, ingredients } =
      JSON.parse(data);

    let priceProduct = parseFloat(price);

    const img = request.file.filename;

    const existNameDishe = await knex('dishes').where({ name }).first();

    if (existNameDishe) {
      throw new AppError('Já existe um prato cadastrado com esse nome');
    }

    const diskStorage = new DiskStorage();

    const filename = await diskStorage.saveFile(img);

    const [dishe_id] = await knex('dishes').insert({
      user_id,
      name,
      img_dishe: filename,
      category,
      price: priceProduct,
      description
    });

    const ingredientsInsert = ingredients.map((ingredient) => {
      return {
        ingredient,
        dishe_id
      };
    });

    await knex('ingredients').insert(ingredientsInsert);

    return response.json('Prato cadastrado com sucesso');
  }

  async update(request, response) {
    const { id } = request.params;
    const data = request.body.data;
    const { name, category, price, description, ingredients } =
      JSON.parse(data);

    const img = request.file.filename;

    const diskStorage = new DiskStorage();

    const dishe = await knex('dishes').where({ id }).first();

    if (!dishe) {
      throw new AppError('Este prato não existe');
    }

    if (dishe.img_dishe) {
      await diskStorage.deleteFile(dishe.img_dishe);
    }

    const filename = await diskStorage.saveFile(img);

    dishe.name = name ?? dishe.name;
    dishe.img_dishe = filename ?? dishe.img_dishe;
    dishe.category = category ?? dishe.category;
    dishe.price = price ?? dishe.price;
    dishe.description = description ?? dishe.description;

    await knex('dishes').where({ id }).update({
      name: dishe.name,
      img_dishe: dishe.img_dishe,
      category: dishe.category,
      price: dishe.price,
      description: dishe.description
    });

    if (ingredients) {
      const ingredientsUpdate = ingredients.map((ingredient) => {
        return {
          ingredient,
          dishe_id: id
        };
      });

      await knex('ingredients').where({ dishe_id: id }).delete();

      await knex('ingredients').insert(ingredientsUpdate);
    }

    return response.json('Prato atualizado com sucesso');
  }

  async delete(request, response) {
    const { id } = request.params;

    await knex('dishes').where({ id }).del();

    return response.json('Prato excluído com sucesso');
  }

  async show(request, response) {
    const { id } = request.params;

    const dishe = await knex('dishes').where({ id }).first();

    const ingredients = await knex('ingredients').where({ dishe_id: id });

    return response.json({ ...dishe, ingredients });
  }

  async index(request, response) {
    const { name, ingredient } = request.query;

    let dishes;

    if (ingredient) {
      const filterIngredients = ingredient.split(',').map((tag) => tag.trim());

      dishes = await knex('ingredients')
        .select([
          'dishes.id',
          'dishes.name',
          'dishes.img_dishe',
          'dishes.category',
          'dishes.price',
          'dishes.description'
        ])
        .whereLike('ingredient', `%${filterIngredients}%`)
        .innerJoin('dishes', 'dishes.id', 'ingredients.dishe_id')
        .orderBy('name');
    } else {
      dishes = await knex('dishes').whereLike('name', `%${name}%`);
    }

    const userIngredients = await knex('ingredients');
    const disheWithIngredients = dishes.map((dishe) => {
      const disheFromIngredients = userIngredients.filter(
        (ingredient) => ingredient.dishe_id == dishe.id
      );

      return {
        ...dishe,
        ingredients: disheFromIngredients
      };
    });
    return response.json(disheWithIngredients);
  }
}

module.exports = DishesController;
