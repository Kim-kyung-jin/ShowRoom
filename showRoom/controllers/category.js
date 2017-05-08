const config=require('config');
const category = require('../utils/categoryController');   
const dbModel = require('../utils/dbOverlap');  
const User=require('../model/Userdb.js');											
const codyModel = require('../model/CodyModel.js');																													//
const async = require('async');	
const codyControl = require('../utils/codyController');
const myShowRoom = require('../utils/myShowRoomController');
const ObjectId = require('mongodb').ObjectID;
const UserController=require('../utils/userController');
const jsonWebToken=require('../utils/jsonWebToken');
const output = new Object();



//카테고리별  코디 보여주기(o)
exports.showCategoryTypeCody = function (req, res, next){
	var categoryType = req.params.categoryType;
	var token = req.body.userToken;
	categoryType = categoryType+'%';
	async.waterfall(
            [
				function(callback){
					jsonWebToken.TokenCheck(req.body.userToken,function(err,result){
						if(err)
							console.log(err);
						else
							callback(null,result);
					});
				},
				function(userTokenInfo,callback){
					UserController.getUserFindObjectId(userTokenInfo.ObjectId,function(err,result){
						if(err)
							console.log(err);
						else
							callback(null,result,userTokenInfo);
					});				
				},	
            	function(userInfo,userTokenInfo,callback){		
            		dbModel.dbOverlap2(category.showCategoryCode,categoryType,function (err, result){
            			categoryCode = [];
            			for(var i = 0; i< result.length; i++){
            				categoryCode.push(String(result[i].categoryCode));
            			}
            			callback(null,userInfo,userTokenInfo,categoryCode);
            		});
               	},               
           		function(userInfo,userTokenInfo,categoryCode,callback){
    			    var testBag = [];
    				var testMybag = userInfo.userCodyMybag;
    				for(var i=0 ; i<testMybag.length;i++){
    					testBag.push(ObjectId(testMybag[i]));
    				};
               		var page = req.query.page || 1;
	           		var count=10;
	           		var pageCount = (page - 1) * count;
	           		var findData =	[
	        			{ $match : { $or : [ { codyCategoryCode : {$in : categoryCode}}]}},
	           			{ $project : {
	           			   	codyTag : 1,
	           			   	codyPhoto1 : 1,
	           		   		_id : 1,
	           		   		userIsStar :  { $in: [ "$_id", { $literal: testBag } ] },
	           		   		}
	           			},
	           		   	{ $sort: { _id: -1 }},
	           			{"$skip":pageCount},
	           			{"$limit":count}
	           		];
	             	codyControl.aggregateData(codyModel,findData,function (err, result){
	             		callback(null,userInfo,userTokenInfo,result);
	             	});
           		}
            ], 
            function (err, userInfo,userTokenInfo,result1) {
                if (err) {
            	    err.code = 500;
            	    console.log(err);
            	    callback(new Error('에러발생'));
                }
                else {
                	output.msg = 'success';
                	output.data = result1;
                	output.userToken = userTokenInfo.userToken;
                	res.json(output);
                }
            });
};



