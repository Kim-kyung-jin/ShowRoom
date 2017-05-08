const SelectBoardController=require('../utils/selectController.js')
	  ,UserController=require('../utils/userController.js')
	  ,Select=require('../model/Selectdb');
const moment=require('moment');
const async=require('async');
const config=require('config');
const fs=require('fs');
const jsonWebToken=require('../utils/jsonWebToken');
const schedule=require('node-schedule');

moment.locale("ko");
var current_time=new moment().format("YYYY-MM-DD HH:mm:ss");
var output=new Object();

var deleteScheduleTime='00 11 14 * * 0-6';

function deleteFiles(files,callback){
	if(files.length==0)
		callback();
	else{
		var f=files.pop();
		fs.unlink(f,function(err){
			if(err)
				console.log(err);
			else{
				deleteFiles(files,callback);
			}
		});
	}
}
var deleteSchedulePlay = schedule.scheduleJob(deleteScheduleTime, 
	function(){
		var count=0;
		var day=moment().format('DD');
		var month=moment().format('MM');
		var year=moment().format('YYYY');
		var deleteTime=year+month+day;
		var deletePhotoarray=[];
		async.waterfall([
			function(callback){
				SelectBoardController.deleteListSelectBoard(deleteTime,function(err,result){
					callback(null,result);
				});
			},
			function(deleteList,callback){
				var deleteListSize=Object.keys(deleteList).length;
				async.whilst(
					function(){
						return count<deleteListSize;
					},
					function(callback){
						var leftStrArray=deleteList[count].selectboardLeftPhoto.split('/');
						var rightStrArray=deleteList[count].selectboardRightPhoto.split('/');
						var leftImageUrl='public/'+leftStrArray[3]+'/'+leftStrArray[4]+'/'+leftStrArray[5]+'/'+leftStrArray[6];
						var rightImageUrl='public/'+rightStrArray[3]+'/'+rightStrArray[4]+'/'+rightStrArray[5]+'/'+rightStrArray[6];
						deletePhotoarray.push(leftImageUrl);
						deletePhotoarray.push(rightImageUrl);
						SelectBoardController.deleteSelectBoard(deleteList[count].id,function(err,result){
							if(err)
								console.log(err);
						});
						count++;
						callback();
					},
					function(err){
						if(err)
							console.log(err);
						callback(null,deletePhotoarray,deleteListSize);
					}
				);
			},function(deletePhotoarray,deleteListSize,callback){
				deleteFiles(deletePhotoarray,function(err){
					if(err)
						console.log(err);
					callback(null,deleteListSize);
				});
				
			}
		],function(err,result){
			if(err)
				console.log(err);
			else
				console.log("삭제 갯수 :"+result);
		});
	}
);






