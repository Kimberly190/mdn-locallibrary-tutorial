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