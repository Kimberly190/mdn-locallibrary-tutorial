var mongoose = require('mongoose');
var moment = require('moment');
var Schema = mongoose.Schema;

var AuthorSchema = new Schema(
    {
        first_name: { type: String, required: true, maxlength: 100 },
        family_name: { type: String, required: true, maxlength: 100 },
        date_of_birth: { type: Date },
        date_of_death: { type: Date }
    }
);

// Virtual for author's full name
AuthorSchema.virtual('name').get(function() {
    // To avoid errors in cases where an author does not have either a family name or first name
    // We want to make sure we handle the exception by returning an empty string for that case
    var fullName = '';
    if (this.first_name && this.first_name) {
        fullName = this.family_name + ', ' + this.first_name;
    }
    // REMOVED: from tutorial, redundant
    // if (!this.first_name || !this.family_name) {
    //     fullname = '';
    // }
    return fullName;
});

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function() {
    return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString();
});

// Virtual for author's lifespan detail, formatted
AuthorSchema.virtual('lifespan_detail_formatted').get(function() {
    console.log('Author name: ' + this.family_name + ' birth: ' + this.date_of_birth + ' death: ' + this.date_of_death);
    return (this.date_of_birth ? moment(this.date_of_birth).format('MMMM Do, YYYY') : '?')
    + ' - '
    + (this.date_of_death ? moment(this.date_of_death).format('MMMM Do, YYYY') : '');
});

// Virtual for author's url
AuthorSchema.virtual('url').get(function() {
    return '/catalog/author/' + this._id;
});

// Export model
module.exports = mongoose.model('Author', AuthorSchema);