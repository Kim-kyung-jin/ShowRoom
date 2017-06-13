const codyModel = require('../model/CodyModel.js'); 
//mongodb 등록모듈
exports.addDate = function(data){
	return new Promise(function(resolve, reject){	
		data.save(function (err, result) {
		    if (err){
		        reject(new Error("add error"));
		    }else{
		    	resolve(result);
		    }
		});
	})
};


//mongodb update문
exports.updateDate = function(model,findData,updateData){
	return new Promise(function(resolve, reject){
		model.update(findData,updateData,function(err,result){
			if(err){
				reject(new Error("update error"));
			}else{
				resolve(result);
			}
		})
	})
};


//mongodb 조건보기 모듈
exports.allShowData = function(model,findData,showData,sortData){
	return new Promise(function(resolve, reject){
		model.find(findData,showData,sortData,function(err,result){
			if(err){
				reject(new Error("find error"));
			}else{
				resolve(result);
			}
		}) 
	})
};

//mongodb 보기모듈
exports.showData = function(model,showData){
	return new Promise(function(resolve, reject){
		model.find(showData,function (err, result) {
		    if (err) {
		        reject(new Error("find error"));
		    }else{
		    	resolve(result);
		    }
		});
	});
};


//mongodb 삭제모듈
exports.deleteData = function(model,deleteData,callback){
	return new Promise(function(resolve, reject){
		model.remove( deleteData ).then(function fulfilled(result) {
			resolve(result);
	    },function rejected(err) {
		    reject(new Error("find error"));
	    });
	})
};

//mongodb aggregate문
exports.aggregate = function(model,findData){
	return new Promise(function(resolve, reject){
		model.aggregate(findData).then(function fulfilled(result) {
			resolve(result);
	    },function rejected(err) {
		    reject(new Error("find error"));
	    });
	})
};

//mongodb aggregate문
exports.aggregateData = function(model,findData){
	return new Promise(function(resolve, reject){
		model.aggregate([findData]).then(
			function fulfilled(result){
		    	resolve(result);
			},
			function rejected(err){
				reject(new Error("find error"));
			}); 
		}) 
};
exports.aggregate1 = function(model, findData) {
	return new Promise(function(resolve, reject) {
		model.aggregate(findData, function(err,result) {
			if(err)
				console.log(err);
			else {

				 resolve(result);
			}
		});
	})
}

//mongodb 수정모듈
exports.editData = function(model,findDate,SetData,callback){
	model.save(
		findDate,{ $set:  SetData },
			function(err,result){
		        if (err) {
		        	console.log("에러발생");
		            callback(err,null);
		        }else {
		        	console.log('성공');
		        	callback(null,result);
	            }
	        }
	);
};