'use strict'
const { addDays, isAfter } = require('date-fns')
const crypto = require('crypto')
const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store({ request, response }) {
    try {
      const email = request.input('email')
      const user = await User.findByOrFail('email', email)
      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()
      await user.save()
      await Mail.send(
        ['emails.forgot_password'],
        {
          email,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`,
        },
        (message) => {
          message
            .to(user.email)
            .from('abiliocoelho@gmail.com', 'Abílio Coelho')
            .subject('Recuperação de senha')
        }
      )
    } catch (error) {
      return response
        .status(error.status)
        .send({ error: { message: 'user not found' } })
    }
  }
  async update({ request, response }) {
    try {
      const { token, password } = request.all()
      const user = await User.findByOrFail('token', token)
      if (isAfter(new Date(), addDays(user.token_created_at, 2))) {
        return response
          .status(401)
          .send({ error: { message: 'token expired' } })
      }
      user.token = null
      user.token_created_at = null
      user.password = password
      await user.save()
    } catch (error) {
      return response
        .status(error.status)
        .send({ error: { message: 'user not found' } })
    }
  }
}

module.exports = ForgotPasswordController
