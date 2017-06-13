const async = require('async');	
const ObjectId = require('mongodb').ObjectID;
const User=require('../model/Userdb.js');
const codyControl = require('../utils/codyController');
const codyModel = require('../model/CodyModel.js');
const dbModel = require('../utils/dbOverlap'); 
const myShowRoom = require('../utils/myShowRoomController');
	

//선호도 리스트에 처음 나온 codyid 중복 안되게 check에 push
exports.codyOverLap = function(userObjectId,codyId,callback){
	var findData = { _id : ObjectId(userObjectId)};
	var updateData = {$push:{userFavoriteCodyCheck:codyId}};
	codyControl.updateDate(User,findData,updateData,function (err, result){
		callback(null,result);
	});	 
}


//코디id받아서 카테고리번호를 배열로 개 받는다
exports.codyCategoryData = function(codyId,callback){
	var findData =	{ _id : ObjectId(codyId)};
	var showData = {_id : 0 ,codyCategoryCode : 1,codyTag : 1};
	var sortData = {_id: -1};
	codyControl.allShowData(codyModel,findData,showData,sortData,function (err, result){
		callback(null,result[0].codyCategoryCode,result[0].codyTag);
	});
}



//옷 상세보기 참고하기 
exports.favoriteInsert =async function(userObjectId,categoryCodeData,scoreData){
	var count = 0 ;	
	async.whilst(
	    function(){ return count < categoryCodeData.length; },
	    function (callback2) {
	   		var findData = {_id: ObjectId(userObjectId), userFavorite : 
			   			   { $elemMatch: { favoriteCategoryCode : categoryCodeData[count]}}};
	   		var showData = {"$exists":true};
	   		var sortData = {_id: -1};
	   		//데이터의 유무만 판단.
	   		codyControl.allShowData(User,findData,showData,sortData,function (err, result){
	   			//데이터 0개면 등록
	    		if(result.length == 0){
	    			var findData = { _id :  ObjectId(userObjectId)};
	    			var updateData = {$push:{userFavorite:
	    						     {favoriteCategoryCode: categoryCodeData[count],favoriteScore:scoreData[count]}}};
	    			codyControl.updateDate(User,findData,updateData,function (err, result){
		    			count++;
		    			callback2();
	    			});	 
	    		//데이터 있을 시 점수만 올려줌
	    		}else{
	    			return console.log('여기')
	    			var findData = { _id :  ObjectId(userObjectId),"userFavorite.favoriteCategoryCode" :categoryCodeData[count]};
	    			var updateData = {'$inc':{"userFavorite.$.favoriteScore" : scoreData[count]}};
	    			codyControl.updateDate(User,findData,updateData,function (err, result){
		    			count++;
		    			callback2();
	    			});	
	    		}
	   		});
	    }
	    ,
	    function (err,result){
	    	// callback2(null);
	    }
	);	 
	
};






//유저 선호도 입력(태그,점수)
exports.tagInsert = function(userObjectId,tagData,scoreData,callback){
	var count = 0 ;	
	async.whilst(
	    function(){ return count < tagData.length; },
	    function (callback2) {
	   		var findData = {_id: ObjectId(userObjectId), userCodyTag : 
			   			   { $elemMatch: { tagName : tagData[count]}}};
	   		var showData = {"$exists":true};
	   		var sortData = {_id: -1};
	   		//데이터의 유무만 판단
	   		codyControl.allShowData(User,findData,showData,sortData,function (err, result){
	   			//데이터 0개면 등록
	    		if(result.length == 0){
	    			var findData = { _id :  ObjectId(userObjectId)};
	    			var updateData = {$push:{userCodyTag:
	    						     {tagName: tagData[count],tagScore:scoreData[count]}}};
	    			codyControl.updateDate(User,findData,updateData,function (err, result){
		    			count++;
		    			callback2();
	    			});	 
	    		//데이터 있을 시 점수만 올려줌
	    		}else{
	    			var findData = { _id :  ObjectId(userObjectId),"userCodyTag.tagName" :tagData[count]};
	    			var updateData = {'$inc':{"userCodyTag.$.tagScore" : scoreData[count]}};
	    			codyControl.updateDate(User,findData,updateData,function (err, result){
		    			count++;
		    			callback2();
	    			});	
	    		}
	   		});
	    },
	    function (err,result){
	    	callback(null);
	    }
	);	 
};



