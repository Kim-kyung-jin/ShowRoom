//쇼핑몰 보기
exports.showShopList='select * from shop'; 
//쇼핑몰 수정
exports.editShop = {
	editShop : 'update shop set ? where shopName=?',
	shopPhotoFind : 'select shopPhoto from shop where shopName=?',	
}
//쇼핑몰 등록
exports.addShop = {
	shopInsert : 'insert into shop set ?',
	shopFindOne : 'select shopname from shop order by shopname desc limit 1',	
}
//쇼핑몰 이름만출력
exports.showShopName = 'select shopName from shop  where shopName in (?)'
//쇼핑몰 로그인
exports.shopLogin = 'select shopName,shopPwd from shop where shopName = ? and shopPwd = ?'
exports.findShopName = 'select shoppwd,shopphoto,shopPhotoKey,shopUrl from shop where shopname = ?';