(function () {
	var serverPort = 1539;

	var http        = require( 'http' );
	var db          = require( './Database' );
	var User        = require( './User' );
	var querystring = require('querystring');

	module.exports.Manager = function ( database ) {

		var _this = this;
		var _users = {};

		(function () {

			function postHandler ( url, post ) {
				switch ( url ) {
					case '/update':
						console.log( 'Update user ' + post.email );
						if ( _users.hasOwnProperty( post.email ) ) {
							db.getUser( post.email, _users[post.email].update );
						} else {
							_this.createUser( post.email )
						}
						break;
					default:
						res.writeHead( 404, {'Content-Type': 'text/plain'} );
						res.end( '' );
						break;
				}
			}

			var server = http.createServer( function( req, res ) {
				if ( req.method === "POST" ) {
					var body = '';
					req.on( 'data', function ( data ) {
						body += data;
						if ( body.length > 1e6 ) {
							response.writeHead( 413, {'Content-Type': 'text/plain'} );
							req.connection.destroy();
						}
					});
					
					req.on('end', function() {
						res.writeHead( 200, "OK", {'Content-Type': 'text/html'} );
						var post = querystring.parse( body );

						setTimeout(postHandler, 500, req.url, post );

						res.end();
					});
				}
			});

			server.listen( serverPort );
			console.log( 'Server listening on port ' + serverPort );
		})();

		this.createUser = function ( email ) {
			db.getUser( email, finishCreateUser );
		};

		function finishCreateUser ( id, email, refresh_token, timezone, override, override_mode, calendar_id ) {
			if ( _users[email] ) {
				return false;
			}
			console.log( 'User created (' + email + ')' );
			return ( _users[email] = new User( id, email, refresh_token, timezone, override, override_mode, calendar_id, db ) );
		};

		this.removeUser = function ( email ) {
			_users[email].destroy();
			delete _users[email];
			console.log( 'User destroyed (' + email + ')' );
		};

		setInterval( function () {
			db.getUsers( finishCreateUser );
		}, 5 * 60 * 1000 );

		setTimeout(db.getUsers, 1000, finishCreateUser );
	}
})();