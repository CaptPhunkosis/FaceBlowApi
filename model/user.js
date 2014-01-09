var mongoose = require('mongoose');
var createUpdateInfo = require('./plugins/create_update_info');
var PlantedMine = require('./planted_mine').PlantedMine;
var SpentMine = require('./spent_mine').SpentMine;

var UserSchema = new mongoose.Schema({
    name: String,
    uuid: {type: String, unique: true, required: '{PATH} is required!'},
    exploded: {type: Number, default: 0},
    explodes: {type: Number, default: 0},
    liveMines: {type: Number, default: 0}
});

UserSchema.plugin(createUpdateInfo);

UserSchema.statics.findUserAndMines = function(user_uuid, callback){
    query = {uuid: user_uuid};
    options = {upsert: true};
    this.findOneAndUpdate(query, query, options, function(err, user){
        if(err){
            return callback(err, null);
        }

        PlantedMine.findUserMines(user, function(err, plantedMines){
            if(err){
                return callback(err, null);
            }

            SpentMine.findUserUnackedMines(user, function(err, unackedMines) {
                if(err){
                    return callback(err, null);
                }
                return callback(null, {user:user, plantedMines: plantedMines, unackedMines:unackedMines});
            });
        });

    });
};

UserSchema.methods.forPublic = function(){
    var result = this.toObject();
    delete result._id;
    return result;
}

var User = mongoose.model('User', UserSchema);

module.exports = {User: User}
