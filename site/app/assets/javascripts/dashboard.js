(function( EmailHush, $, undefined ) {
	EmailHush.dash = EmailHush.dash || {};

	var _schedule, _today = [], _offset = 0, _ld, _deliver, _receiveW, _receiveD, _deliverBundle, _receiveWBundle, _receiveDBundle;

	var receiveWKeys = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	var receiveDKeys = ['12AM', '', '', '3AM', '', '', '6AM', '', '', '9AM', '', '', '12PM', '', '', '3PM', '', '', '6PM', '', '', '9PM', '', ''];
	var deliverKeys = ['15-30 mins', '30-60 mins', '1-2 hrs', '2-4 hrs', '4-8 hrs', '8-16 hrs', '16-24 hrs', '1-3 days', '3-5 days', '5 days+'];

	var cbs = [];

	function dashResize () {
		var rem = $(window).width() - $('.subnav_bar').width() + 10;
		$('.dash_content').css('width', rem);
		$('#footer').css('width', rem);
	}

	function parseDateString (string) {
		var s = string.replace(/Z$/,'').split('T');
		s[0] = s[0].split('-');
		s[1] = s[1].split(':');

		var newdate = new Date(0);
		
		newdate.setYear(parseInt(s[0][0], 10));
		newdate.setDate(parseInt(s[0][2], 10));
		newdate.setMonth(parseInt(s[0][1], 10) - 1);
		newdate.setHours(parseInt(s[1][0], 10));
		newdate.setMinutes(parseInt(s[1][1], 10));
		return new Date( newdate.getTime() + _offset * 1000 );
	}

	function initStatistics () {
		_deliver = new Raphael('graphDistHold', $('#graphDistHold').width(), $('#graphDistHold').height());
		_receiveW = new Raphael('graphVolDay', $('#graphVolDay').width(), $('#graphVolDay').height());
		_receiveD = new Raphael('graphVolHour', $('#graphVolHour').width(), $('#graphVolHour').height());

		for (var i = 0; i < receiveWKeys.length; i += 1) {
			cbs.push({});
		}

		_deliverBundle = initPlot( _deliver, deliverKeys );
		_receiveWBundle = initPlot( _receiveW, receiveWKeys, cbs );
		_receiveDBundle = initPlot( _receiveD, receiveDKeys );

		updateStatistics();
	}

	function updateStatistics () {
		var weekVals, dayVals;
			
		$.getJSON('engine/account/statistic', {type : 'delay'}, function (data) {
			var vals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

			for (var i = 0; i < data.length; i += 1) {
				if (data[i].duration > 0) {
					var power = Math.floor(Math.log(Math.floor(data[i].duration / 15)) / Math.log(2));
					if (power < 10) vals[power] += data[i].count;
				}
			}

			drawPlot(_deliver, _deliverBundle, deliverKeys, vals);
		});

		$.getJSON('engine/account/statistic', {type : 'volume'}, function (data) {
			var i, callbacks, weekDayVals;

			weekVals = [0, 0, 0, 0, 0, 0, 0];
			dayVals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			callbacks = [];
			weekDayVals = [];

			for (i = 0; i < weekVals.length; i += 1) {
				weekDayVals.push(dayVals.slice(0));
			}

			for (i = 0; i < data.length; i += 1) {
				// tally vals for each thing
				var from = parseDateString(data[i].from_time);
				var to = parseDateString(data[i].to_time);

				weekVals[from.getDay()] += data[i].count;
				weekDayVals[from.getDay()][from.getHours()] += data[i].count;
				dayVals[from.getHours()] += data[i].count;
			}

			console.log(weekDayVals);

			for (i = 0; i < weekVals.length; i += 1) {
				cbs[i].fwd = (function (vals) {
					return function () {
						drawPlot(_receiveD, _receiveDBundle, receiveDKeys, vals);
					};
				})(weekDayVals[i]);

				cbs[i].bkwd = (function (vals) {
					return function () {
						drawPlot(_receiveD, _receiveDBundle, receiveDKeys, vals);
					};
				})(dayVals);
			}

			drawPlot(_receiveW, _receiveWBundle, receiveWKeys, weekVals);
			drawPlot(_receiveD, _receiveDBundle, receiveDKeys, dayVals);
		});
	}

	function drawPoint (paper, x, y, width, value, cb) {
		
		var circle = paper.circle(x, y, 4);
		circle.attr({
			stroke: '#1f709d',
			fill: '#fff'
		});

		var tag = paper.text(x + 7, y, value);
		tag.attr({
			'text-anchor' : 'start',
			fill : '#000',
			opacity : 0
		});

		hoverArea = paper.rect(x - width/2, 0, width, paper.height);
		hoverArea.attr({
			stroke : 'none',
			fill : '#f00',
			'fill-opacity' : 0
		});

		hoverArea.hover(function () {
				circle.animate({r : 6}, 150, 'ease-in');
				tag.animate({opacity : 1}, 150, 'ease-in');
				if (cb && cb.fwd) {
					cb.fwd();
				}
			},
			function () {
				circle.animate({r : 4}, 150, 'ease-in');
				tag.animate({opacity : 0}, 150, 'ease-in');
				if (cb && cb.bkwd) {
					cb.bkwd();
				}
			}
		);
		
		var bundle = {
			circle : circle,
			tag : tag
		};

		return bundle;
	}

	function makePath (paper, offset, step, keys, vals) {
		var stepw = Math.floor(step * 0.6);
		var max = Math.max(1, Math.max.apply(null, vals));

		var xp = offset;
		var yp = 7 + Math.floor((paper.height - 27) * (1 - vals[0] / max));

		var pathStr = 'M' + [xp, yp].join(' ');

		for (var i = 1; i < keys.length; i += 1) {
			var x = offset + Math.floor(i * step);
			var y = 7 + Math.floor((paper.height - 27) * (1 - vals[i] / max));

			if (i == 1) {
				pathStr += 'C' + [xp + stepw, yp, x - stepw, y, x, y].join(' ');
			} else {
				pathStr += 'S' + [x - stepw, y, x, y].join(' ');
			}

			xp = x;
			yp = y;
		}

		return pathStr;
	}

	function initPlot (paper, keys, cbs) {
		
		var offset = 30;
		
		var step = ( (paper.width - 2 * offset) / (keys.length - 1) );

		var vals = [];
		for (var i = 0; i < keys.length; i += 1) {
			vals.push(0);
		}

		var pathStr = makePath(paper, offset, step, keys, vals);

		var points = [];

		for (var i = 0; i < keys.length; i += 1) {
			var x = offset + Math.floor(i * step);
			var y = 7 + Math.floor((paper.height - 27));

			paper.text(x, paper.height - 10, keys[i]);

			var cb = cbs ? cbs[i] : null;
			points.push( drawPoint(paper, x, y, step, 0, cb) );
		}

		var pathStroke = paper.path(pathStr).attr({
			stroke: "#54adde"
		}).toBack();

		var pathFill = paper.path(
			pathStr + 
			'L' + [(paper.width - offset), (paper.height - 20)].join(' ') + 
			'L' + [offset, (paper.height - 20)].join(' ') + 'Z').attr({
			fill: "#b6dcf1",
			stroke: false
		}).toBack();
		
		var bundle = {
			pathFill : pathFill,
			pathStroke : pathStroke,
			points : points
		};

		return bundle;
	}

	function drawPlot (paper, bundle, keys, vals) {
		var max = Math.max(1, Math.max.apply(null, vals));

		var offset = 30;
		var step = ( (paper.width - 2 * offset) / (keys.length - 1) );

		var pathStr = makePath(paper, offset, step, keys, vals);

		bundle.pathFill.animate({
			path : pathStr + 'L' + [(paper.width - offset), (paper.height - 20)].join(' ') + 
				'L' + [offset, (paper.height - 20)].join(' ') + 'Z'
		}, 300, 'ease-in');

		bundle.pathStroke.animate({path : pathStr}, 300, 'ease-in');

		for (var i = 0; i < keys.length; i += 1) {
			var y = 7 + Math.floor((paper.height - 27) * (1 - vals[i] / max));

			bundle.points[i].tag.attr({text : vals[i]});
			bundle.points[i].tag.animate({y : y}, 300, 'ease-in');
			bundle.points[i].circle.animate({cy : y}, 300, 'ease-in');
		}
	}

	function updateSchedule () {
		$.getJSON('engine/account/schedule', function (data) {

			var toff = (new Date()).getTimezoneOffset() * 60 * 1000 + _offset * 1000;
			var today = new Date(Date.now() + toff);
			
			_today = [];
			_schedule = JSON.parse(data);
			for (var calid in _schedule.calendars) {

				var cal = _schedule.calendars[calid].busy;
				for (var edx in cal) {
					
					cal[edx].start = parseDateString( cal[edx].start );
					cal[edx].end = parseDateString( cal[edx].end );

					if (cal[edx].start.getDate() == today.getDate() || cal[edx].end.getDate() == today.getDate()) {
						_today.push({
							start : cal[edx].start,
							end : cal[edx].end
						});
					}
				}
			}
			drawSchedule();
		});
	}

	function addBlocksToDay ($day, cssClass) {
		for (var i = 0; i < 24; i += 1) {
			
			var $hour = $('<span></span>').addClass('scheduleHour').addClass(cssClass);
			if (i%3 === 0) {
				var hr = (i%12);
				hr = (hr === 0) ? 12 : hr;
				var ampm = i > 11 ? 'PM' : 'AM';
				$hour.text(hr + ampm);
			}

			$day.append($hour);
		}
	}

	function drawDay (row, date) {

		var day = date.getDate() === (new Date()).getDate() ? 'Today' : receiveWKeys[date.getDay()];
		
		var $row = $('<div></di v>').addClass('scheduleRow');
		var $prefix = $('<div></div>').addClass('scheduleRowLabel').text(day);

		addBlocksToDay($row, 'scheduleFree');
		$row.children().attr('title', 'Hold mail');

		for (var calid in _schedule.calendars) {

			var cal = _schedule.calendars[calid].busy;
			for (var edx in cal) {
				var e = cal[edx];

				if (e.start.getDate() !== date.getDate() &&
					e.end.getDate() !== date.getDate()) continue;

				$overlay = $('<div></div>').addClass('scheduleOverlay');
				addBlocksToDay($overlay, 'scheduleBusy');
				$overlay.children().attr('title', 'Deliver mail from ' + e.start.toLocaleString() + ' to ' + e.end.toLocaleString());

				left = Math.max(0, 768*(e.start.getTime() - date.getTime())/(24*60*60*1000));
				right = Math.min(768, 768*(e.end.getTime() - date.getTime())/(24*60*60*1000));

				$overlay.css('clip','rect(0px, ' + right + 'px, 32px, ' + left + 'px)');

				$row.append($overlay);
			}
		}
		if (row == 0) {
			$row.append($('<div id="nowMarker"></div>'));
		}
		$('#dashSchedule').append($prefix).append($row).append('<br>');
	}


	function drawSchedule () {
		var toff = (new Date()).getTimezoneOffset() * 60 * 1000 + _offset * 1000;
		$('#dashSchedule').empty();
		for (var i = 0; i < 5; i += 1) {
			var date = new Date(Date.now() + toff + (i * 24 * 60 * 60 * 1000));
			date.setHours(0);
			date.setMinutes(0);
			date.setSeconds(0);
			date.setMilliseconds(0);

			drawDay(i, date);
		}
		EmailHush.scroller.init([$('[href="#status"]'), $('[href="#filter"]'), $('[href="#schedule"]'), $('[href="#account"]')], [$('#status'), $('#filter'), $('#schedule'), $('#account')], $('.subnav_highlight'));
	}

	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var ampm = ["AM","PM"]
	var suffix = ["th","st","nd","rd","th","th","th","th","th","th"];

	function dateUpdate () {
		var toff = (new Date()).getTimezoneOffset() * 60 * 1000 + _offset * 1000;
		d = new Date(Date.now() + toff);

		var tsuff = d.getDate() > 10 && d.getDate() < 14 ? 'th' : suffix[d.getDate()%10];
		$('#nowDate').html(
			receiveWKeys[d.getDay()] + ' <span class="avoid_wrap">' +
			months[d.getMonth()] + ' ' +
			d.getDate() + '<sup>' + tsuff + '</sup>,</span> ' +
			d.getFullYear()
		);
		var h = d.getHours() % 12;
		h = (h == 0) ? 12 : h;
		$('#nowTime').html(
			h + ':' + ('0' + d.getMinutes()).substr(-2) + ' ' + ampm[Math.floor(d.getHours()/12)]
		);

		if (_ld !== d.getDate()) {
			_ld = d.getDate();
			updateSchedule();
		}

		var contained = false;
		for (var i = 0; i < _today.length; i += 1) {
			contained = contained || (d.getTime() > _today[i].start.getTime() && d.getTime() < _today[i].end.getTime());
		}

		if (($('#override').val() == 'Off' && contained) || ($('#override').val() == 'On' && $('#overrideMode').val() == 'Deliver')) {
			$('#mailStatus').removeClass('field_status_hold').addClass('field_status_deliver').text('Delivering Mail');
		} else {
			$('#mailStatus').removeClass('field_status_deliver').addClass('field_status_hold').text('Holding Mail');
		}

		var offset = d.getHours() * 60 + d.getMinutes();

		$('#nowMarker').css('display', 'block').css('left', (100 * offset / (24 * 60)) + '%');
	}

	EmailHush.dash.init = function () {
		EmailHush.scroller.init([$('[href="#status"]'), $('[href="#filter"]'), $('[href="#schedule"]'), $('[href="#account"]')], [$('#status'), $('#filter'), $('#schedule'), $('#account')], $('.subnav_highlight'));

		$('#changeGmail').click( function (e) {
			e.preventDefault();
			e.stopPropagation();
			EmailHush.generic.launch('https://mail.google.com/mail/u/0/?shva=1#settings/filters', 'eh_gmail', 800, 400);
			(EmailHush.generic.message.show($('#tutorial2_filter'), $('#tutorial2_filter').attr('targetWidth')))();
		});

		$('#changeGcal').click( function (e) {
			e.preventDefault();
			e.stopPropagation();
			EmailHush.generic.launch('https://www.google.com/calendar/render?pli=1', 'eh_gcal', 800, 500);
			(EmailHush.generic.message.show($('#tutorial2_schedule'), $('#tutorial2_schedule').attr('targetWidth')))();
		});

		$('#changeFilterClose').click( function (e) {
			$('#tutorial2_filter').dialog('close');
		});

		$('#changeScheduleClose').click( function (e) {
			$('#tutorial2_schedule').dialog('close');
		});

		dashResize();
		$(window).resize(dashResize);

		setInterval(dateUpdate, 1000);
		dateUpdate();

		$.getJSON('engine/account/timezone', function (data) {
			_offset = data.offset;
			$('#user_time_zone').val(data.timezone);
			$('#user_time_zone').change();
			updateSchedule();
			initStatistics();
		});

		$('#timezoneImage').timezonePicker({
			target: '#user_time_zone',
			cb : function (tz) {
				$.post('engine/account/timezone', {
					timezone : tz
				}, function (data) {
					_offset = data.offset;
					updateSchedule();
				});
			}
		});

		$('#override').toggleSwitch({
			change : function (e) {
				if (e.hasOwnProperty('view')) return;
				// Enable/disable next slider (Just gray out)
				switch ($('#override').val()) {
				case 'On':
					$('#dashSchedule').addClass('scheduleBlocked');
					$('#overrideModeContainer').removeClass('disabled_slider');
					$('#overrideModeContainer .field_val_disable').hide();
					break;
				case 'Off':
					$('#dashSchedule').removeClass('scheduleBlocked');
					$('#overrideModeContainer').addClass('disabled_slider');
					$('#overrideModeContainer .field_val_disable').show();

					$('#overrideMode').parent().find('.ui-slider-handle').css('left','0');
					$('#overrideMode').val('Hold');
					break;
				}

				var modes = {"On" : 1, "Off" : 0};
				$.post('engine/account/override', {
					override: modes[$('#override').val()]
				});
			}
		});


		$('#overrideMode').toggleSwitch({
			change : function (e) {
				if (e.hasOwnProperty('view')) return;
				var modes = {"Hold" : 0, "Deliver" : 1};
				$.post('engine/account/overrideMode', {
					override_mode: modes[$('#overrideMode').val()]
				});
			}
		});

		function saveName () {
			$.post('engine/account/name', {
				name: $('#dashNameField').val()
			});
		}

		$('#dashNameButton').click(function (e) {
			switch($('#dashNameButton').text()) {
			case 'save':
				$('#dashNameButton').text('change my name');
				saveName();
				break;
			default:
				$('#dashNameButton').text('save');
				$('#dashNameField').select();
				break;
			}
		});

		$('#dashNameField').focus(function (e) {
			$('#dashNameButton').text('save');
		});

		$('#dashNameField').keyup(function (e) {
			$('#dashNameField').attr('size',$('#dashNameField').val().length + 1);
		});

		$('#dashNameField').blur(function (e) {
			$('#dashNameButton').text('change my name');
			saveName();
		});
	};
}( window.EmailHush = window.EmailHush || {}, jQuery ));