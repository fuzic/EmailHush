(function () {
	module.exports = function ( id, email, refresh_token, timezone, override, override_mode, calendar_id, db ) {
		require('js-yaml');

		var Mailbox  = require( './Mailbox' );
		var Calendar = require( './Calendar' );
		var xoauth2  = require( 'xoauth2' );
		var opts     = require( '../config/googleapi.yml' );

		var _this = this;
		var _db = db;
		var _mailbox, _calendar,
		_override = override,
		_override_mode = override_mode;

		this.email = email;
		this.id = id;
		this.timezone = timezone;

		var xoauth2gen = xoauth2.createXOAuth2Generator({
			user: email,
			clientId: opts.api_id,
			clientSecret: opts.api_secret,
			refreshToken: refresh_token
		});

		this.auth_token = function ( cb ) {
			xoauth2gen.getToken( function ( err, token ) {
				if ( err ) console.log( err );
				
				cb( token );
			});
		}

		this.access_token = function ( cb ) {
			xoauth2gen.getToken( function ( err, token, access_token ) {
				if ( err ) throw( err );

				if (!access_token) {
					xoauth2gen.generateToken( function ( err, token, access_token ) {
						if ( err ) throw( err );
						cb( access_token );
					} );
				} else {
					cb( access_token );
				}
			});
		}

		this.tallyMail = function (receive, deliver) {
			_db.tallyReceive(this.id, receive);
			_db.tallyDeliver(this.id, 15*Math.floor((deliver.getTime() - receive.getTime()) / (15*60000)), deliver);
		}

		this.is_receiving = function ( cb ) {
			if ( _override === 1 ) {
				return cb( _override_mode === 1 );
			}

			return _calendar.is_active( Date.now(), cb );
		}

		this.update = function ( id, email, refresh_token, timezone, override, override_mode, calendar_id ) {
			_override = override,
			_override_mode = override_mode;

			this.timezone = timezone;
		}

		_mailbox = new Mailbox(this);
		_calendar = new Calendar(this, calendar_id);
	}
})();