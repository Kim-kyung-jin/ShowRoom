//카테고리보기
exports.showCategoryList='SELECT * FROM category orders limit 5 offset ?';    

//카테고리 등록
exports.addCategory = 'insert into category set ?';

//카테고리 수정
exports.editCategory = 'update category set ? where categoryCode=? ';
	
//카테고리 삭제 
exports.deleteCategory = 'delete FROM category where categoryCode = ?';

//카테고리 대분류별 카테고리 번호 가져오기
exports.showCategoryCode='select categoryCode from category where categoryCode like ? ';

// 즐겨찾기한 옷 
exports.showCloth_shopPhoto = 'select \
		cloth.clothnumber, \
		cloth.clothname, \
		cloth.clothphoto, \
		cloth.clothurl, \
		shop.shopname, \
		shop.shopphoto from cloth \
	  	left join cloth_shop on cloth.clothnumber = cloth_shop.clothnumber \
      	left join shop on shop.shopname = cloth_shop.shopname where cloth_shop.clothnumber in (?)'; 

exports.showClothPhoto = 'select cloth.clothNumber,cloth.clothPhoto,cloth.clothPrice,cloth.clothUrl,cloth.clothName,category.categoryDescription from cloth \
						  left join cloth_category on cloth_category.clothNumber = cloth.clothNumber \
						  left join category on cloth_category.categoryCode = category.categoryCode  \
						  where cloth_category.clothNumber in (?)'; 

exports.showCloth = 'select clothNumber,clothName,clothPhoto,clothUrl from cloth where clothNumber in  ( ? )';
//카테고리 코드보기
exports.showClothCode = 'select categoryCode from cloth_category where clothNumber = ?';

//카테고리 등록 중복방지
exports.categorySameCheck = 'select * from category where categoryDescription = ? or categoryCode = ?';