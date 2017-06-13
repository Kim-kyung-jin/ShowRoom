//앱 옷 기본 정보보기 
exports.showAppClothList= {
	basic :'select \
		  cloth.clothNumber,\
		  cloth.clothName,\
		  cloth.clothPhoto,\
		  cloth.clothPrice,\
		  cloth.clothUrl,\
		  category.categoryCode,\
		  category.categoryColor,\
		  category.categoryDescription,\
		  shop.shopName,\
		  shop.shopPhoto\
		  from cloth \
		  left join cloth_category on cloth.clothNumber = cloth_category.clothNumber \
		  left join category on category.categoryCode = cloth_category.categoryCode \
		  left join cloth_shop on cloth_shop.clothNumber = cloth.clothNumber\
		  left join shop on cloth_shop.shopName = shop.shopName'
} 

//옷 정보보기 
exports.showClothList='select \
	  cloth.clothNumber,\
	  cloth.clothName,\
	  cloth.clothPhoto,\
	  cloth.clothPrice,\
	  cloth.clothType,\
	  cloth.cloth1Size, \
	  cloth.cloth2Size, \
	  cloth.cloth3Size, \
	  cloth.cloth4Size, \
	  cloth.cloth5Size, \
	  cloth.cloth6Size, \
	  cloth.cloth7Size, \
      cloth.cloth8Size, \
      cloth.cloth9Size, \
      cloth.cloth10Size, \
  	  cloth.cloth11Size, \
  	  cloth.clothFreeSize, \
	  cloth.clothUrl,\
	  shop.shopName,\
	  category.categoryCode,\
	  category.categoryColor,\
	  category.categoryDescription\
	  from cloth \
	  left join cloth_category on cloth.clothNumber = cloth_category.clothNumber \
	  left join category on category.categoryCode = cloth_category.categoryCode\
	  left join cloth_shop on cloth.clothNumber = cloth_shop.clothNumber\
	  left join shop on shop.shopName = cloth_shop.shopName  where shop.shopName = ?'

	
//웹 상세보기 
exports.showDeTailCloth='select \
	cloth.clothNumber,\
	cloth.clothName,\
	cloth.clothPhoto,\
	cloth.clothPrice,\
	cloth.clothType,\
	cloth.cloth1Size, \
	cloth.cloth2Size, \
	cloth.cloth3Size, \
	cloth.cloth4Size, \
	cloth.cloth5Size, \
	cloth.cloth6Size, \
	cloth.cloth7Size, \
	cloth.cloth8Size, \
	cloth.cloth9Size, \
	cloth.cloth10Size, \
	cloth.cloth11Size, \
	cloth.clothFreeSize, \
	cloth.clothUrl,\
	shop.shopName,\
	category.categoryCode,\
	category.categoryColor,\
	category.categoryDescription\
	from cloth \
	left join cloth_category on cloth.clothNumber = cloth_category.clothNumber \
	left join category on category.categoryCode = cloth_category.categoryCode\
	left join cloth_shop on cloth.clothNumber = cloth_shop.clothNumber\
	left join shop on shop.shopName = cloth_shop.shopName  where cloth.clothNumber = ?'

	
//웹 상세보기전 데이터 
exports.showDeTailBeforeCloth='select \
	  cloth.clothnumber,\
	  cloth.clothname,\
	  cloth.clothphoto,\
	  cloth.clothtype,\
	  cloth.clothprice,\
	  category.categorycode,\
	  category.categorydescription\
	  from cloth \
	  left join cloth_category on cloth.clothnumber = cloth_category.clothnumber \
	  left join category on category.categorycode = cloth_category.categorycode\
	  left join cloth_shop on cloth.clothnumber = cloth_shop.clothnumber\
	  left join shop on shop.shopname = cloth_shop.shopname  where shop.shopname = ?'
	
//타입별 옷 정보보기 
exports.showClothTypeList='select \
	  cloth.clothNumber,\
	  cloth.clothName,\
	  cloth.clothPhoto,\
	  cloth.clothPrice,\
	  cloth.clothType,\
	  cloth.cloth1Size, \
	  cloth.cloth2Size, \
	  cloth.cloth3Size, \
	  cloth.cloth4Size, \
	  cloth.cloth5Size, \
	  cloth.cloth6Size, \
	  cloth.cloth7Size, \
      cloth.cloth8Size, \
      cloth.cloth9Size, \
      cloth.cloth10Size, \
  	  cloth.cloth11Size, \
  	  cloth.clothFreeSize, \
	  cloth.clothUrl,\
	  shop.shopName,\
	  category.categoryCode,\
	  category.categoryColor,\
	  category.categoryDescription\
	  from cloth \
	  left join cloth_category on cloth.clothNumber = cloth_category.clothNumber \
	  left join category on category.categoryCode = cloth_category.categoryCode\
	  left join cloth_shop on cloth.clothNumber = cloth_shop.clothNumber\
	  left join shop on shop.shopName = cloth_shop.shopName  where shop.shopName = ? and clothType = ?'
	
	
	
//옷 등록
exports.addCloth = {
	clothInsert : 'insert into cloth set ?',
	newClothNumber : 'select clothNumber from cloth order by clothNumber desc limit 1',
	clothPrice : 'select clothPrice from cloth order by clothNumber desc limit 1',
	cloth_Category : 'insert into cloth_category set ?',
	cloth_shop : 'insert into cloth_shop set ?',
}

//옷 수정
exports.editCloth = {
	clothData : 'select * from  cloth where clothNumber=? ',
	updateCloth : 'update cloth set ? where clothnumber=? ',
	updateCloth_category : 'update cloth_category set ? where clothNumber=? ',
	updateCloth_shop : 'update cloth_shop set ? where clothNumber=? ',
	updateClothClick : 'update cloth set clothClickCount = clothClickCount + 1 where clothNumber = ?'
}

//옷 삭제
exports.deleteCloth = {
	deleteCloth : 'delete from cloth where clothNumber=?',
	deleteCloth_category : 'delete from cloth_category where clothNumber=?',
	deleteCloth_shop : 'delete from cloth_shop where clothNumber=?',
	cloth_category : 'select cloth_category.clothNumber,cloth_category.categoryCode,cloth.clothPrice from cloth_category left join cloth on cloth.clothNumber = cloth_category.clothNumber where cloth.clothNumber=?'
}

exports.clothCategoryCode = 'select category.categoryCode \
							 from cloth_category left join category on cloth_category.categoryCode = \
							 category.categoryCode where cloth_category.clothNumber = ?'