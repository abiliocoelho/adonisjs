'use strict'
const User = use('App/Models/User')
const Database = use('Database')

class UserController {
  async store({ request }) {
    const data = request.only(['username', 'email', 'password'])
    const addresses = request.input('addresses')
    const trx = Database.beginTransaction()
    const user = await User.create(data, trx)
    await user.addresses().createMany(addresses, trx)
    await trx.commit()
    return user
  }
}

module.exports = UserController
