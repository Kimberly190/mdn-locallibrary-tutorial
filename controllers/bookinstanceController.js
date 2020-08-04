var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
var async = require('async');
const validator = require('express-validator');
const { validationResult } = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
        .populate('book')
        .exec(function(err, list_bookinstances) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, bookinstance) {
            if (err) { return next(err); }
            if (bookinstance == null) { // No results
                var err = new Error('Book copy not found');
                err.status = 404;
                return next(err);
            }
            // Successful, so render
            res.render('bookinstance_detail', { title: 'Copy: ' + bookinstance.book.title, bookinstance: bookinstance });
        });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({}, 'title')
        .exec(function(err, books) {
            if (err) { return next(err); }
            // Successful, so render
            res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, statuses: BookInstance.statuses() });
        });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

    // Validate fields
    validator.body('book', 'Book must be specified.').trim().isLength({ min: 1 }),
    validator.body('imprint', 'Imprint must be specified.').trim().isLength({ min: 1 }),
    validator.body('due_back', 'Invalid date.').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields
    validator.sanitizeBody('book').escape(),
    validator.sanitizeBody('imprint').escape(),
    validator.sanitizeBody('status').trim().escape(),
    validator.sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validator.validationResult(req);

        // Create a BookInstance object with escaped and trimmed data
        var bookinstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back || undefined //HACK: force mongoose to recognize falsy value needs default
            });
        
        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({}, 'title')
                .exec(function(err, books) {
                    if (err) { return next(err); }
                    // Successful, so render
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id, errors: errors.array(), bookinstance: bookinstance, statuses: BookInstance.statuses() });
                });
                return;
        } else {
            // Data from form is valid
            bookinstance.save(function(err) {
                if (err) { return next(err); }
                // Successful - redirect to new record
                res.redirect(bookinstance.url);
            });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    BookInstance.findById(req.params.id)
        .populate('book')
        .exec(function(err, bookinstance) {
            if (err) { return next(err); }
            if (bookinstance == null) { // No results, nothing to delete
                res.redirect('/catalog/bookinstances');
            }
            // Successful, so render
            res.render('bookinstance_delete', { title: 'Delete Book Instance', bookinstance: bookinstance });
    });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {    
    // Delete object and redirect to the list
    BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookInstance(err) {
        if (err) { return next(err); }
        // Success - go to bookinstance list
        res.redirect('/catalog/bookinstances');
    });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    async.parallel({
        book_list: function(callback) {
            Book.find({}, 'title').exec(callback);
        },
        bookinstance: function(callback) {
            BookInstance.findById(req.params.id)
                .populate('book')
                .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.bookinstance == null) { // No results.
            var err = new Error('Book instance not found');
            err.status = 404;
            return next(err);    
        }
        // Successful, so render
        res.render('bookinstance_form', { title: 'Update Copy: ' + results.bookinstance._id, bookinstance: results.bookinstance, book_list: results.book_list, statuses: BookInstance.statuses() });
    });
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [

    // Validate fields
    validator.body('book', 'Book must be specified.').trim().isLength({ min: 1 }),
    validator.body('imprint', 'Imprint must be specified.').trim().isLength({ min: 1 }),
    validator.body('due_back', 'Invalid date.').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields
    validator.sanitizeBody('book').escape(),
    validator.sanitizeBody('imprint').escape(),
    validator.sanitizeBody('status').trim().escape(),
    validator.sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization
    (req, res, next) => {

        // Extract the validation errors from a request
        const errors = validator.validationResult(req);

        // Create a BookInstance object with escaped / trimmed data and old id
        var bookinstance = new BookInstance(
            {
                book: req.body.book,
                imprint: req.body.imprint,
                status: req.body.status,
                due_back: req.body.due_back || undefined, //HACK: force mongoose to recognize falsy value needs default
                _id: req.params.id // Required to prevent new id creation
            }
        );

        if (!errors.isEmpty()) {
            // There are errors.  Render form again with sanitized values / error messages

            // Get all books for form
            Book.find({}, 'title').exec(function(err, book_list) {
                if (err) { return next(err); }
                // Successful, so render
                res.render('bookinstance_form', { title: 'Update Copy: ' + bookinstance._id, bookinstance: bookinstance, book_list: book_list, statuses: BookInstance.statuses(), errors: errors.array() });
            });
        } else {
            // Data from form is valid.  Update the record.
            BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function(err, thebookinstance) {
                if (err) { return next(err); }
                // Successful - redirect to book instance detail page
                res.redirect(thebookinstance.url);
            });
        }
    }
];
