

exports.latlongToGeoPoint = function(lat, long) {
    return {coordinates: [long, lat], type:'Point'}
};
