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

  async update(request, response) {
    const { id } = request.params
    const { name, email, newPassword, oldPassword } = request.body

    const database = await sqlConnection();

    const user = await database.get('SELECT * FROM users WHERE id = (?)', [id])

    if(!user){
      throw new AppError('Usuário não encontrado')
    }

    const userWithUpdateEmail = await database.get('SELECT * FROM users WHERE email = (?)', [email])

    if(userWithUpdateEmail && userWithUpdateEmail.id !== id){
      throw new AppError('Este email já está em uso')
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if(newPassword && !oldPassword){
      throw new AppError('Por favor, insira a senha antiga')
    }

    if(newPassword && oldPassword){
      const checkOldPassword = await bcrypt.compare(oldPassword, user.password)

      if(!checkOldPassword){
        throw new AppError('A senha antiga não confere')
      }

      const checkEqualsPassword = await bcrypt.compare(newPassword, user.password)

      if(checkEqualsPassword){
        throw new AppError('A senha antiga não pode ser igual a atual')
      }

      user.password = await bcrypt.hash(newPassword, 8)
    }

    await database.run(`UPDATE users SET name = ?, email = ?, password = ?, updated_at = DATETIME("now")
    WHERE id = ?`, [user.name, user.email, user.password, id])

    return response.json('Dados alterados com sucesso')

  }
}

module.exports = UsersController