//카테고리별  코디상세 보여주기 
exports.showCategoryCloth = function (req, res, next) {
	var token = req.body.userToken;
	var codyId = req.params.codyId; 
	var favoriteScore = 1;
	async.waterfall(
          [	
				function(callback){
					jsonWebToken.TokenCheck(token,function(err,result){
						if(err)
							console.log(err);
						else
							callback(null,result);
					});
				},
				function(userTokenInfo,callback){
					UserController.getUserFindObjectId(userTokenInfo.ObjectId,function(err,result){
						if(err)
							console.log(err);
						else
							callback(null,result,userTokenInfo);
					});				
				},	
				function(userInfo,userTokenInfo,callback){
	        		var findData =	{ _id : ObjectId(userInfo._id),userFavoriteCodyCheck : codyId};
	        		var showData = {"$exists":true};
	        		var sortData = {_id: -1};
	        		//선호도 check 유무판단
	        		codyControl.allShowData(User,findData,showData,sortData,function (err, result){
	        			callback(null,userInfo,userTokenInfo,result.length); 
	          		});
				},
				function(userInfo,userTokenInfo,dataCount,callback){
					if(dataCount == 0){
						async.waterfall([
							function(callback){
								//처음 선호도 검사한 코디 check에 push해준다.(User)
								myShowRoom.codyOverLap(userInfo._id,codyId,function(err,result){
				        			callback(null);
				        		}); 
							},
							function(callback){
								//카테고리데이터 가지고온다(Cody)
								myShowRoom.codyCategoryData(codyId,function(err,categoryData,tagData){
									var scoreData = [];
									for(var i = 0; i< categoryData.length; i++){            				
										scoreData.push(favoriteScore);
									}	
				        			callback(null,userInfo,userTokenInfo,categoryData,scoreData,tagData);
				        		}); 
							},
							function(userInfo,userTokenInfo,category,score,tagData,callback){
								//category,score 데이터입력 (태그 입력은 따로해야됨)
								myShowRoom.favoriteInsert(userInfo._id,category,score,function(err,result){
				        			callback(null,userInfo,userTokenInfo,tagData);
				        		});
							},
							function(userInfo,userTokenInfo,tagData,callback){
								//tag 데이터입력
								var tagScoreData = [];
								for(var i = 0; i< tagData.length; i++){            				
									tagScoreData.push(1);
								}	
								myShowRoom.tagInsert(userInfo._id,tagData,tagScoreData,function(err,result){
				        			callback(null,userInfo,userTokenInfo);
				        		});
							},
		        		],
		        	    function (err,userInfo,userTokenInfo) {
						    if (err) {
							    err.code = 500;
							    console.log(err);
						    }
						    else {
						    	console.log(result);
						    	callback(null,userInfo,userTokenInfo);
						    }
						});
					}else{
						async.waterfall([
							function(callback){
								//카테고리데이터 가지고온다(Cody)
								myShowRoom.codyCategoryData(codyId,function(err,categoryData,tagData){
									var scoreData = [];
									for(var i = 0; i< categoryData.length; i++){            				
										scoreData.push(favoriteScore);
									}	
				        			callback(null,userInfo,userTokenInfo,categoryData,scoreData,tagData);
				        		}); 
							},
							function(userInfo,userTokenInfo,category,score,tagData,callback){
								//category,score 데이터입력 (태그 입력은 따로해야됨)
								myShowRoom.favoriteInsert(userInfo._id,category,score,function(err,result){
				        			callback(null,userInfo,userTokenInfo,tagData);
				        		});
							},
							function(userInfo,userTokenInfo,tagData,callback){
								//tag 데이터입력
								var tagScoreData = [];
								for(var i = 0; i< tagData.length; i++){            				
									tagScoreData.push(1);
								}	
								myShowRoom.tagInsert(userInfo._id,tagData,tagScoreData,function(err,result){
				        			callback(null,userInfo,userTokenInfo);
				        		});
							},
						],
		        	    function (err,userInfo,userTokenInfo) {
						    if (err) {
							    err.code = 500;
							    console.log(err);
						    }
						    else {
						    	callback(null,userInfo,userTokenInfo);
						    }
						});
					}
				},  
				//나이입력
				function(userInfo,userTokenInfo,callback){
					myShowRoom.addCodyAge(userInfo._id,codyId,function(err,result){
	        			callback(null,userInfo,userTokenInfo);
					});
				},
				//여기서부터 상세보기
				function(userInfo,userTokenInfo,callback){
//					return console.log(userInfo.userFavoriteCodyCheck);
    			    var codyBag = [];
    				var codyMybag = userInfo.userCodyMybag;
    			    var clothBag = [];
    				var clothMybag = userInfo.userClothMybag;
    				
    				if(!codyMybag.length == 0){
	    				for(var i=0 ; i<codyMybag.length;i++){
	    					codyBag.push(ObjectId(codyMybag[i]));
	    				};
    				}

    				if(!clothMybag.length == 0){
    					for(var i=0 ; i<clothMybag.length;i++){
        					clothBag.push(clothMybag[i]);
        				};
    				}
	           		var findData =		[
	           			{"$match" : {_id : ObjectId(codyId)}},
	           			{ $project : {
	           			   	codyTag : 1,
	           			   	codyPhoto1 : 1,
	           			   	codyClothNumber : 1,
	           		   		_id : 1,
	           		   		userIsStar : { $in: [ "$_id",{ $literal: codyBag }]}
	           		   		}
	           			},
	           		   	{ $sort: { _id: -1 }}
	           		];
	           		//코디 데이터보기
	             	codyControl.aggregateData(codyModel,findData,function (err, result){
	             		callback(null,userInfo,userTokenInfo,result,clothBag);
	             	});
             	},               
         		function(userInfo,userTokenInfo,codyData,clothBag,callback){
             		var cloth = [];
             		//옷데이터보기
             		
             		dbModel.dbOverlap2(category.showCloth,[codyData[0].codyClothNumber],function (err, result){
            			for(var i = 0; i< result.length; i++){ //코디에 옷 개수만큼 
            				var temp = new Object();
            				temp.clothNumber= result[i].clothNumber;
            				if(!clothBag.length == 0){
	            				for(var j = 0 ; j<clothBag.length; j++){
		            				if(result[i].clothNumber == clothBag[j]){
		            					temp.clothIsStar = true; 
		            				}else{
		            					temp.clothIsStar = false;
		            				}
	            				}
            				}
            				temp.clothName= result[i].clothName;
            				temp.clothPhoto= result[i].clothPhoto;
            				cloth.push(temp);
            			}
        				var clothData = new Object();
        				clothData = cloth;
        				callback(null,userInfo,userTokenInfo,codyData,clothData)
             		});
         		}
          ], 
          function (err, userInfo,userTokenInfo,codyData,clothData){
              if (err) {
          	    err.code = 500;
          	    console.log(err);
              }
              else {
              	output.msg = 'success bbbb';
            	output.codyData = codyData;
            	output.clothData = clothData;
            	output.userToken = userTokenInfo.userToken;
              	res.json(output);
              }
          });
};



