const SelectBoard=require('../model/Selectdb');


exports.saveSelectBoard = function(data) {
	return new Promise(function(resolve, reject) {
		data.save(function(err, result) {
			if(err)
				reject(new Error("err"));
			else if(result == null)
				reject(new Error("Is not save"));
			else
				resolve(result);
		});
	});
}

exports.saveCheckSelectBoard = function(data, sortset) {
	return new Promise(function(resolve, reject) {
		SelectBoard.find(data).sort(sortset).exec(function(err,result) {
			if(err)
				reject(new Error("err"));
			else if(result.length == 0)
				reject(new Error("Is not data"));
			else{
				if(result.length == 6) {
					result[0].selectboardExit = false;
					result[0].save();
					resolve(true);
				}
				else
					resolve(true);

			}
		});
	});
}
exports.findSelectBoard = function(data,checkId) {
	return new Promise(function(resolve,reject) {
		SelectBoard.findOne(data, function(err,result) {
			if(err)
				reject(new Error("err"));
			else if(result == null)
				reject(new Error("err"));
			else {
				if(result.selectboardUserId == checkId)
					resolve(1);
				else
					reject(new Error("userId is not equal"));
			}
		});
	});
}
exports.updateSelectBoard = function(data, setdata) {
	return new Promise(function(resolve, reject){
		SelectBoard.update(data, setdata,function(err,result){
			if(err)
				reject(new Error("err"));
			else if(result.nModified == 1)
				resolve(result);
			else
				reject(new Error("Selectboard is not update"));
		});
	});
}
exports.removeSelectBoard = function(data) {
	let ImageUrl = [];
	return new Promise(function(resolve, reject) {
		SelectBoard.find(data,function(err,results) {
			if(err)
				reject(new Error("err"));
			else if(results == null)
				resolve(ImageUrl);
			else{
				results.forEach(function(result) {
					ImageUrl.push(result.selectboardLeftPhotoKey);
					ImageUrl.push(result.selectboardRightPhotoKey);
					result.remove();
				});
				resolve(ImageUrl);
			}
		});
	});
}
exports.listSelectFind = function(data) {
	return new Promise(function(resolve, reject) {
		SelectBoard.find(data, function(err,result) {
			if(err)
				reject(new Error("err"));
			else if(result.length == 0)
				resolve(0);
			else 
				resolve(result);
		});
	});
}