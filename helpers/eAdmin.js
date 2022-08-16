module.exports = {
  eAdmin: (req, res, next)=>{
      if(req.isAuthenticated()){
          return next()
      }
      req.flash('erro', 'Usuário não credenciado')
      res.redirect('/login')
  }
}
