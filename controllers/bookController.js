var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');
const validator = require('express-validator');

exports.index = function(req, res) {
    async.parallel({
        // Pass an empty object as match condition to find all documents of each collection
        book_count: function(callback) {
            Book.countDocuments({}, callback);
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.countDocuments({status: 'Available'}, callback);
        },
        author_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        }
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all Books.
exports.book_list = function(req, res, next) {
    Book.find({}, 'title author')
        .populate('author')
        .exec(function(err, list_books) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('book_list', { title: 'Book List', book_list: list_books });
        });
};

// Display detail page for a specfiic Book.
exports.book_detail = function(req, res, next) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        book_instances: function(callback) {
            BookInstance.find({ 'book': req.params.id })
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book == null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);    
        }
        // Successful, so render
        res.render('book_detail', { title: results.book.title, book: results.book, book_instances: results.book_instances });
    });
};

// Display Book create form on GET.
exports.book_create_get = function(req, res, next) {
    // Get all authors and genres, which can use for adding to our book.
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });
};

// Handle Book create on POST.
exports.book_create_post = [
    // Convert the genre to an array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre==='undefined') {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },

    // Validate fields
    validator.body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    validator.body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
    validator.body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }),
    validator.body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }),
    validator.body('genre', 'Please select a genre.').trim().isMongoId(),

    // Sanitize fields (using wildcard)
    validator.sanitizeBody('*').escape(),
    //TODO?: sanitizeBody('genre.*').escape(), (is it covered by the above? tutorial implies not)

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validator.validationResult(req);

        // Create a Book object with escaped and trimmed data
        var book = new Book(
            {
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: req.body.genre
            }
        );

        if (!errors.isEmpty()) {
            // There are errors.  Render form again with sanitized values / error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0;  i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
            });
            return;
        } else {
            // Data from form are valid.  Save book.
            book.save(function(err) {
                if (err) { return next(err); }
                // Successful - redirect to new book.
                res.redirect(book.url);
            });
        }
    }
];

// Display Book delete form on GET.
exports.book_delete_get = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id)
                .populate('author')
                .exec(callback);
        },
        book_instances: function(callback) {
            BookInstance.find({ 'book': req.params.id }).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book == null) { // No results, nothing to delete
            res.redirect('/catalog/books');
        }
        // Successful, so render
        res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_instances });
    });
};

// Handle Book delete on POST.
exports.book_delete_post = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.body.bookid).exec(callback);
        },
        book_instances: function(callback) {
            BookInstance.find({ 'book': req.body.bookid }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.book_instances.length > 0) {
            // Book has copies.  Render in same way as for GET route.
            res.render('book_delete', { title: 'Delete Book', book: results.book, book_instances: results.book_instances });
            return;
        }
        // Book has no copies.  Delete object and redirect to the list of books.
        Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
            if (err) { return next(err); }
            // Success - go to book list
            res.redirect('/catalog/books');
        });
    });
};

// Display Book update form on GET.
exports.book_update_get = function(req, res, next) {
    
    // Get book, authors, and genres for form
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book == null) { // No results
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }
        // Success
        // Mark our selected genres as checked
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                if (results.genres[all_g_iter]._id.toString() == results.book.genre[book_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked = 'true';
                }
            }
        }
        res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });
    });
};

// Handle Book update on POST.
exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined') {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },

    // Validate fields
    validator.body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
    validator.body('author', 'Author must not be empty.').trim().isLength({ min: 1 }),
    validator.body('summary', 'Summary must not be empty').trim().isLength({ min: 1 }),
    validator.body('isbn', 'ISBN must not be empty.').trim().isLength({ min: 1 }),

    // Sanitize fields
    validator.sanitizeBody('title').escape(),
    validator.sanitizeBody('author').escape(),
    validator.sanitizeBody('summary').escape(),
    validator.sanitizeBody('isbn').escape(),
    validator.sanitizeBody('genre.*').escape(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validator.validationResult(req);

        // Create a Book object with escaped / trimmed data and old id
        var book = new Book(
            {
                title: req.body.title,
                author: req.body.author,
                summary: req.body.summary,
                isbn: req.body.isbn,
                genre: (typeof req.body.genre === 'undefined') ? [] : req.body.genre,
                _id: req.params.id // Required to prevent new id creation
            }
        );

        if (!errors.isEmpty()) {
            // THere are errors.  Render form again with sanitized values / error messages

            // Get all authors and genres for form
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                }
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked = 'true';
                    }
                }
                res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
            });
            return;
        } else {
            // Data from form is valid.  Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page
                res.redirect(thebook.url);
            });
        }
    }

];