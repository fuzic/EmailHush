(function () {

	var Imap = require( 'imap' );

	module.exports = function (user) {
		var _this = this;
		var _user = user,
		_imap, _last;

		connect();

		function connect () {
			console.log( 'Connecting to IMAP (' + user.email + ')' );
			user.auth_token( finishConnect );
		}

		function die ( err ) {
			console.log( 'Uh oh: ' + err );
			process.exit( 1 );
		}

		function openMailbox ( mailbox, cb ) {
			_imap.connect( function ( err ) {
				if ( err ) die( err );
				_imap.openBox( mailbox, false, cb );
			} );
		}

		function messageHandler ( msg ) {
			console.log('Last: '+msg.uid);
			_last = msg.uid;
			
			msg.on( 'headers', function(hdrs) {
				_imap.delLabels( msg.uid, ['EmailHush'], function () {});

				console.log('Message received: ' + JSON.stringify(msg));
				console.log('    Headers: ' + JSON.stringify(hdrs));
				if (msg['x-gm-labels'].indexOf('\\\\\\\\Inbox') === -1) {
					console.log('    Moving...');
					_imap.delFlags( msg.uid, ['Seen'], function () {});
					_imap.move( msg.uid, 'INBOX', function () {});

					// Message received....
					_user.tallyMail(new Date(hdrs.date), new Date());
				}
			} );
		}

		function refresh ( from ) {
			user.is_receiving( fetchMail( from ) );
		}

		function fetchMail ( from ) {
			return function ( receiving ) {
				if ( receiving ) {
					try {
						console.log('fetch from: '+from);
						var fetch = _imap.seq.fetch( from + ':*', { struct : false }, {
							headers : 'date subject',
							body : false,
							cb : function ( fetch ) {
								fetch.on( 'message', messageHandler );
							}
						}, function ( err ) {
							if ( err ) throw err;
						} );
					} catch ( e ) {
						console.log( 'Reconnecting ' + _user.email );
						connect();
					}
				}
			}
		}

		function finishConnect( token ) {
			_imap = new Imap( {
				username: user.email,
				xoauth2: token,
				host: 'imap.gmail.com',
				port: 993,
				secure: true
			} );

			openMailbox( 'EmailHush', function ( err, mailbox ) {
				if ( err ) throw err;

				_last = mailbox.messages.total;
				console.log('Last init: '+_last);
				_imap.on( 'mail', function ( n ) {
					if ( isNaN( _last ) ) {
						_last = 0;
						console.log('Last was NaN');
					}
					refresh( _last + 1 );
				} );

				setInterval( refresh, 5*1000, 1 );
				refresh( 1 );
			} );
		}
	};
})();