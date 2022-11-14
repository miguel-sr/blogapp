const localStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

module.exports = function(passport) {
  passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
    Usuario.findOne({email: email}).lean().then((usuario) => {
      if (!usuario) {
        return done(null, false, {message: 'Esta conta não existe'})
      }

      bcrypt.compare(senha, usuario.senha, (err, batem) => {
        if (batem) {
          return done(null, usuario)
        } else {
          return done(null, false, {message: 'Senha incorreta'})
        }
      })
    })
  }))

  // Salvar os dados em uma seção
  passport.serializeUser((usuario, done) => {
    done(null, usuario)
  })
  
  // Salvar os dados em uma seção
  passport.deserializeUser((id, done) => {
    Usuario.findById(id, (err, usuario) => {
      done(err, usuario)
    })
  })
}