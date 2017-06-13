const fs=require('fs');
const multer = require('./multers3.js');
const config = require('config');
exports.safeHandler=function(handler) {
	return function(req,res) {
		handler(req,res).catch(error => {
			let fail = {
				msg:"fail",
				data: error.message
			}
			console.log(fail);
			return res.status(200).send(fail);
		})
	}
}

exports.safeHandler1=function(handler) {
	return function(req,res) {
		handler(req,res).catch(error => {
			let fail = {
				msg:"fail",
				data: error.message
			}
			res.setHeader('shopToken', req.headers.shoptoken);
			res.status(200).send(fail);
		})
	}
}
exports.safeHandler2=function(handler) {
	return function(req,res) {
		handler(req,res).catch(error => {
			let fail = {
				msg:"fail",
				data: error.message
			}
			res.status(500).send(fail);
		})
	}
}
exports.boardImagesafeHandler=function(handler) {
	return function(req,res) {
		handler(req,res).catch(error => {
			// if(req.file){
			// 	let a = multer.errdeleteFile([{Key: req.file.transforms[0].key}]);
			// }
			let fail = {
				msg:"fail",
				data: error.message,
				userToken: req.body.userToken
			}
			res.status(500).send(fail);
		})
	}
}
exports.selectboardImagesafeHandler = function(handler) {
	return function(req,res) {
		handler(req,res).catch(error => {
			if(req.files.leftPhoto[0] && req.files.rightPhoto[0]){
				multer.errdeleteFile([{Key: req.files.leftPhoto[0].key},{Key: req.files.rightPhoto[0].key}]);
			}
			let fail = {
				msg: "fail",
				data: error.message,
				userToken: req.body.userToken
			}
			res.status(500).send(fail);
		})
	}
}
exports.safeHandler4=function(handler) {
	return function(req,res) {
		handler(req,res).catch(error => {
			let fail = {
				msg:"fail",
				data: error.message
			}
			res.status(500).send(fail);
		})
	}
}