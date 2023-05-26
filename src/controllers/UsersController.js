const bcrypt = require('bcryptjs')
const AppError = require('../utils/AppError');

const sqlConnection = require('../database/sqlite')

class UsersController {
  async create(request, response) {
    const { name, email, password, isAdmin } = request.body;
    
    if(!name || !email || !password){
      throw new AppError('Prencha todos os campos')
    }

    const database = await sqlConnection();

    const checkUserExist = await database.get('SELECT * FROM users WHERE email = (?)', [email])

    if(checkUserExist){
      throw new AppError('Este email já está em uso')
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    await database.run('INSERT INTO users (name, email, password, isAdmin) VALUES (?,?,?,?)',[name, email, hashedPassword, isAdmin])
 
    return response.status(201).json('Usuário cadastrado com sucesso')
  }
}

module.exports = UsersController
