const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')

router.get('/', eAdmin, (req, res) => {
  res.render('admin/index')
})


// Rotas de Categorias
router.get('/categorias', eAdmin, (req, res) => {
  // lista as categorias existentes
  Categoria.find().lean().sort({date: 'desc'}).then((categorias) => {
    res.render('admin/categorias', {categorias: categorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias: " + err)
    res.redirect('/admin')
  })
})

router.get('/categorias/add', eAdmin, (req, res) => {
  res.render('admin/addcategorias')
})

router.post('/categorias/nova', eAdmin, (req, res) => {
  var erros = []

  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({texto: "Nome inválido"})
  }

  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({texto: "Slug inválido"})
  }

  if (erros.length > 0) {
    res.render('admin/addcategorias', {erros: erros})
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }
  
    new Categoria(novaCategoria).save().then(() => {
      req.flash("success_msg", "Categoria criada com sucesso")
      res.redirect('/admin/categorias')
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente! " + err)
      res.redirect('/admin/categorias')
    })
  }
})

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
  Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
    res.render('admin/editcategorias', {categoria: categoria})
  }).catch((err) => {
    req.flash('error_msg', 'Esta categoria não existe: ' + err)
    res.redirect('/admin/categorias')
  })
})

router.post('/categorias/edit', eAdmin, (req, res) => {
  var erros = []

  if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
    erros.push({texto: "Nome inválido"})
  }

  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({texto: "Slug inválido"})
  }

  if (erros.length > 0) {
    res.render('/admin/editcategorias', {erros: erros})
  } else {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
      categoria.nome = req.body.nome
      categoria.slug = req.body.slug
      
      categoria.save().then(() => {
        req.flash('success_msg', "Categoria editada com sucesso!")
        res.redirect('/admin/categorias')
      }).catch((err) => {
        req.flash('error_msg', 'Erro interno ao salvar edição: ' + err)
        res.redirect('/admin/categorias')
      })
    }).catch((err) => {
      req.flash('error_msg', 'Erro ao editar categoria: ' + err)
      res.redirect('/admin/categorias')
    })
  }
})

router.post('/categorias/deletar', eAdmin, (req, res) => {
  Categoria.deleteOne({_id: req.body.id}).then(() => {
    req.flash('success_msg', 'Categoria deletada com sucesso!')
    res.redirect('/admin/categorias')
  }).catch((err) => {
    req.flash('error_msg', 'Erro ao deletar categoria: ' + err)
    res.redirect('/admin/categorias')
  })
})


// Rotas de Postagens
router.get('/postagens', eAdmin, (req, res) => {
  Postagem.find().lean().sort({date: 'desc'}).populate({path: 'categoria', strictPopulate: false}).then((postagens) => {
    res.render('admin/postagens', {postagens: postagens})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as postagens: " + err)
    res.redirect('/admin')
  })
})

router.get('/postagens/add', eAdmin, (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render('admin/addpostagem', {categorias: categorias})
  }).catch((err) => {
    req.flash('error_msg', 'Erro ao carregar formulário: ' + err)
    res.redirect('/admin')
  })
})

router.post('/postagens/nova', eAdmin, (req, res) => {
  var erros = []

  if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
    erros.push({texto: "Título inválido"})
  }

  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({texto: "Slug inválido"})
  }

  if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
    erros.push({texto: "Descrição inválida"})
  }

  if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
    erros.push({texto: "Conteúdo inválido"})
  }

  if (req.body.categoria == '0') {
    erros.push({texto: "Categoria inválida, registre uma categoria"})
  }

  if (erros.length > 0) {
    res.render('admin/addpostagem', {erros: erros})
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria
    }
  
    new Postagem(novaPostagem).save().then(() => {
      req.flash("success_msg", "Postagem criada com sucesso")
      res.redirect('/admin/postagens')
    }).catch((err) => {
      req.flash('error_msg', 'Erro ao carregar formulário: ' + err)
      res.redirect('/admin/postagens')
    })
  }
})

router.get('/postagens/edit/:id', eAdmin, (req, res) => {
  Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
    Categoria.find().lean().then((categorias) => {
      res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
    }).catch((err) => {
      req.flash('error_msg', 'Erro ao listar categorias: ' + err)
      res.redirect('/admin/postagens')
    })
  }).catch((err) => {
    req.flash('error_msg', 'Esta postagem não existe: ' + err)
    res.redirect('/admin/postagens')
  })
})

router.post('/postagem/edit', eAdmin, (req, res) => {
  var erros = []

  if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
    erros.push({texto: "Título inválido"})
  }

  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({texto: "Slug inválido"})
  }

  if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
    erros.push({texto: "Descrição inválida"})
  }

  if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
    erros.push({texto: "Conteúdo inválido"})
  }

  if (req.body.categoria == '0') {
    erros.push({texto: "Categoria inválida, registre uma categoria"})
  }

  if (erros.length > 0) {
    res.render('admin/addpostagem', {erros: erros})
  } else {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
      postagem.titulo = req.body.titulo,
      postagem.slug = req.body.slug,
      postagem.descricao = req.body.descricao,
      postagem.conteudo = req.body.conteudo,
      postagem.categoria = req.body.categoria
    
      postagem.save().then(() => {
        req.flash('success_msg', "Postagem editada com sucesso!")
        res.redirect('/admin/postagens')
      }).catch((err) => {
        req.flash('error_msg', 'Erro interno ao salvar edição: ' + err)
        res.redirect('/admin/postagens')
      })
    }).catch((err) => {
      req.flash('error_msg', 'Erro ao editar postagem: ' + err)
      res.redirect('/admin/postagens')
    })
  }
})

router.post('/postagens/deletar', eAdmin, (req, res) => {
  Postagem.deleteOne({_id: req.body.id}).then(() => {
    req.flash('success_msg', 'Postagem deletada com sucesso!')
    res.redirect('/admin/postagens')
  }).catch((err) => {
    req.flash('error_msg', 'Erro ao deletar postagem: ' + err)
    res.redirect('/admin/postagens')
  })
})

module.exports = router