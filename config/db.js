if (process.env.node_env == 'production'){
  module.exports ={mongoURI: 'mongodb+srv://bordados:bordados@cluster0.9n0hn96.mongodb.net/test'}
}else{
  module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}