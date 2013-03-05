(function () {
	require('js-yaml');

	var mysql   = require( 'mysql' );
	var sqlite3 = require( 'sqlite3' );
	var opts    = require( '../config/database.yml' );

	var resetEventsStmt, addEventStmt, getEventStmt, _ready = false;;

	var _db = new mysql.createConnection({
		user     : opts.username,
		password : opts.password,
		database : opts.database,
		host     : opts['hostname']
	});
	_db.connect(function(err) {
		if (err) throw(err);
		console.log( 'Database open' );
		_ready = true;
	});

	var _cache = new sqlite3.Database( ':memory:' );
	_cache.run( "CREATE TABLE cache (email TEXT, start INTEGER, end INTEGER)", function ( err ) {
		_cache.run( "CREATE INDEX email_index ON cache (email)" );
		_cache.run( "CREATE INDEX start_index ON cache (start)" );
		_cache.run( "CREATE INDEX end_index ON cache (end)" );

		resetEventsStmt = _cache.prepare( "DELETE FROM cache WHERE email = ?" );
		addEventStmt    = _cache.prepare( "INSERT INTO cache (email, start, end) VALUES (?, ?, ?)" );
		getEventStmt    = _cache.prepare( "SELECT * FROM cache WHERE email = ? AND start <= ? AND end > ?" );
	
		console.log( 'Cache created' );
	} );
	
	module.exports.getUsers = function ( cb ) {
		if (!_ready) return false;
		_db.query('SELECT * FROM users WHERE state = 2', function(err, result) {
			for (var i = 0; i < result.length; i += 1) {
				var row = result[i];
				cb( row.id, row.email, row.refresh_token, row.timezone, row.override, row.override_mode, row.calendar_id );
			}
		});
		return true;
	}

	module.exports.getUser = function ( email, cb ) {
		if (!_ready) return false;
		_db.query('SELECT * FROM users WHERE state = 2 AND email = ?', [email], function(err, result) {
			var row = result[0];
			cb( row.id, row.email, row.refresh_token, row.timezone, row.override, row.override_mode, row.calendar_id );
		});
		return true;
	}

	module.exports.getCalendar = function ( email, cb ) {
		if (!_ready) return false;
		_db.query('SELECT calendar_cache, calendar_cache_updated FROM users WHERE email = ?', [email], function(err, result) {
			var row = result[0];
			cb( row.calendar_cache, row.calendar_cache_updated );
		});
		return true;
	};

	module.exports.setCalendar = function ( email, calendar, cb ) {
		if (!_ready) return false;
		var updated = Date.now();
		_db.query('UPDATE users SET calendar_cache = ?, calendar_cache_updated = ? WHERE email = ?', [calendar, updated, email], function(err, result) {
			if (cb)
				cb( calendar, updated );
		});
		return true;
	};

	module.exports.tallyReceive = function ( uid, time ) {
		if (!_ready) return false;
		time = Math.floor( time.getTime() / 1000 );
		_db.query('INSERT INTO stat_receives (user, count, from_time, to_time, created_at, updated_at) VALUES (?, 1, FROM_UNIXTIME(FLOOR( ? / 3600 ) * 3600), FROM_UNIXTIME(FLOOR( 1 + ? / 3600 )*3600), NOW(), NOW() ) ' +
			'ON DUPLICATE KEY ' +
			'UPDATE count = count + 1, updated_at = NOW()', [uid, time, time]);
		return true;
	};

	module.exports.tallyDeliver = function ( uid, delay, time ) {
		if (!_ready) return false;
		time = Math.floor( time.getTime() / 1000 );
		_db.query('INSERT INTO stat_delivers (user, duration, count, from_time, to_time, created_at, updated_at) VALUES (?, ?, 1, FROM_UNIXTIME(FLOOR( ? / 604800 )*604800), FROM_UNIXTIME(FLOOR( 1 + ? / 604800 )*604800), NOW(), NOW() ) ' +
			'ON DUPLICATE KEY ' +
			'UPDATE count = count + 1, updated_at = NOW()', [uid, delay, time, time]);
		return true;
	};

	module.exports.resetEvents = function ( email, cb ) {
		resetEventsStmt.run( email, function ( err ) {
			if ( cb ) cb();
		} );
	};

	module.exports.addEvent = function ( email, start, end, cb ) {
		addEventStmt.run( email, start, end, function ( err ) {
			if ( cb ) cb();
		} );
	};

	module.exports.getEvent = function ( email, time, cb) {
		getEventStmt.get( email, time, time, function ( err, row ) {
			if ( cb ) cb( typeof row !== "undefined" );
		} );
	};

})();