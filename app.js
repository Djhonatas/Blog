//Carregando módulos
  const express = require('express')
  const handlebars = require('express-handlebars')
  const bodyParser = require('body-parser')
  const app = express()
  const admin = require('./routes/admin')
  const path = require('path')
  const mongoose = require('mongoose')
  const session = require ('express-session')
  const flash = require ('connect-flash')

//Configurações
  //Sessão
    app.use(session({
      secret: "cursonode",
      resave: true,
      saveUninitialized: true
    }))
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
    res.send ('Rota principal')
  })

  app.get('/post', (req, res) =>{
    res.send('Lista posts')
  })

  app.use('/admin', admin)

//Outros
  const PORT = 8089
  app.listen(PORT, () =>{
    console.log("Servidor rodando!")
  })