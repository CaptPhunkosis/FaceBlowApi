

exports.latlongToGeoPoint = function(lat, long) {
    return {type:'Point', coordinates: [long, lat]}
};
