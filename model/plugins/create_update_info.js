var mongoose = require('mongoose');

module.exports = exports =  function createUpdateInfo(schema, options) {
    schema.add({createdOn: { type: Date, default: Date.now }});
    schema.add({updatedOn: { type: Date, default: Date.now }});

    schema.pre('save', function(next) {
        this.updatedOn = Date.now();
        next();
    });
};


