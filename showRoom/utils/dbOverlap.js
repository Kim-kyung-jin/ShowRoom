const pool = require('../utils/db_mysql');
const config=require('config');//


// 쿼리가 하나일때 ,data 없을떄 (sql1개,data 0개)
exports.dbOverlap = function(sql){
	return new Promise(function(resolve, reject) {
 		pool.getConnection(function (err, conn){
			if(err){
				reject(new Error(err));	
			}else{
		  		conn.query(sql,function (err, results){
	     			if(err){
	     				conn.release();
		            	reject(new Error('err'));		       
		            }else{
            			conn.release();
            			resolve(results)
		  			}
		  		});
	  		}
	  	});
 	})
};


//쿼리가 하나일 때,data가 있을 때 (sql 1개,data 1개) 
exports.dbOverlap2 =  function(sql,data){ 
	
	 return new Promise(function(resolve, reject) {
		 pool.getConnection(function (err, conn){
			if(err){
				reject(new Error(err));
			}else{
		  		conn.query(sql,data,function(err,results){
		     		if(err){
		     			conn.release();
			            reject(new Error('err'));		       
		            }else{
		            	conn.release();
		            	resolve(results);
		  			}
		  		});
	  		}
	  	});
	})
}


//쿼리가 두개일 때, beginTransaction이 없을 때 ,(sql 2개,data 1개) 
exports.dbOverlap3 = function(sql,sql2,data){
	return new Promise(function(resolve, reject) {
		pool.getConnection(function (err, conn) {
			if(err){
				reject(new Error(err));	
			}
			conn.query(sql,conn.escape(data),function (err, results){
				if (err) {
					reject(new Error(err));	
				}
				conn.query(sql2,function (err, results) {
					if (err) {
						err.code = 500;
					    conn.release();
			            reject(new Error(err));	
			         }else{
				         conn.release();
				         resolve(results)
			         }
				});
			});            		
		});
	})
};


//쿼리가 두개일 때, beginTransaction이 있을 때 ,(sql 2개,data 2개)
exports.dbOverlap4 = function(conn,sql,sql2,data1,data2){
	return new Promise(function(resolve, reject) {
		pool.getConnection(function (err, conn){
			if(err){
				reject(new Error(err));	
			}else{
				conn.beginTransaction(function (err) {
					conn.query(sql,conn.escape(data1),function (err, results){
						if (err) {
						    conn.release();
			            	reject(new Error('err'));
						}
			            conn.query(sql2, conn.escape(data2), function (err, result){
			            	if (err) {
			            		conn.rollback();
			            		conn.release();
				            	reject(new Error('err'));
		        			}
			            	conn.commit();
			            	conn.release();
			            	resolve(results)
						});
					});	
				})
			}
		})
	});
}