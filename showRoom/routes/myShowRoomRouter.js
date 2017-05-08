var myShowRoom=require('../controllers/myShowRoom'); 
exports.setRequestUrl=function(app){
	
	app.post('/main',myShowRoom.main);//메인 
	 app.get('/codyRanking',myShowRoom.codyRank);//코디순위
	 app.get('/shopRanking',myShowRoom.shopRank);//쇼핑몰순위
	 app.get('/cody10Ranking',myShowRoom.cody10Rank);//10대코디순위
	 app.get('/cody20Ranking',myShowRoom.cody20Rank);//20대코디순위
	 app.get('/cody30Ranking',myShowRoom.cody30Rank);//30대코디순위
	 app.get('/cody40Ranking',myShowRoom.cody40Rank);//40대코디순위
	 app.post('/myShowRoomFavoriteTankRank',myShowRoom.userFavoriteTag);//유저태그 1~10위 
	
	app.post('/myShowRoom/cody',myShowRoom.codyMybag);//즐겨찾기한 코디보기
	app.post('/myShowRoom/cloth',myShowRoom.clothMybag);//즐겨찾기한 옷보기
	app.post('/myShowRoom/selectBoard',myShowRoom.showMySelectBoard);//내가 쓴 게시판보기(선택)
	app.post('/myShowRoom/board',myShowRoom.showMyBoard);//내가 쓴 게시판 보기
	
	// app.post('/codyFilter',myShowRoom.codyFilter);//코디필터
	// app.post('/pushTest',myShowRoom.pushTest);//코디필터	

	app.post('/userFavorite/:type',myShowRoom.userFavorite);//선호도 검사 제출
	app.post('/userFavoriteList',myShowRoom.userFavoriteList);//선호로 검사리스트
}