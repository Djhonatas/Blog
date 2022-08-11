const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require ('../models/Categoria')
const Categoria = mongoose.model('categorias')
require ('../models/Postagem')
const Postagem = mongoose.model('postagens')


router.get('/', (req, res) =>{
  res.render("admin/index")
})

router.get('/posts', (req, res) =>{
  res.send("Página de posts")
})

router.get('/categorias', (req, res) =>{
  Categoria.find().lean().sort({date: 'desc'}).then((categorias)=>{
    res.render('admin/categorias', {categorias: categorias})
  }).catch((err) =>{
    req.flash('error_msg', 'Houve um erro ao listar as categorias')
    res.redirect('/admin')
  })
})

router.get('/categorias/add', (req, res) =>{
  res.render('admin/addcategorias')
})

router.post('/categorias/nova', (req, res) =>{
  
  var erros =[]

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({text:'Nome inválido'})
  }

  if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({text: "slug Inválido"})
  }

  if (req.body.nome.length < 4){
     erros.push({text: "Digite um nome com pelo menos 5 caracteres"})
  }

  if(erros.length > 0){
    res.render("admin/addcategorias", {erros: erros})
  }else{
      const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    }  
    new Categoria(novaCategoria).save().then(()=>{
      req.flash('success_msg', "Categoria criada com sucesso!")
      res.redirect('/admin/categorias')
    }).catch((err)=>{
      req.flash("error_msg", "Houve um erro ao salvar a categoria. Tente novamente!")
      res.redirect('/admin')
    })
  }
})

router.get('/categorias/edit/:id', (req, res)=>{
  Categoria.findOne({_id:req.params.id}).lean().then((categoria) =>{
    res.render('admin/editcategorias', {categoria: categoria})
  }).catch((err) =>{
    req.flash('error_msg', 'Esta categoria não existe')
    res.redirect('/admin/categorias')
  })
})

router.post('/categorias/edit', (req, res) =>{

  Categoria.findOne({_id: req.body.id}).then((categoria) =>{

    categoria.nome = req.body.nome
    categoria.slug = req.body.slug

    categoria.save().then(() =>{
      req.flash('success_msg', 'Categoria editada com sucesso')
      res.redirect('/admin/categorias')
    })

  }).catch((err) =>{
    req.flash('error-msg', 'Houve um erro ao editar a categoria')
    res.redirect('/admin/categorias')
  }).catch((err) =>{
    req.flash('error_msg', 'Huve um erro ao tentar salvar a categoria')
    res.redirect('/admin/categorias')

  })
})

router.post('/categorias/deletar', (req, res) =>{
  Categoria.remove({_id: req.body.id}).then(()=>{
    req.flash('success_msg', 'Categoria deletada com sucesso')
    res.redirect('/admin/categorias')
  }).catch((err)=>{
    req.flash('error_msg', 'Houve um erro ao deletar a categoria')
    res.redirect('/admin/categorias')
  })
})

router.get('/postagens', (req, res) => {
    
  Postagem.find().lean().populate('categoria').sort({data: 'desc'}).then((postagens) => {
      res.render('admin/postagens', {postagens: postagens})
  }).catch( (err) => {
      req.flash('error_msg', 'Erro ao listar os posts')
      res.render('/admin')
  })
})

router.get('/postagens/add', (req, res)=>{
  Categoria.find().lean().then((categorias)=>{
    res.render('admin/addpostagem', {categorias: categorias})
  }).catch((err)=>{
    req.flash('error_msg', 'Houve um erro ao listar postagens')
    res.redirect('/admin')
})
})

router.post('/postagens/nova', (req, res)=>{

  var erros =[]
  if(req.body.categoria == '0'){
    erros.push({texto: 'categoria inválida, registre uma categoria!'})
  }

  if(erros.length > 0){
    res.render("admin/addpostagem", {erros: erros})
    console.log(erros)
  }else{
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    }

    new Postagem(novaPostagem).save().then(()=>{
      req.flash('success_msg', 'postagem criada com sucesso')
      res.redirect('/admin/postagens')
    }).catch((err)=>{      
      req.flash('error_msg', 'Houve um erro durante o salvamento da postagem')
      res.redirect('/admin/postagens')
    })
  }
})

router.get('/postagens/edit/:id', (req, res)=>{

//   Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
    
//     Categoria.find().lean().then((categorias) =>{
//       res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
//     }).catch((err)=>{
//       req.flash('error_msg','Houve um erro ao listar as categorias')
//       res.render('/admin/postagens')
//     })

//   }).catch((err)=>{
//     req.flash('error_msg', 'Houve um erro ao carregar o formulário de edição')
//     res.render('/admin/postagens')
//   })
// })
Postagem.findOne({_id: req.params.id}).populate("categoria").then((postagem) => {
  Categoria.find({_id: {$ne: postagem.categoria._id}}).lean().sort({nome: 'asc'}).then((categorias) => {
      res.render('admin/editpostagens', {postagem: postagem.toJSON(), categorias: categorias})
  })
}).catch((err)=>{
  req.flash("error_msg", "Houve um erro ao editar a categoria!")
  res.redirect("/admin/postagens")
})

router.post('/postagens/edit', (req, res)=>{
  Postagem.findOne({_id: req.body.id}).then((postagem)=>{
    
    postagem.titulo = req.body.titulo
    postagem.slug = req.body.slug
    postagem.descricao = req.body.descricao
    postagem.conteudo = req.body.conteudo
    postagem.categoria = req.body.categoria

    postagem.save().then(()=>{
      req.flash('success_msg', 'Postagem editada com sucesso!')
      res.redirect('/admin/postagens')
    }).catch((err)=>{
      req.flash('error_msg', 'Erro interno')
      res.redirect('/admin/postagens')
    })

  }).catch((err)=>{
    console.log(err)
    req.flash('error_msg', 'Houve um erro ao salvar a edição')
    res.redirect('/admin/postagens')
  })
})
})

router.get('/postagens/deletar/:id', (req,res) =>{
  Postagem.remove({_id: req.params.id}).then(()=>{
    req.flash('success_msg', 'Postagem deletada com sucesso!')
    res.redirect('/admin/postagens')
  }).catch((error)=>{
    req.flash('error_msg', 'Houve um erro interno')
    res.redirect('/admin/postagens')
  })
})

module.exports = router