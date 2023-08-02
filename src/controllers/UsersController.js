const bcrypt = require('bcryptjs')
const AppError = require('../utils/AppError')

const sqlConnection = require('../database/sqlite')

class UsersController {
  async create(request, response) {
    const { name, email, password, isAdmin } = request.body

    if (!name || !email || !password) {
      throw new AppError('Prencha todos os campos')
    }

    const database = await sqlConnection()

    const checkUserExist = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    if (checkUserExist) {
      throw new AppError('Este email já está em uso')
    }

    const hashedPassword = await bcrypt.hash(password, 8)

    await database.run(
      'INSERT INTO users (name, email, password, isAdmin) VALUES (?,?,?,?)',
      [name, email, hashedPassword, isAdmin]
    )

    return response.status(201).json('Usuário cadastrado com sucesso')
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body
    const user_id = request.user.id

    const database = await sqliteConnection()

    const user = await database.get('SELECT * FROM users WHERE id = (?)', [
      user_id
    ])

    if (!user) {
      throw new AppError('Usuário não existe')
    }

    const userWithUpdateEmail = await database.get(
      'SELECT * FROM users WHERE email = (?)',
      [email]
    )

    if (userWithUpdateEmail && userWithUpdateEmail.id !== user.id) {
      throw new AppError('Este email já está em uso')
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if (password && !old_password) {
      throw new AppError('Por favor, insira a senha antiga')
    }

    if (password && oldPassword) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new AppError('A senha antiga não confere')
      }

      const checkEqualPassword = await compare(password, user.password)

      if (checkEqualPassword) {
        throw new AppError('A nova senha não pode ser igual a senha atual')
      }

      user.password = await hash(password, 8)
    }

    await database.run(
      `UPDATE users SET name = ?, email = ?, password = ?, updated_at = DATETIME ('now')  WHERE id = ?`,
      [user.name, user.email, user.password, user_id]
    )

    return response
      .status(200)
      .json({ message: 'Dados atualizados com sucesso' })
  }
}

module.exports = UsersController
