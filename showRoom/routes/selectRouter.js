const selectBoard=require('../controllers/selectBoard');
exports.setRequestUrl=function(app){
	app.post('/selectBoard/addBoard',selectBoard.addSelectBoard); //게시판 추가
	
	app.post('/selectBoard/getRandomList',selectBoard.listSelectBoard); //게시판 목록보기
	app.post('/selectBoardsStop/:selectBoardId/stop',selectBoard.stopSelectBoard); //투표중지
	app.post('/selectBoards/:selectBoardId/:bote',selectBoard.boteSelectBoard); //게시판 투표
	app.delete('/selectBoards/:selectBoardId',selectBoard.deleteSelectBoard); //투표삭제
}