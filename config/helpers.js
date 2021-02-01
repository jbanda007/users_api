// Used for Response Output in JSON Format
var jsonFormat = async ( res, status, message, data, extra="" )=>{
    var output = {
        "status": status,
        "message": message,
        "data": data
    };
    if( extra != "" ){
      output.extra = extra;
    }
    res.status( status );
    return res.json( output );
}

module.exports = {
    jsonFormat,
}