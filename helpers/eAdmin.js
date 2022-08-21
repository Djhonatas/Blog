const mongoose = require('mongoose')
require ('../models/Usuario')
const Usuario = mongoose.model('usuarios')

module.exports = {
  eAdmin: async (req, res, next)=>{
    const user = await Usuario.findById(req.user)
      if(req.isAuthenticated() && user.eAdmin == 1){
          return next()
      }
      req.flash('error_msg', 'Usuário não credenciado')
      res.redirect('/')
  }
}