//유저 선호도 입력(cloth일떄)
exports.clothInsert = async function(userObjectId,categoryCodeData,scoreData){
	let findData = {_id: ObjectId(userObjectId), userFavorite : 
	   			   { $elemMatch: { favoriteCategoryCode : categoryCodeData[0]}}}
	let showData = {"$exists":true}
	let sortData = {_id: -1};
	//데이터의 유무만 판단.
	let dataExist = await codyControl.allShowData(User,findData,showData,sortData);
	//데이터 0개면 등록
	if(dataExist.length == 0) {
		let findData = { _id :  ObjectId(userObjectId)}
		let updateData = {$push:{userFavorite:
					     {favoriteCategoryCode:categoryCodeData[0],favoriteScore:scoreData[0]}}}
		let dataUpdate = await codyControl.updateDate(User,findData,updateData)
	//데이터 있을 시 점수만 올려줌
	}else{
		let findData = { _id :  ObjectId(userObjectId),"userFavorite.favoriteCategoryCode" :categoryCodeData[0]}
		let updateData = {'$inc':{"userFavorite.$.favoriteScore" : scoreData[0]}}
		let dataUpdate = await codyControl.updateDate(User,findData,updateData)
	}
}


exports.favovirteShowModule = function(userObjectId,callback){ 
	async.waterfall(
	        [	
	    		//여기서부턴 선호도 검사리스트 보여주기 동일
	        	function(callback){
	        		var findData = { _id : ObjectId(userObjectId)};
	        		var showData = { _id : 1 ,userFavoriteCodyCheck : 1};
	        		var sortData = { _id: -1};
	        		codyControl.allShowData(User,findData,showData,sortData,function (err, result){
						var codyData = [];
						for(var i = 0; i<result[0].userFavoriteCodyCheck.length; i++){
							codyData.push(ObjectId(result[0].userFavoriteCodyCheck[i]))
						}
	        			callback(null,codyData) 
	          		})
	        	}, 
	        	function(codyData,callback) {
					var page = 1;
					var count=10;
					var pageCount = (page - 1) * count;
					var findData =	[
						{ $match : { _id:{ $nin : codyData }}},
						{ $project : 
							{
							   	codyTag : 1,
							   	codyPhoto1 : 1,
							   	codyPhoto2 : 1,
						   		_id : 1,
					   		}
						},
					   	{ $sort: { _id: -1 }},
						{"$skip":pageCount},
						{"$limit":count}
					];
	        		codyControl.aggregate(codyModel,findData,function (err, result){
	        			if(result.length == 0){
	        				callback(null,'더이상 검사할 데이터가 존재하지않습니다.')
	        			}else{
	        				callback(null,result)
	        			}	
	          		})
	        	}
	    	],
	        function (err, result) {
	            if (err) {
	        	    err.code = 500; 
	        	    console.log(err);
	        	    callback(null,err);
	            }
	            else {
	            	console.log(result);
	        		callback(null,result)
	            }
	        });	
}


//코디클릭시 나이 데이터 입력
exports.addCodyAge = function(userObjectId,codyId,callback){
	async.waterfall([
		function(callback){
			var findData = { _id : userObjectId };
			var showData = {_id : 0 ,userAge : 1};
			var sortData = {_id: -1};
    		codyControl.allShowData(User,findData,showData,sortData,function (err, age){
    			callback(null,age[0].userAge) 
    		})	
		},
		function(age,callback){
			var findDate = { _id: ObjectId(codyId) };
			var updateData = { $push: { codyUserClickAge: age }};
			codyControl.updateDate(codyModel,findDate,updateData,function (err, result){
				callback(null);
			});	
		}
	],
    function (err, result) {
        if (err) {
    	    err.code = 500; 
    	    console.log(err);
        }
        else {
    		callback(null)
        }
    })

};	


//코디 순위
exports.codyRank = function (Model, mapReduce) {
	return new Promise(function(resolve, reject){
		Model.mapReduce(mapReduce, function (err, model, stats) {
			model.aggregate({
				"$project":{
				"_id":"$_id._id",
				"codyPhoto":"$_id.photo",
				"Click":"$value"}},{"$sort":{Click:-1}},function(err,docs){
				resolve(docs);
			});
		})
	})
};


//쇼핑몰 순위
exports.shopRank = function (Model, mapReduce) {
	return new Promise(function(resolve, reject){
		Model.mapReduce(mapReduce, function (err, model, stats) {
			model.aggregate({
				"$project":{
				"_id":0,
				"shopName":"$_id.shopName",
				"shopPhoto":"$_id.shopPhoto",
				"shopUrl":"$_id.shopUrl",
				"Click":"$value"}},{"$sort":{Click:-1}},function(err,docs){
				resolve(docs);
			});
		})
	})
};

//10~40대 순위
exports.ageRank = function (Model, mapReduce, callback) {
	return new Promise(function(resolve, reject){
		Model.mapReduce(mapReduce, function (err, model, stats) {
			model.aggregate({
				"$project":{
					"_id":0,
					"codyData":"$_id",
					"Click":"$value"
				}},{"$sort":{Click:-1}},function(err,docs){
				resolve(docs);
			});
		})
	})
	
};
//261