const config=require('config'); 
var mongojs = require('mongojs');
var mongoose=require('mongoose'), Admin=mongoose.mongo.Admin;
var options = {
	user: config.Customer.mongodbuser,
	pass: config.Customer.mongodbpwd
}
exports.connect=function(callback){
	mongoose.connect(config.Customer.mongodburl, options);

}
exports.mongoObj=function(){
	return mongoose;
}
exports.mapReduceDB = function(){
	var db = mongojs(config.Customer.mongodbjsurl);
	return db;
}

//create a connection to the DB
exports.CreateConnection=function(callback,returnFunc){
	var connection=mongoose.createConnection(config.Customer.mongodburl);
	console.log("몽고디비연결");
	connection.once('open',function(){
		callback(connection,Admin,returnFunc);
	});
}