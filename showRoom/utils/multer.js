const multer=require('multer');
const mkdirp = require('mkdirp');
const path=require('path');
const moment=require('moment');
const randomstring =require('randomstring');
var saveDay=new moment().format("YYYY-MM-DD");
const qwee=exports.abc=
        multer.diskStorage({
        destination:function(req,abc,file,cb){
            if(file.fieldname=='userPhoto'){
                var saveFolder='./public/uploads/userPhoto/'+saveDay;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
            else if(file.fieldname=='boardPhoto'){
                var saveFolder='./public/uploads/boardPhoto/'+saveDay;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
            else if(file.fieldname=='leftPhoto'){
                var saveFolder='./public/uploads/leftPhoto/'+saveDay+abc;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
            else if(file.fieldname=='rightPhoto'){
                var saveFolder='./public/uploads/rightPhoto/'+saveDay+abc;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
            else if(file.fieldname=='shopPhoto'){
                var saveFolder='./public/uploads/shopPhoto/'+saveDay;
                mkdirp(saveFolder, function (err) {
                    if (err) console.error(err)
                    else console.log('pow!')
                });
                cb(null,saveFolder);
            }
        },
        
        filename:function(req,file,cb){
            var randomStr=randomstring.generate(6);
            cb(null,file.fieldname+'-'+randomStr+'-'+Date.now()+path.extname(file.originalname));
        }
    });

exports.qwe=multer({
        storage:qwee,
        limits:{fileSize:5120000},
        fileFilter: function (req, file, cb) {
            if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
                cb(null, file);
            }
            else if(file==null){
                cb(null,file);
                console.log("널값임");
                //cb(new Error('error'));
            }
        }
        }).any()
