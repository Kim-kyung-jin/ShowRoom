const config=require('config');
const passport=require('passport')
	  ,FacebookStrategy=require('passport-facebook').Strategy;
// serialize
// 인증후 사용자 정보를 세션에 저장
passport.serializeUser(function(user, done) {
    console.log('serialize');
    done(null, user);
});

// deserialize
// 인증후, 사용자 정보를 세션에서 읽어서 request.user에 저장
passport.deserializeUser(function(user, done) {
    //findById(id, function (err, user) {
    console.log('deserialize');
    done(null, user);
    //});
});
//페북인증
passport.use(new FacebookStrategy({
	clientID:config.Customer.facebook.clientID,
	clientSecret:config.Customer.facebook.clientSecret,
	callbackURL:config.Customer.facebook.callbackURL,
	profileFields:config.Customer.facebook.profileFields
	},
	function(accessToken,refreshToken,profile,done){
		var providerData=profile._json;
		providerData.accessToken=accessToken;
		providerData.refreshToken=refreshToken;
		var providerUserProfile={
			id:profile.id,
			fullName:profile.displayName,
			email:providerData.email,
			username:profile.displayName,
			gender:profile.gender,
			provider:'facebook',
			accessToken:providerData.accessToken,
			refreshToken:providerData.refreshToken
		}
		console.log(providerUserProfile);
		return done(null,providerUserProfile);
	}
));
exports.facebookLogin=passport.authenticate('facebook',{scope:['public_profile','email']});
exports.facebookcallback=passport.authenticate('facebook',{successRedirect:'/success',failureRedirect:'/fail'});