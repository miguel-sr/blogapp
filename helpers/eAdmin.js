module.exports = {
  eAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.eAdmin == true) {
      return next()
    }

    req.flash('error_msg', 'Permissões insuficientes!')
    res.redirect('/')
  }
}