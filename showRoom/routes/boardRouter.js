const board=require('../controllers/board');
exports.setRequestUrl=function(app){
	app.post('/board/addBoard',board.addBoard); //게시판 추가
	app.post('/board/listBoard/:page',board.listBoard); //게시판 목록보기
	app.put('/boards/:boardId',board.editBoard); //게시판 수정
	app.delete('/boards/:boardId',board.deleteBoard);
	app.post('/boards/:boardId',board.detailBoard); //상세보기
	app.post('/boards/:boardId/comment',board.addComment); //댓글 등록
	app.put('/boards/:boardId/comment/:commentId',board.editComment); //댓글수정
	app.delete('/boards/:boardId/comment/:commentId',board.deleteComment); //댓글삭제
	app.post('/boards/:boardId/like',board.likePushPull); //게시판 좋아요
	app.get('/boards/bestCody',board.pastUserCody); //어제의 베스트 게시물 보기 //초기화시켜주는작업해줘야됨
	
	app.get('/board/todayBestUserCody',board.todayBestUserCody); //오늘베스트코드
	app.get('/board/example',board.example2); //테스트
	
	
}