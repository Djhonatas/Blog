const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const { type } = require('os')
require ('../models/Categoria')
const Categoria = mongoose.model('categorias')

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

router.get('/teste', (req, res) =>{
  res.send('Teste')
})




module.exports = router