const BoardController=require('../utils/boardController.js')
	  ,UserController=require('../utils/userController.js')
	  ,Board=require('../model/Boarddb'); 
const async=require('async');
const config=require('config');
const fs=require('fs');
const moment=require('moment');
const jsonWebToken=require('../utils/jsonWebToken');

moment.locale("ko");
var output=new Object();
exports.example=function(req,res,next){
	var board=new Board();
	board.boardUserId=req.body.userId;
	board.boardAge=req.body.userAge;
	board.save();
}
exports.example1=function(req,res,next){
	Board.update({_id:req.body.boardId},{"$push":{"boardAge":req.body.userAge}},function(err,result){
		
	});
}
exports.example2=function(req,res,next){
	BoardController.example123(function(err,result){
		console.log(result);
	});

}

//게시판 목록 보기
exports.listBoard=function(req,res,next){
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
						callback(null,0,userTokenInfo);
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,0,0);
				else{
					BoardController.getBoardFindListPaging(userInfo.userId,req.params.page,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userTokenInfo,result);
						else
							callback(null,userTokenInfo,result);
					});
				}
			}
		],function(err,userTokenInfo,boardListResult){
			if(err)
				console.log(err);
			else if(boardListResult==0){
				output.msg="success";
				output.data={
					msg:"데이터없음"
				}
				res.json(output);
			}
			else{
				output.msg="success";
				output.data={
					userToken:userTokenInfo.userToken,
					result:boardListResult
				}
				res.json(output);
			}
		});
}

