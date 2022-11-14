// Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const mongoose = require('mongoose')
const session = require('cookie-session')
const flash = require('connect-flash')
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')


// Configurações //

// Sessão
app.use(session({
  secret: 'cursodenode',
  resave: true,
  saveUninitialized: true
}))

// Após a seção, configurar passport
app.use(passport.initialize())
app.use(passport.session())

// Connect flash
app.use(flash())

// Middleware
app.use((req, res, next) => {
  // Variáveis globais
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  // Mensagens do passsport
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  next();
})

// Bodyparser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

// Handlebars
app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars')

// Mongoose

mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Conectado ao banco de dados com sucesso!")
}).catch((err) => {
  console.log("Erro ao se conectar ao banco de dados: " + err)
});

// Public
app.use(express.static(path.join(__dirname, 'public')))

// Rotas
app.get('/', (req, res) => {
  Postagem.find().lean().sort({date: 'desc'}).populate('categoria').then((postagens) => {
    res.render('index', {postagens: postagens})
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro interno: ' + err)
    res.redirect('/404')
  })
})

app.get('/postagem/:slug', (req, res) => {
  Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
    if (postagem) {
      res.render('postagem/index', {postagem: postagem})
    } else {
      req.flash('error_msg', 'Essa postagem não existe')
      res.redirect('/')
    }
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro interno: ' + err)
    res.redirect('/')
  })
}) 

app.get('/categorias', (req, res) => {
  Categoria.find().lean().then((categorias) => {
    res.render('categorias/index', {categorias: categorias})
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro interno ao listar as categorias: ' + err)
    res.redirect('/')
  })
})

app.get('/categorias/:slug', (req, res) => {
  Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
    if (categoria) {
      Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
        res.render('categorias/postagens', {postagens: postagens, categoria: categoria})
      }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens: ' + err)
        res.redirect('/')
      })
    } else {
      req.flash('error_msg', 'Essa categoria não existe')
      res.redirect('/')
    }
  }).catch((err) => {
    req.flash('error_msg', 'Houve um erro ao listar as categorias: ' + err)
    res.redirect('/')
  })
})

app.get('/404', (req, res) => {
  res.send('Erro 404')
})

app.use('/admin', admin)

app.use('/usuarios', usuarios)

// Outros
const port = process.env.port || 8089
app.listen(port, () => {
  console.log('Servidor rodando!')
  // console.log('http://localhost:8089/')
})