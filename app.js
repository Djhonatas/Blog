//Carregando módulos
  const express = require('express')
  const handlebars = require('express-handlebars')
  const app = express()
  const admin = require('./routes/admin')
  const path = require('path')
  const mongoose = require('mongoose')
  const session = require ('express-session')
  const flash = require ('connect-flash')
  require('./models/Postagem')
  const Postagem = mongoose.model('postagens')
  require ('./models/Categoria')
  const Categoria = mongoose.model('categorias')
  const usuarios = require('./routes/usuario')
  const passport = require('passport')
  require('./config/auth')(passport)

//Configurações
  //Sessão
    app.use(session({
     
      secret: "cursonode",
      resave: true,
      saveUninitialized: true
    }))

    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

  //Middleware
    app.use((req, res, next)=>{
    
      res.locals.success_msg = req.flash("success_msg")
      res.locals.error_msg = req.flash("error_msg")
      next()
    })

  //Body Parser
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    app.set('views', path.join(__dirname, 'view'))
  
  //Body Parser
    app.use(express.urlencoded({extended:true}))
    app.use(express.json())

//Mongoose

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/blogapp",{
 
  useNewUrlParser: true, 
  useUnifiedTopology: true
}).then(() =>{
  
  console.log("Conectado com sucesso!")

}).catch((err) =>{
  
  console.log("Houve um erro ao se conectar " +err)
})

//Public

  app.use(express.static('public'));

//Rotas
  app.get('/', (req, res) =>{
    
    Postagem.find().lean().populate('categoria').sort({data:'desc'}).then((postagens) =>{
      res.render ('index', {postagens: postagens})
    }).catch((err)=>{
      req.flash('error_msg', 'Houve um erro interno')
      res.redirect('/404')
    })
    
  })

  app.get('/postagem/:slug', (req,res) => {
    
    const slug = req.params.slug
      
    Postagem.findOne({slug}).then(postagem => {
        
        if(postagem){
          const post = {
            titulo: postagem.titulo,
            data: postagem.data,
            conteudo: postagem.conteudo
          }
            res.render('postagem/index', post)
            
          }else{
                req.flash("error_msg", "Essa postagem nao existe")
                res.redirect("/")
            }
      })
        .catch(err => {
          req.flash("error_msg", "Houve um erro interno")
          res.redirect("/")
        })
})

  app.get('/categorias', (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
      res.render('categorias/index', {categorias: categorias})
    }).catch((err)=>{
      req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
      res.redirect('/')
    })
  })

app.get('/categorias/:slug', (req, res) =>{
  Categoria.findOne({slug: req.params.slug}).then((categoria)=>{
   
    if(categoria){

      Postagem.find({categoria: categoria._id}).lean().then((postagens)=>{

        res.render('categorias/postagens', {postagens: postagens, categoria: categoria})

      }).catch((err)=>{
        req.flash('error_msg', 'Houve um erro ao listar os posts')
        res.redirect('/')
      })
    
    }else{
      
      req.flash('error_msg', 'Esta categoria não existe')
      res.redirect('/')
    }
  }).catch((err)=>{
    req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria')
    res.redirect('/')
  })
})


  app.get('/404', (req, res)=>{
    res.send('Erro 404!')
  })

  app.use('/admin', admin)
  app.use('/usuarios', usuarios)

//Outros
  const PORT = 8089
  app.listen(PORT, () =>{
    console.log("Servidor rodando!")
  })