//선택게시판 등록
exports.addSelectBoard=function(req,res,next){
	var select=new Select();
	var leftPhoto=req.files[0].path.split('/');
	var rightPhoto=req.files[1].path.split('/');
	select.selectboardContent=req.body.selectboardContent;
	select.selectboardDatetime=current_time;
	select.selectboardLeftPhoto=config.Customer.imageurl+'/'+leftPhoto[1]+'/'+leftPhoto[2]+'/'+leftPhoto[3]+'/'+leftPhoto[4];
	select.selectboardRightPhoto=config.Customer.imageurl+'/'+rightPhoto[1]+'/'+rightPhoto[2]+'/'+rightPhoto[3]+'/'+rightPhoto[4];
	console.log(req.files[0]);
	async.waterfall([
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
					else if(result==0)
						callback(null,result,userTokenInfo);
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,userInfo,userTokenInfo,0);
				else{
					select.selectboardSelectUsers=select.selectboardUserId=userInfo.userId;
					SelectBoardController.saveSelectBoard(select,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,0,userTokenInfo,0);
						else
							callback(null,userInfo,userTokenInfo,result);
					});	
				}
			},
			function(userInfo,userTokenInfo,saveSelectBoardResult,callback){
				if(userInfo==0 || saveSelectBoardResult==0)
					callback(null,0,0);
				else{
					SelectBoardController.dateListSelectBoard(userInfo.userId,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			},
			function(userInfo,userTokenInfo,selectBoardExitResult,callback){
				if(userInfo==0 || selectBoardExitResult==0)
					callback(null,0,userTokenInfo,0);
				else{
					SelectBoardController.listSelectBoard(userInfo.userId,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			},
			function(userInfo,userTokenInfo,selectBoardList,callback){
				if(userInfo==0)
					callback(null,userInfo,0);
				else if(selectBoardList==0){
					callback(null,userInfo,1);
				}
				else{
					var max=Object.keys(selectBoardList).length;
					var randomnum=Math.floor(Math.random()*(max));
					callback(null,userInfo,userTokenInfo,selectBoardList[randomnum]);
				}
			}
		],function(err,userInfo,userTokenInfo,selectBoardDetailResult){
			if(err)
				console.log(err);
			else if(userInfo==0 && selectBoardDetailResult==0){
				var files=[req.files[0].path,req.files[1].path];
				deleteFiles(files,function(err){
					if(err)
						console.log(err);
				});
				
				output.data="success";
				output.msg="저장실패";
				res.json(output);
			}
			else if(selectBoardDetailResult==1){
				output.data="success";
				output.userToken=userTokenInfo.userToken;
				output.msg="표시할데이터가 없습니다";
				res.json(output);
			}
			else{
				output.data="success";
				output.userToken=userTokenInfo.userToken;
				output.msg=selectBoardDetailResult;
				res.json(output);
			}
		});
}
exports.listSelectBoard=function(req,res,next){
	async.waterfall([
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
					else if(result==0)
						callback(null,result,userTokenInfo);
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,userInfo,userTokenInfo,0);
				else{
					SelectBoardController.listSelectBoard(userInfo.userId,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
						
					});
				}
			},
			function(userInfo,userTokenInfo,selectBoardList,callback){
				if(userInfo==0 && selectBoardList==0)
					callback(null,userInfo,userTokenInfo,selectBoardList);
				else if(userInfo!=0 && selectBoardList==0)
					callback(null,userInfo,userTokenInfo,selectBoardList);
				else{
					var max=Object.keys(selectBoardList).length;
					var randomnum=Math.floor(Math.random()*(max));
					callback(null,userInfo,userTokenInfo,selectBoardList[randomnum]);
				}
			}
		],function(err,userInfo,userTokenInfo,selectBoardDetailResult){
			console.log(userInfo);
			console.log(selectBoardDetailResult);
			if(err)
				console.log(err);
			else if(userInfo==0 && selectBoardDetailResult==0){
				output.msg="success";
				output.data="실패";
				res.json(output);
			}
			else if(userInfo!=0 && selectBoardDetailResult==0){
				output.msg="success";
				output.userToken=userTokenInfo.userToken;
				output.data="더이상표시할 게시물이 없다";
				res.json(output);
			}
			else{
				output.msg="success";
				output.userToken=userTokenInfo.userToken;
				output.data=selectBoardDetailResult;
				res.json(output);
			}
		});
}
exports.stopSelectBoard=function(req,res,next){
	async.waterfall([
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
					else if(result==0)
						callback(null,result,userTokenInfo);
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,userInfo,userTokenInfo,0);
				else{
					SelectBoardController.detailSelectBoard(req.params.selectBoardId,function(err,result){
						if(err)
							console.log(err);
						else if(result.selectboardUserId==userInfo.userId)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,0);
					});
				}
			},
			function(userInfo,userTokenInfo,selectBoardCheck,callback){
				if(userInfo==0 || selectBoardCheck==0)
					callback(null,0,userTokenInfo,0);
				else{
					SelectBoardController.stopSelectBoard(req.params.selectBoardId,function(err,result){
						
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			}
		],function(err,userInfo,userTokenInfo,selectBoardStopResult){
			if(userInfo ==0 || selectBoardStopResult ==0){
				output.msg="success";
				output.data="투표중지실패";
				res.json(output);
			}
			else{
				output.msg="success";
				output.data={
					userToken:userTokenInfo.userToken,
					msg:"투표가 중지되었습니다"
				}
				res.json(output);
			}
		});
}
exports.boteSelectBoard=function(req,res,next){
	async.waterfall([
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
					else if(result==0)
						callback(null,result,userTokenInfo);
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,0,userTokenInfo,0);
				else{
					SelectBoardController.boteSelectBoard(req.params.selectBoardId,req.params.bote,userInfo,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			},
			function(userInfo,userTokenInfo,selectBoardBoteResult,callback){
				if(userInfo==0 || selectBoardBoteResult==0)
					callback(null,0,userTokenInfo,0);
				else{
					SelectBoardController.listSelectBoard(userInfo.userId,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,1);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			},
			function(userInfo,userTokenInfo,selectBoardList,callback){
				if(userInfo==0 && selectBoardList==0)
					callback(null,userInfo,userTokenInfo,selectBoardList);
				else if(userInfo!=0 && selectBoardList==1)
					callback(null,userInfo,userTokenInfo,selectBoardList);
				else{
					var max=Object.keys(selectBoardList).length;
					var randomnum=Math.floor(Math.random()*(max));
					callback(null,userInfo,userTokenInfo,selectBoardList[randomnum]);
				}
			},
		],function(err,userInfo,userTokenInfo,selectBoardDetailResult){
			if(err)
				console.log(err);
			else if(userInfo==0 && selectBoardDetailResult==0){
				output.msg="success";
				output.data="실패";
				res.json(output);
			}
			else if(userInfo!=0 && selectBoardDetailResult==1){
				output.msg="success";
				output.userToken=userTokenInfo.userToken;
				output.data="더이상표시할 게시물이 없다";
				res.json(output);
			}
			else{
				output.msg="success";
				output.userToken=userTokenInfo.userToken;
				output.data=selectBoardDetailResult;
				res.json(output);
			}
		});
}
exports.deleteSelectBoard=function(req,res,next){
	async.waterfall([
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
					else if(result==0)
						callback(null,result,userTokenInfo);
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,0,userTokenInfo,0);
				else{
					SelectBoardController.detailSelectBoard(req.params.selectBoardId,function(err,result){
						if(err)
							console.log(err);
						else if(result.selectboardUserId==userInfo.userId)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,0);
					});
				}
			},
			function(userInfo,userTokenInfo,selectBoardCheck,callback){
				if(userInfo==0 || selectBoardCheck==0)
					callback(null,0,userTokenInfo,0);
				else{
					var after_time=moment().add(30,'days');
					var day=after_time.format('DD');
					var month=after_time.format('MM');
					var year=after_time.format('YYYY');
					var deleteTime=year+month+day;
					
					
					SelectBoardController.deleteTimeSelectBoard(req.params.selectBoardId,deleteTime,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,0,userTokenInfo,0);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			}
		],function(err,userInfo,userTokenInfo,selectBoardDeleteResult){
			if(err)
				console.log(err);
			else if(userInfo==0 || selectBoardDeleteResult==0){
				output.msg="success";
				output.data="삭제못함";
				res.json(output);
			}
			else{
				output.msg="success";
				output.userToken=userTokenInfo.userToken;
				output.data="삭제성공";
				res.json(output);
			}
		});
}

