"use strict"
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// APIs
var mongoose = require('mongoose');
//MONGO LAB
// mongoose.connect('mongodb://testU:gustavo01@ds043012.mlab.com:43012/bookshop')
//LOCAL DB
mongoose.connect('mongodb://localhost:27017/bookshop');

var db = mongoose.connection;
db.on('error', console.error.bind(console, '# MongoDB - connection error: '));

// --->>> SET UP SESSIONS <<<----
app.use(session({
  secret: 'mySecretString',
  saveUninitialized: false,
  resave:false,
  store: new MongoStore({mongooseConnection: db, ttl: 2 * 24 * 60 * 60})
  //ttl: 2 days * 24 hours * 60 minutes * 60 seconds
}))
  // SAVE SESSION CART API
  app.post('/cart', function(req, res){
    var cart = req.body;
    req.session.cart = cart;
    req.session.save(function(err){
      if(err){
        console.log('# API POST CART SESSION: ', err);
      }
      res.json(req.session.cart);
    })
  });
  // GET SESSION CART API
  app.get('/cart', function(req, res){
    if(typeof req.session.cart !== 'undefined'){
      res.json(req.session.cart);
    }
  });
//--->>> END SESSION SET UP <<<----


var Books = require('./models/books.js');

//---->>> POST BOOKS <<<-----
app.post('/books', function(req, res){
  var book = req.body;
  //console.log('test title', req.body[0].title);
  Books.create(book, function(err, books){
    if(err){
      console.log('# API POST BOOKS: ', err);
    }
    //res.json({books, "title":req.body[0].title});
    res.json(books);
  })
});
// // INPUT VALIDATION
// function handleValidation(input){
//
// }

//----->>>> GET BOOKS <<<---------
app.get('/books', function(req, res){
  Books.find(function(err, books){
    if(err){
      console.log('# API GET BOOKS: ', err);
    }
    res.json(books)
  })
});

//---->>> DELETE BOOKS <<<------
app.delete('/books/:_id', function(req, res){
  var query = {_id: req.params._id};

  Books.remove(query, function(err, books){
    if(err){
      console.log('# API DELETE BOOKS: ', err);
    }
    res.json(books);
  })
});

//---->>> UPDATE BOOKS <<<------
app.put('/books/:_id', function(req, res){
  var book = req.body;
  var query = req.params._id;
  // if the field doesn't exist $set will set a new field
  var update = {
    '$set':{
      title:book.title,
      description:book.description,
      image:book.image,
      price:book.price
    }
  };
    // When true returns the updated document
    var options = {new: true};

    Books.findOneAndUpdate(query, update, options, function(err, books){
      if(err){
        console.log('# API UPDATE BOOKS: ', err);
      }
      res.json(books);
    })
})

// --->>> GET BOOKS IMAGES API <<<------
app.get('/images', function(req, res){

  const imgFolder = __dirname + '/public/images/';
  // REQUIRE FILE SYSTEM
  const fs = require('fs');
  //READ ALL FILES IN THE DIRECTORY
  fs.readdir(imgFolder, function(err, files){
    if(err){
      return console.error(err);
    }
    //CREATE AN EMPTY ARRAY
    const filesArr = [];
    // ITERATE ALL IMAGES IN THE DIRECTORY AND ADD TO THE THE ARRAY
    files.forEach(function(file){
      filesArr.push({name: file});
    });
    // SEND THE JSON RESPONSE WITH THE ARARY
    res.json(filesArr);
  })
})


// END APIs

app.listen(3001, function(err){
  if(err){
    return console.log(err);
  }
  console.log('API Sever is listening on http://localhost:3001');
});