// 게시판 등록
exports.addBoard=function(req,res,next){
	var board=new Board();
	var current_time=new moment().format("YYYY-MM-DD HH:mm:ss");
	var PhotoFile=req.files;
	var strArray=PhotoFile[0].path.split('/');
	
	board.boardPhoto=config.Customer.imageurl+'/'+strArray[1]+'/'+strArray[2]+'/'+strArray[3]+'/'+strArray[4];
	board.boardContent=req.body.boardContent;
	board.boardTodayCount=0;
	board.boardBestCody=false;
	board.boardOnOff=true;
	board.boardDatetime=current_time;

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
					callback(null,userInfo,userTokenInfo,0)
				else{
					board.boardUserId=userInfo.userId;
					board.boardUserName=userInfo.userName;
					BoardController.saveBoard(board,function(err,result){
						if(err)
							console.log(err);
						else
							callback(null,userTokenInfo,result);
					});
				}
			}
		],function(err,userTokenInfo,saveBoardResult){
			if(err)
				console.log(err);
			else if(saveBoardResult==0){
				fs.unlink(PhotoFile[0].path,function(err){
					if(err)
						console.log(err);
				});
				output.msg="success";
				output.data="저장 실패";
				res.json(output);
			}
			else{
				output.msg="success";
				output.data={
					userToken:userTokenInfo.userToken,
					result:saveBoardResult
				}
				res.json(output);
			}
		});
}
//게시판 상세보기
exports.detailBoard=function(req,res,next){
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
					callback(null,userTokenInfo,0);
				else{
					BoardController.detailFindboard(req.params.boardId,userInfo.userId,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userTokenInfo,result);
						else
							callback(null,userTokenInfo,result);
					});
				}
			}
		],function(err,userTokenInfo,boardDetailResult){
			if(err)
				console.log(err);
			else if(boardDetailResult==0){
				output.msg="success";
				output.data="데이터 없음";
				res.json(output);
			}
			else{
				output.msg="success";
				output.userToken=userTokenInfo.userToken;
				output.data=boardDetailResult;
				res.json(output);
			}
		});
}
//게시물 수정
exports.editBoard=function(req,res,next){
	var board=new Board();
	var PhotoFile=req.files;
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
						callback(null,0,userTokenInfo);
					else
						callback(null,result,userTokenInfo);
				});	
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,userInfo,userTokenInfo,0);
				else{
					BoardController.detailFindboard(req.params.boardId,userInfo.userId,function(err,result){
						console.log(result);
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else if(result[0].boardUserId==userInfo.userId)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,0);
							
					});
				}
			},
			function(userInfo,userTokenInfo,boardDetail,callback){
				
				if(userInfo==0 || boardDetail==0){
					fs.unlink(PhotoFile[0].path,function(err){
						if(err)
							console.log(err);
					});
					callback(null,0,userTokenInfo,0);
				}
				else
					if(req.body.boardContent==0){
						
						var strArray=boardDetail[0].boardPhoto.split('/');
						var ImageUrl='public/'+strArray[3]+'/'+strArray[4]+'/'+strArray[5];
						fs.unlink(ImageUrl,function(err){
							if(err)
								console.log(err);
						});;
						var changePhoto=config.Customer.imageurl+'/uploads/'+PhotoFile[0].fieldname+'/'+PhotoFile[0].filename;
						BoardController.updateBoardPhoto(boardDetail[0]._id,changePhoto,function(err,result){
							if(err)
								console.log(err);
							else if(result==0)
								callback(null,userInfo,userTokenInfo,result);
							else
								callback(null,userInfo,userTokenInfo,result);
						});
					}
				
					else if(PhotoFile[0]==null){
						BoardController.updateBoardContent(boardDetail[0]._id,req.body.boardContent,function(err,result){
							if(err)
								console.log(err);
							else if(result==0)
								callback(null,userInfo,userTokenInfo,result);
							else
								callback(null,userInfo,userTokenInfo,result);
						});
					}
					else{
						var strArray=boardDetail[0].boardPhoto.split('/');
						var ImageUrl='public/'+strArray[3]+'/'+strArray[4]+'/'+strArray[5];
						fs.unlink(ImageUrl,function(err){
							if(err)
								console.log(err);
						});;
						var changePhoto=config.Customer.imageurl+'/uploads/'+PhotoFile[0].fieldname+'/'+PhotoFile[0].filename;
						BoardController.updateBoardAll(boardDetail[0]._id,changePhoto,req.body.boardContent,function(err,result){
							if(err)
								console.log(err);
							else if(result==0)
								callback(null,userInfo,userTokenInfo,result);
							else
								callback(null,userInfo,userTokenInfo,result);
						});
					}
			}
		],function(err,userInfo,userTokenInfo,boardEditResult){
			if(err)
				console.log(err);
			else if(userInfo==0 || boardEditResult==0){
				fs.unlink(PhotoFile[0].path,function(err){
					if(err)
						console.log(err);
				});
				output.msg="success";
				output.data="수정권한 없음";
				res.json(output);
			}
			else{
				output.msg="success";
				output.data={
					msg:"수정완료",
					userToken:userTokenInfo.userToken
				}
				res.json(output);
			}
		});
}
//게시판 삭제
exports.deleteBoard=function(req,res,next){
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
					BoardController.detailFindboard(req.params.boardId,userInfo.userId,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else if(result[0].boardUserId==userInfo.userId)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,0);
							
					});
				}
			},
			function(userInfo,userTokenInfo,boardDetail,callback){
				console.log(boardDetail);
				if(userInfo==0 || boardDetail==0)
					callback(null,userInfo,userTokenInfo,boardDetail);
				else{
					BoardController.removeBoard(req.params.boardId,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			}
		],function(err,userInfo,userTokenInfo,boardDeleteResult){
			if(err)
				console.log(err)
			else if(boardDeleteResult==0){
				output.msg="success";
				output.data="삭제권한 없음";
				output.token=userTokenInfo.userToken;
				res.json(output);
			}
			else{
				output.msg="success";
				output.data="삭제완료";
				output.token=userTokenInfo.userToken;
				res.json(output);
			}
		});
}
//게시판 댓글 달기
exports.addComment=function(req,res,next){
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
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,0);
				else{
					var comments={
						boardCommentsUserId:userInfo.userId,
						boardCommentsName:userInfo.userName,
						boardCommentsContent:req.body.commentsContent
					}
					BoardController.addBoardComment(req.params.boardId,comments,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			}
		],function(err,userInfo,userTokenInfo,addBoardCommentResult){
			if(err)
				console.log(err)
			else if(addBoardCommentResult==0){
				output.msg="success";
				output.data="등록실패";
				res.json(output);
			}
			else{
				output.msg="success";
				output.userToken=userTokenInfo.userToken;
				output.data="등록성공";
				res.json(output);
			}
		});
}
//게시판 댓글 수정
exports.editComment=function(req,res,next){
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
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,userInfo,userTokenInfo,0);
				else{
					BoardController.findBoardComment(req.params.boardId,req.params.commentId,function(err,result){
						
						if(err)
							console.log(err);
						else if(result.boardComments[0].boardCommentsUserId==userInfo.userId)
							callback(null,userInfo,userTokenInfo,1);
						else
							callback(null,userInfo,userTokenInfo,0);
					});
				}
			},
			function(userInfo,userTokenInfo,boardDetailComment,callback){
				
				if(boardDetailComment==0)
					callback(null,userInfo,userTokenInfo,0);
				else{
					var comment={
						"_id":req.params.commentId,
						"boardCommentsUserId":userInfo.userId,
						"boardCommentsName":userInfo.userName,
						"boardCommentsContent":req.body.commentContent
					}
					BoardController.editBoardComment(req.params.boardId,req.params.commentId,comment,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			}
		],function(err,userInfo,userTokenInfo,editBoardCommentResult){
			if(err)
				console.log(err);
			else if(editBoardCommentResult==0){
				output.msg="success";
				output.data="수정못함";
				output.userToken=userTokenInfo.userToken;
				res.json(output);
			}
			else{
				output.msg="success";
				output.data="수정성공";
				output.userToken=userTokenInfo.userToken;
				res.json(output);
			}
		});
}
//게시판 댓글 삭제
exports.deleteComment=function(req,res,next){
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
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				if(userInfo==0)
					callback(null,userInfo,userTokenInfo,0);
				else{
					BoardController.findBoardComment(req.params.boardId,req.params.commentId,function(err,result){
						if(err)
							console.log(err);
						else if(result.boardComments[0].boardCommentsUserId==userInfo.userId)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			},
			function(userInfo,userTokenInfo,boardDetailComment,callback){
				if(userInfo==0 || boardDetailComment==0)
					callback(null,userInfo,userTokenInfo,0);
				else{
					BoardController.deleteBoardComment(req.params.boardId,req.params.commentId,function(err,result){
						if(err)
							console.log(err);
						else if(result==1)
							callback(null,userInfo,userTokenInfo,result);
						else
							callback(null,userInfo,userTokenInfo,result);
					});
				}
			}
		],function(err,userInfo,userTokenInfo,deleteBoardCommentResult){
			if(err)
				console.log(err);
			else if(deleteBoardCommentResult==0){
				output.msg="success";
				output.data="삭제실패";
				output.userToken=userTokenInfo.userToken;
				res.json(output);
			}
			else{
				output.msg="success";
				output.data="삭제성공";
				output.userToken=userTokenInfo.userToken;
				res.json(output);
			}
		});
}
//게시판 좋아요
exports.likePushPull=function(req,res,next){
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
					else
						callback(null,result,userTokenInfo);
				});
			},
			function(userInfo,userTokenInfo,callback){
				console.log(userInfo);
				if(userInfo==0)
					callback(null,userInfo,userTokenInfo,0);
				else{
					if(req.body.boardLike=="true"){
						BoardController.likeBoardtrue(req.params.boardId,userInfo.userId,function(err,result){
							if(err)
								console.log(err);
							else if(result==1)
								callback(null,userInfo,userTokenInfo,result);
							else
								callback(null,userInfo,userTokenInfo,result);
						});
					}
					else{
						BoardController.likeBoardfalse(req.params.boardId,userInfo.userId,function(err,result){
							if(err)
								console.log(err);
							else if(result==1)
								callback(null,userInfo,userTokenInfo,result);
							else
								callback(null,userInfo,userTokenInfo,result);
						});
					}
				}
			},
			function(userInfo,userTokenInfo,boardLike,callback){
				if(userInfo==0 || boardLike==0)
					callback(null,userInfo,userTokenInfo,0);
				else
					if(req.body.boardLike=="true"){
						BoardController.getboardTodayCountPlus(req.params.boardId,function(err,result){
							if(err)
								console.log(err);
							else if(result==0)
								callback(null,userInfo,userTokenInfo,result);
							else
								callback(null,userInfo,userTokenInfo,result);
						});
					}
					else{
						BoardController.getboardTodayCountMinus(req.params.boardId,function(err,result){
							if(err)
								console.log(err);
							else if(result==0)
								callback(null,userInfo,userTokenInfo,result);
							else
								callback(null,userInfo,userTokenInfo,result);
						});
					}
			}
		],function(err,userInfo,userTokenInfo,boardLikeResult){
			if(err)
				console.log(err);
			else if(userInfo==0 || boardLikeResult==0){
				output.msg="success",
				output.data="좋아요에러"
				res.json(output);
			}
			else{
				output.msg="success";
				output.data={
					userToken:userTokenInfo.userToken,
					like:req.body.boardLike,
					likeCount:boardLikeResult.boardLikeUsers.length
				};
				res.json(output);
			}
		});
}

