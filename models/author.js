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
    // Return only family name if first name not defined, or empty string if none.
    var fullName = '';
    if (this.family_name) {
        fullName += this.family_name;
        if (this.first_name) {
            fullName += ', ' + this.first_name;
        }
    }
    return fullName;
});

// Virtual for author's lifespan, formatted
AuthorSchema.virtual('lifespan').get(function() {
    return (this.date_of_birth ? moment(this.date_of_birth).format('MMMM Do, YYYY') : '?')
    + ' - '
    + (this.date_of_death ? moment(this.date_of_death).format('MMMM Do, YYYY') : '');
});

// Virtual for author's date of birth, formatted for html date input
AuthorSchema.virtual('date_of_birth_html').get(function() {
    return this.date_of_birth ? moment(this.date_of_birth).format('YYYY-MM-DD') : '';
});

// Virtual for author's date of death, formatted for html date input
AuthorSchema.virtual('date_of_death_html').get(function() {
    return this.date_of_death ? moment(this.date_of_death).format('YYYY-MM-DD') : '';
});

// Virtual for author's url
AuthorSchema.virtual('url').get(function() {
    return '/catalog/author/' + this._id;
});

// Export model
module.exports = mongoose.model('Author', AuthorSchema);