//카테고리 보기(o)
exports.showCategoryList = function (req, res, next) {
	var pageCount = req.query.page || 0;
	var page = 5*pageCount
	dbModel.dbOverlap2(category.showCategoryList,page,function (err, result){
		res.json({ msg: 'success',  data: result});
	})
};






//카테고리 등록(o) 
exports.addCategory = async function (req, res, next){
	let categoryInfo = {
		categoryCode : req.body.categoryCode, 
		categoryColor : req.body.categoryColor,
		categoryDescription : req.body.categoryDescription
	};  

	let categoryCheck = 
	await dbModel.dbOverlap2(category.categorySameCheck,[categoryInfo.categoryDescription,categoryInfo.categoryCode]); //아이디 중복체크 
	if(!(categoryCheck.length == 0)){
		return res.status(400).send('데이터 중복 입력');
	}else{
		let categoryInsert = await dbModel.dbOverlap2(category.addCategory,categoryInfo);
		res.json('category Insert success');
	}
};

//카테고리수정(o)
exports.editCategory = async function (req, res, next){
	let categoryCode = req.params.categoryCode;
	let categoryInfo = {
		categoryCode : req.body.categoryCode, 
		categoryColor : req.body.categoryColor,
		categoryDescription : req.body.categoryDescription
	};
	let data = [categoryInfo,categoryCode];
	let categoryInsert = await dbModel.dbOverlap2(category.editCategory,data);	
	res.json({ msg: 'category edit success' });
};	
//카테고리 삭제 (o)
exports.deleteCategory =async function (req, res, next) {
	let categoryCode = req.params.categoryCode;
	let categoryInsert = await dbModel.dbOverlap2(category.deleteCategory,categoryCode);	
	res.json({ msg: 'category delete success',  });
}

