const fs=require('fs');
exports.safeHandler=function(handler) {
	return function(req,res) {
		handler(req,res).catch(error => {
			if(req.files[0]!=null){
			var PhotoFile = req.files;
			fs.unlink(PhotoFile[0].path,function(err){
				if(err)
					console.log(err);
			});
		}
			let fail = {
				msg:"fail",
				data: error.message
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

