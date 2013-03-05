(function () {
	require('js-yaml');

	var https   = require( 'https' );
	var moment  = require( 'moment' );
	var db      = require( './Database' );
	var time    = require( 'time' )( Date );
	var opts    = require( '../config/googleapi.yml' );

	var apiKey = opts.api_key;
	var updateHour = 3;

	module.exports = function ( user, calendarId ) {

		var baseurl = 'www.googleapis.com';
		var api = '/calendar/v3';

		var _updated, _schedule;

		function reload () {
			user.access_token( reloadFinish );
		}

		function reloadFinish ( token ) {
			var request = '/freeBusy?key=' + apiKey;
			var options = {
				host : baseurl,
				path : api + request,
				method : 'POST',
				headers : {
					'Content-Type' : 'application/json',
					'Authorization' : 'Bearer ' + token
				}
			};

			function callback ( response ) {
				var str = '';

				response.on( 'data', function ( chunk ) {
					str += chunk;
				} );

				response.on( 'end', function () {
					console.log( 'Synced calendar (' + user.email + ')' );
					db.setCalendar( user.email, str, loadFinish );
				} );
			}

			var data = JSON.stringify( {
				'timeMin' : (new Date(Date.now() - 1*24*60*60*1000)).toISOString(),
    			'timeMax' : (new Date(Date.now() + 7*24*60*60*1000)).toISOString(),
				'items': [
					{
						'id' : calendarId
					}
				]
			} );

			var req = https.request( options, callback );
			req.write( data );
			req.end();
		}

		function loadFinish ( calendar, updated ) {
			try {
				var d = new Date( updated - updateHour * 60 * 60 * 1000 );

				d.setTimezone( user.timezone );
				
				var adjusted = new Date( d.toDateString() ),
				delta = adjusted.getTimezoneOffset() - d.getTimezoneOffset();

				adjusted.setHours( updateHour );
				adjusted = new Date( adjusted.getTime() - delta * 60 * 1000 );
				
				_updated = adjusted.getTime();

				var calendar = JSON.parse( calendar );
				var events = calendar.calendars[calendarId].busy;
				
				db.resetEvents( user.email );
				for ( var i = 0; i < events.length; i += 1 ) {
					var e = events[i];
					var start = new Date(e.start);
					var end = new Date(e.end);
					db.addEvent( user.email, start.getTime(), end.getTime() );
				}
			} catch( e ) {
				_updated = 0;
			}
		}

		function load () {
			db.getCalendar( user.email, loadFinish );
		}

		this.is_active = function ( when, cb ) {
			db.getEvent( user.email, when, cb );
		};

		setInterval(function () {
			if ( typeof _updated !== 'undefined' && ((Date.now() - _updated) > 24 * 60 * 60 * 1000) ) {
				reload();
			}
		}, 5 * 1000 );

		load();
	}
})();