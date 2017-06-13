const board=require('../controllers/board');
const safeHandler = require('../utils/safeHandler.js');
const multer = require('../utils/multers3.js');

exports.setRequestUrl=function(app){
	app.post('/board/addBoard',multer.boardPhoto,safeHandler.boardImagesafeHandler(board.addBoard)); //게시판 추가
	app.get('/board/listBoard/:page',safeHandler.safeHandler(board.listBoard)); //게시판 목록보기
	app.put('/boards/:boardId',multer.boardPhoto,safeHandler.boardImagesafeHandler(board.editBoard)); //게시판 수정
	app.delete('/boards/:boardId',safeHandler.safeHandler(board.deleteBoard));//게시판삭제
	app.get('/boards/:boardId/:page',safeHandler.safeHandler(board.detailBoard)); //상세보기
	app.post('/boards/:boardId/comment',safeHandler.safeHandler(board.addComment)); //댓글 등록
	app.put('/boards/:boardId/comment/:commentId',safeHandler.safeHandler(board.editComment)); //댓글수정
	app.delete('/boards/:boardId/comment/:commentId',safeHandler.safeHandler(board.deleteComment)); //댓글삭제
	app.post('/boards/:boardId/like',safeHandler.safeHandler(board.likePushPull)); //게시판 좋아요
	app.get('/boards/pastCody',safeHandler.safeHandler2(board.pastUserCody)); //역대게시물
	app.get('/boarddelete',safeHandler.safeHandler2(board.deleteBoardSche));
	
}