var myShowRoom=require('../controllers/myShowRoom'); 
const safeHandler = require('../utils/safeHandler.js');
exports.setRequestUrl=function(app){
	 app.get('/main',myShowRoom.main);//메인 
	 app.get('/allShopRanking',myShowRoom.findShopRank);//쇼핑몰순위
	 app.get('/codyAgeRanking',myShowRoom.findCodyAgeRank);//나이대별 코디순위
	 app.get('/myShowRoom/FavoriteTagRank',safeHandler.safeHandler(myShowRoom.userFavoriteTag));//유저태그 1~10위 
	
	app.get('/myShowRoom/cody',myShowRoom.codyMybag);//즐겨찾기한 코디보기
	app.get('/myShowRoom/cloth',myShowRoom.clothMybag);//즐겨찾기한 옷보기
	app.get('/myShowRoom/selectBoard',myShowRoom.showMySelectBoard);//내가 쓴 게시판보기(선택)
	app.get('/myShowRoom/board',myShowRoom.showMyBoard);//내가 쓴 게시판 보기
	// app.post('/codyFilter',myShowRoom.codyFilter);//코디필터
	// app.post('/pushTest',myShowRoom.pushTest);//코디필터	
	app.get('/userFavoriteList',safeHandler.safeHandler(myShowRoom.userFavoriteList));//선호로 검사리스트
	app.post('/userFavorite/:type',myShowRoom.userFavorite);//선호도 검사 제출
	
}