//어제의 베스트 유저코디 선정
exports.todayBestUserCody=function(req,res,next){
	async.waterfall([
			function(callback){
				BoardController.getboardTodayBestUserCodyList(function(err,result){
					if(err)
						console.log(err);
					else if(result==0)
						callback(null,result);
					else
						callback(null,result);
				});
			},
			function(getboardTodayBestUserCodyList,callback){
				if(getboardTodayBestUserCodyList==0)
					callback(null,getboardTodayBestUserCodyList);
				else{
					var current_time=new moment().format("YYYY-MM-DD");
					BoardController.getboardTodayBestUserCodyChoise(getboardTodayBestUserCodyList[0]._id,current_time,function(err,result){
						if(err)
							console.log(err);
						else if(result==0)
							callback(null,result);
						else
							callback(null,result);
					});
				}
			}
		],function(err,getboardTodayBestUserCodyListResult){
			if(err)
				console.log(err);
			else if(getboardTodayBestUserCodyListResult==0){
				output.data="success";
				output.msg="오늘자베스트코디없음";
				res.json(output);
			}
			else{
				output.data="success";
				output.msg="오늘자 베스트 코디 선정"
				res.json(output);
			}
		});
}

//어제의 베스트 게시물 보기
exports.pastUserCody=function(req,res,next){
	BoardController.getboardPastUserCody(function(err,result){
		if(err)
			console.log(err);
		else if(result==0){
			output.data="success";
			output.msg="역대베스트코디 없음";
			res.json(output);
		}
		else{
			output.data="success";
			output.msg=result;
			res.json(output);
		}
	});
}