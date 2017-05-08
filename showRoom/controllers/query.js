const config=require('config');
const mongoose = require('mongoose');
const async = require('async');	
const db = mongoose.connection;
const url = 'mongodb://localhost/showRoom';
mongoose.connect(url);
const Model = require('../model/CodyModel.js');
const Model2 = require('../model/Boarddb.js');
const User=require('../model/Userdb.js');
const ObjectId = require('mongodb').ObjectID;
var random = require('mongoose-simple-random');
const Schema=mongoose.Schema;
//var findData =	{ $or : [{codyTag : /첫번/},{codyTag : /기타/}] } // or 검색 텍스트
//var findData =	{ $or : [{codyTag : /첫번/},{codyTag : /기타/}] } // and 검색 텍스트
//var findData =	{ $where: "/^1.*/.test(this.codyCategoryCode)" }  // 검색 number
var findData = {_id: ObjectId(userInfo._id), userFavorite : 
			   { $elemMatch: { favoriteCategoryCode : String(categoryCodeData[0].categoryCode)}}};
var showData = {"$exists":true};
var sortData = {_id: -1};
Model.aggregate(findData).then(
		function fulfilled(result){c onsole.log(result);},
		function rejected(err){console.log(err);}); 






/* 텍스트 검색
var test = '주혁';
var re = new RegExp(test);
var findData =	{ codyTag :re }  //어떻게 선언?
Model.find(findData).then(
	function fulfilled(result){console.log(result);},
	function rejected(err){console.log(err);}); 
*/

/*코디 인기순,최신순
var test = {};
test = { _id: -1} //최신순
test = { codyUserClickAge: -1}//인기순
	var findData =[{ $project : {codyUserClickAge : { $size: "$codyUserClickAge"}}},{ $sort: test}];
	Model.aggregate(findData).then(
		function fulfilled(result){c onsole.log(result);},
		function rejected(err){console.log(err);}); 
*/

