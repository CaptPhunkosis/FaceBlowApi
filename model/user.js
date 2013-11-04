var mongoose = require('mongoose');
var createUpdateInfo = require('./plugins/create_update_info');

var UserSchema = new mongoose.Schema({
    name: String,
    uuid: {type: String, unique: true, required: '{PATH} is required!'},
    exploded: {type: Number, default: 0},
    explodes: {type: Number, default: 0},
    liveMines: {type: Number, default: 0}
});

UserSchema.plugin(createUpdateInfo);

var User = mongoose.model('User', UserSchema);

module.exports = {User: User}
