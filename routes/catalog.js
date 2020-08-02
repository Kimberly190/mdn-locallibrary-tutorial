var express = require('express');
var router = express.Router();

// Require controller modules.
var book_controller = require('../controllers/bookController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
var book_instance_controller = require('../controllers/bookinstanceController');
// const { post } = require('../app');

/// BOOK ROUTES ///

// GET catalog home page
router.get('/', book_controller.index);

// GET request to create a Book.  NOTE this must come before routes that display Book (uses id).
router.get('/book/create', book_controller.book_create_get);

// POST request to create a Book
router.post('/book/create', book_controller.book_create_post);

// GET request to delete a Book
router.get('/book/:id/delete', book_controller.book_delete_get);

// POST request to delete a Book
router.get('/book/:id/delete', book_controller.book_delete_post);

// GET request to update a Book
router.get('/book/:id/update', book_controller.book_update_get);

// POST request to update a Book
router.post('/book/:id/update', book_controller.book_update_post);

// GET request for one Book
router.get('/book/:id', book_controller.book_detail);

// GET request for list of all Books
router.get('/books', book_controller.book_list);

/// AUTHOR ROUTES ///

// GET request to create an Author.  NOTE this must come before routes that display Author (uses id).
router.get('/author/create', author_controller.author_create_get);

// POST request to create an Author
router.post('/author/create', author_controller.author_create_post);

// GET request to delete an Author
router.get('/author/:id/delete', author_controller.author_delete_get);

// POST request to delete an Author
router.post('/author/:id/delete', author_controller.author_delete_post);

// GET request to update an Author
router.get('/author/:id/update', author_controller.author_update_get);

// POST request to update an Author
router.post('/author/:id/update', author_controller.author_update_post);

// GET request for one Author
router.get('/author/:id', author_controller.author_detail);

// GET request for list of all Authors
router.get('/authors', author_controller.author_list);

/// GENRE ROUTES ///

// GET request to create a Genre.  NOTE this must come before routes that display Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

// POST request to create a Genre
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delete a Genre
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete a Genre
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET request to update a Genre
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update a Genre
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET request for one Genre
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genres
router.get('/genres', genre_controller.genre_list);

/// BOOKINSTANCE ROUTES ///

// GET request to create a BookInstance.  NOTE this must come before routes that display BookInstance (uses id).
router.get('/bookinstance/create', book_instance_controller.bookinstance_create_get);

// POST request to create a BookInstance
router.post('/bookinstance/create', book_instance_controller.bookinstance_create_post);

// GET request to delete a BookInstance
router.get('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_get);

// POST request to delete a BookInstance
router.post('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_post);

// GET request to update a BookInstance
router.get('/bookinstance/:id/update', book_instance_controller.bookinstance_update_get);

// POST request to update a BookInstance
router.post('/bookinstance/:id/update', book_instance_controller.bookinstance_update_post);

// GET request for one BookInstance
router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);

// GET request for list of all BookInstances
router.get('/bookinstances', book_instance_controller.bookinstance_list);

module.exports = router;