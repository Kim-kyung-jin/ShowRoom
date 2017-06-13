const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const config=require('config');
const moment=require('moment');
const randomstring =require('randomstring');
const sharp = require('sharp');
const jsonWebToken=require('./jsonWebToken');
//const imager = require('multer-imager');

aws.config.update({
	secretAccessKey: config.Customer.AWSInfo.secretAccessKey,
	accessKeyId: config.Customer.AWSInfo.accessKeyId,
	region: config.Customer.AWSInfo.region    
});

let s3 = new aws.S3();
let mimetype ;
let saveDay=new moment().format("YYYY-MM-DD");
let randomStr=randomstring.generate(6);
let upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: config.Customer.AWSInfo.buckname,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		shouldTransform: function(req, file, cb) {
			cb(null, /^image/i.test(file.mimetype))
		},
		transforms: [{
			id: 'original',
			key: async function(req, file, cb) {
				if(file.mimetype == 'image/png'){
					mimetype = '.png';
				}else{
					mimetype = '.jpeg';
				}
				if(file.fieldname == 'boardPhoto') 
					cb(null, 'original/boardImg/'+saveDay+'/'+randomStr+'-'+Math.ceil((Date.now()/100))+mimetype);
				else if(file.fieldname == 'leftPhoto')
					cb(null, 'origin/leftPhotoImg/'+saveDay+'/'+randomStr+'-'+Math.ceil((Date.now()/100))+mimetype);
				else if(file.fieldname == 'rightPhoto')
					cb(null, 'origin/rightPhotoImg/'+saveDay+'/'+randomStr+'-'+Math.ceil((Date.now()/100))+mimetype);
				else if(file.fieldname == 'clothPhoto'){
                	var token =req.headers.shoptoken;
                	var shopToken = await jsonWebToken.TokenCheck(token);
        			var shopName = shopToken.ObjectId;
					cb(null, 'origin/clothPhoto/'+shopName+'/'+saveDay+'/'+randomStr+'-'+Math.ceil((Date.now()/100))+mimetype);
					
				}
				else if(file.fieldname == 'userPhoto')
					 cb(null, 'origin/userPhoto/'+saveDay+'/'+randomStr+'-'+Math.ceil((Date.now()/100))+mimetype);
				else if(file.fieldname == 'shopPhoto')
					cb(null, 'origin/shop/'+req.body.shopName+'/'+randomStr+'-'+Math.ceil((Date.now()/100))+mimetype);
				else if(file.fieldname == 'newShopPhoto'){
                	var token =req.headers.shoptoken;
                	var shopToken = await jsonWebToken.TokenCheck(token);
        			var shopName = shopToken.ObjectId;
					cb(null, 'origin/shop/'+shopName+'/'+randomStr+'-'+Math.ceil((Date.now()/100))+mimetype);
				}
			},
			transform: function(req, file, cb) {
				if(file.mimetype == 'image/jpeg')
					cb(null, sharp().jpeg())
				else if(file.mimetype == 'image/png')
					cb(null, sharp().png())
			}
		}]
	}),
	limits:{fileSize:10000000},
	onFileSizeLimit: function(file) {
		console.log('does not get reported');
	}
});
let uploadCody = multer({
	storage: multerS3({
		s3: s3,
		bucket: config.Customer.AWSInfo.buckname,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		shouldTransform: function(req, file, cb) {
			cb(null, /^image/i.test(file.mimetype))
		},
		transforms: [{
			id: 'original',
			key: async function(req, file, cb) {
				if(file.mimetype == 'image/png'){
					mimetype = '.png';
				}else{
					mimetype = '.jpeg';
				}
				if(file.fieldname == 'codyPhoto'){
					var token =req.headers.shoptoken;
                	var shopToken = await jsonWebToken.TokenCheck(token);
        			var shopName = shopToken.ObjectId;
					cb(null, 'origin/codyPhoto/'+shopName+'/'+saveDay+'/'+randomStr+'-'+Math.ceil((Date.now()/100))+mimetype);
				} 
			},
			transform: function(req, file, cb) {
				if(file.mimetype == 'image/jpeg')
					cb(null, sharp().jpeg())
				else if(file.mimetype == 'image/png')
					cb(null, sharp().png())
			}
		},
		{
			id: 'thumbnail',
			key: async function(req, file, cb) {
				if(file.mimetype == 'image/png'){
					mimetype = '.png';
				}else{
					mimetype = '.jpeg';
				}
				if(file.fieldname == 'codyPhoto') {
					var token =req.headers.shoptoken;
                	var shopToken = await jsonWebToken.TokenCheck(token);
        			var shopName = shopToken.ObjectId;
					cb(null, 'thumbnail/codyPhoto/'+shopName+'/'+saveDay+'/'+randomStr+'-'+Math.ceil((Date.now()/100))+mimetype);
				}
			},
			transform: function(req, file, cb) {
				if(file.mimetype == 'image/jpeg')
					cb(null, sharp().resize(320, 320).jpeg())
				else if(file.mimetype == 'image/png')
					cb(null, sharp().resize(320, 320).jpeg())
			}
		}
		]
	}),
	limits:{fileSize:100000000},
	onFileSizeLimit: function(file) {
		console.log('does not get reported');
	}
});
// var uploadThumbnail = multer({
// 	storage: imager({
// 		dirname: 'avatars',
// 		bucket: config.Customer.AWSInfo.buckname,
// 		accessKeyId: config.Customer.AWSInfo.accessKeyId,
// 		secretAccessKey: config.Customer.AWSInfo.secretAccessKey,
// 		region: config.Customer.AWSInfo.region,
// 		filename: function(req, file, cb) {
// 			console.log(file);
// 			cb(null, Date.now()+'/'+file.originalname);
// 		},
// 		gm: {
// 			width: 320,
// 			height: 320,
// 			options: '!',
// 			format: 'jpg'
// 		},
// 	})
// });

let selectPhoto = upload.fields([{ name: 'leftPhoto', maxCount: 1}, { name: 'rightPhoto', maxCount: 1}]);
let boardPhoto = upload.single('boardPhoto');
let clothPhoto = upload.single('clothPhoto');
let codyPhoto = uploadCody.single('codyPhoto');
let userPhoto = upload.single('userPhoto');
let shopPhoto = upload.single('shopPhoto');
let newShopPhoto = upload.single('newShopPhoto');
//let boardPhoto = upload2.single('boardPhoto');
exports.deleteFile = function(files) {
	console.log(files);
	var options = {
		Bucket: config.Customer.AWSInfo.buckname,
		Delete: {
			Objects: files
		}
	}
	return new Promise(function(resolve, reject) {
		s3.deleteObjects(options, function(err,data) {
			if(err) 
				reject(new Error("err"));
			else
				resolve("success");
		});
	});
} 
function errdeleteFile(files) {
	console.log(files);
	var options = {
		Bucket: config.Customer.AWSInfo.buckname,
		Delete: {
			Objects: files
		}
	}
	s3.deleteObjects(options, function(err,data) {
		if(err)
			console.log(err);
	});
}

exports.boardPhoto = boardPhoto;
exports.selectPhoto = selectPhoto;
exports.clothPhoto = clothPhoto;
exports.codyPhoto = codyPhoto;
exports.shopPhoto = shopPhoto;
exports.userPhoto = userPhoto;
exports.newShopPhoto = newShopPhoto;
exports.upload = upload;
exports.errdeleteFile = errdeleteFile;