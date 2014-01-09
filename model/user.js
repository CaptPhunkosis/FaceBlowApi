var mongoose = require('mongoose');
var createUpdateInfo = require('./plugins/create_update_info');
var PlantedMine = require('./planted_mine').PlantedMine;
var SpentMine = require('./spent_mine').SpentMine;
var http = require('http');

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

                if(!user.name){
                    var options = {
                        host:"randomword.setgetgo.com",
                        path:"/get.php",
                        port:80
                    }
                    http.get(options, function(res){
                        var data = "";
                        res.on("data", function(chunk){
                            data += chunk;
                        });

                        res.on("end", function(){
                            user.name = data.trim();
                            user.save(function(err, user, numberAffected){
                                return callback(null, {user:user, plantedMines: plantedMines, unackedMines:unackedMines});
                            });
                        });
                    });
                } else {
                    return callback(null, {user:user, plantedMines: plantedMines, unackedMines:unackedMines});
                }

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
