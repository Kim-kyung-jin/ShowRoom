const config=require('config');
var mongoose=require('mongoose'), Admin=mongoose.mongo.Admin;
exports.connect=function(callback){
	mongoose.connect(config.Customer.mongodburl);
	
}
exports.mongoObj=function(){
	return mongoose;
}

//create a connection to the DB
exports.CreateConnection=function(callback,returnFunc){
	var connection=mongoose.createConnection(config.Customer.mongodburl);
	console.log("몽고디비연결");
	connection.once('open',function(){
		callback(connection,Admin,returnFunc);
	});
}