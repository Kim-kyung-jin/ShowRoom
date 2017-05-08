var mongoose=require('mongoose');
var express=require('express');
mongoose.Promise = global.Promise;
var Schema=mongoose.Schema;
const fs=require('fs');
const pathUtil=require('path');
const async=require('async');

var CodyScheme=new Schema({
	codyUserClickAge : {type:[Number], 'default':[]},
	codyTag : [String],
	codyPrice : Number,
	codyShopPhoto : String,
	codyShopName : String,
	codyWeather : {type:[Number], 'default':[]},
	codyDegree : {type:[Number], 'default':[]},
	codyScheduleContent : {type:[Number], 'default':[]},
	codyPhoto : String,
	codyClothNumber : {type:[Number], 'default':[]},
	codyShopName : String,
	codyCategoryCode : {type:[String], 'default':[]},
	codyStarUsers : [String]
});

const CodyModel = mongoose.model('Cody', CodyScheme);
module.exports = CodyModel;
