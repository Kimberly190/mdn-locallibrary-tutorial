var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

let _statuses = ['Available', 'Maintenance', 'Loaned', 'Reserved'];

var BookInstanceSchema = new Schema(
    {
        book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, // ref to the associated book metadata
        imprint: { type: String, required: true },
        status: { type: String, required: true, enum: _statuses, default: 'Maintenance' },
        due_back: { type: Date, default: Date.now }
    }
);

// Virtual for book instance's url
BookInstanceSchema.virtual('url').get(function() {
    return '/catalog/bookinstance/' + this._id;
});

// Virtual for formatted due date
BookInstanceSchema.virtual('due_back_formatted').get(function() {
    return moment(this.due_back).format('MMMM Do, YYYY');
})

BookInstanceSchema.static('statuses', function() {
    return _statuses;
})

// Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema);