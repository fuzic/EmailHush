window.requestAnimationFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); };
})();

$(window).resize(function() {
    try { $("#connecting").dialog("option", "position", "center"); } catch(e) {}
    try { $("#gcalInit").dialog("option", "position", "center"); } catch(e) {}
    try { $("#gmailInit").dialog("option", "position", "center"); } catch(e) {}
});

(function( EmailHush, $, undefined ) {

	EmailHush.home = EmailHush.home || {};
	EmailHush.generic = EmailHush.generic || {};

	function Vector (x, y) {
		this.x = x;
		this.y = y;
	}

	Vector.prototype.multiplyScalar = function (s) {
		return new Vector(this.x * s, this.y * s);
	};

	Vector.prototype.add = function (v) {
		return new Vector(this.x + v.x, this.y + v.y);
	};

	function Bezier (Pt0, Pt1, Pt2, Pt3) {
		this.eval = function (t) {
			return Pt0.multiplyScalar(Math.pow(1 - t, 3)).add(
				Pt1.multiplyScalar(3 * t * Math.pow((1 - t), 2))).add(
				Pt2.multiplyScalar(3 * (1 - t) * Math.pow(t, 2))).add(
				Pt3.multiplyScalar(Math.pow(t, 3)));
		}
	}

	var airplanePath = new function () {
		var angle, _b = [];
		
		var P0 = new Vector(0, 0);
		
		var B0P0 = new Vector(-30, 70);
		var B0P1 = new Vector(-30, 107);
		
		var P1 = new Vector(0, 167);
		
		var B1P1 = new Vector(40, 247);
		var B1P2 = new Vector(40, 253);
		
		var P2 = new Vector(0, 333);
		
		var B2P2 = new Vector(-30, 393);
		var B2P3 = new Vector(-30, 440);
		
		var P3 = new Vector(0, 500);
		
		_b.push( new Bezier(P0, B0P0, B0P1, P1) );
		_b.push( new Bezier(P1, B1P1, B1P2, P2) );
		_b.push( new Bezier(P2, B2P2, B2P3, P3) );

		_lp = -Infinity;

		this.evalAtPercent = function (percent) {
			var css = {};

			var i = Math.max(0, Math.min(_b.length-1, Math.floor( percent / (1.0 / _b.length) ) ) );
			var t = (percent - i * (1.0 / _b.length)) / (1.0 / _b.length);
	
			p0 = _b[i].eval(t-0.01);
			p1 = _b[i].eval(t);
			angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
			var rx = 'rotate(' + (angle - Math.PI/2 - 0.406785398) + 'rad)';

			css['left'] = p1.x + 'px';
			css['top'] = p1.y + 'px';
			css['-webkit-transform'] = rx;
			css['-moz-transform'] = rx;
			css['-o-transform'] = rx;
			css['-ie-transform'] = rx;
			css['transform'] = rx;

			return css;
		}
	};

	var headerScroller = new function () {
		var _ot, _s, _ml, _r, _l, _t = 40;

		this.init = function () {
			_s = $('.nav_bar');
			_ml = $('#mini_logo');
			_r = $('.right_menu');
			_l = $("#menu_bar_top");

			_ot = _s.position().top;

			$(window).scroll(move);
		}

		function repositionHeader (st) {
			var opacity;
			if(st > _ot) {
				_s.css({
					position: "fixed",
					top: "0px"
				});
				opacity = 1;
			} else {
				_s.css({
					position: "absolute",
					top: ""
				});
				opacity = Math.max( 0, (st - _t) / (_ot - _t) );
			}
			_r.css('opacity', Math.min(1, Math.max( 0, (st - _ot) / (80) )));
			_ml.css('opacity', opacity);
			_l.css('opacity', opacity);
		}

		function move () {
			var st = $(window).scrollTop();

			repositionHeader(st);
		}
	}

	var homeScroller = new function () {
		var _i = -1;
		var _time_ready, _target = 0, _current = 0, _current_v = 0, _current_a = 0, _pseudostage=0, _stage = 0
		var _completed = [false, false, false, false, false];

		var t = Date.now();
		var np = 0;

		this.init = function () {
			$(window).scroll(move);
		};

		(function animateAirplane() {
			var nt = Date.now();
			var dt = nt - t;
			t = nt;
			if (_stage == 4) {

				_current_v = (_target - _current) / 10;
				_current = _current + _current_v / 30 * dt;
				
				np = Math.min(0.98, Math.max(np, Math.max(_current / 400, 0)));
				var css = airplanePath.evalAtPercent( np );
				for (var key in css) {
					$('.airplane').css(key, css[key]);
				}
			}
			requestAnimationFrame(animateAirplane);
		})();

		function airplane (st) {
			var _i = EmailHush.scroller.getSection();
			var allFrames = 'airplane_frame1 airplane_frame2 airplane_frame3 airplane_frame4';

			if (_i == 1) {

				var t = st - $('#what').position().top + $(window).height();

				if (t >= 1050 && _stage == 3 || _stage == 4) {

					_target = t - 1050;

				} else if (t >= 950 && _stage == 2 && !_completed[2]) {

					_completed[2] = true;
					_stage = 3;

					time_ready = Math.max(Date.now(), _time_ready);
					setTimeout(function () {
						$('.airplane').removeClass(allFrames).addClass('airplane_frame3 airplane_frame3_end');
						setTimeout(function () {
							$('.airplane').removeClass(allFrames).addClass('airplane_frame4');
							_stage = 4;
						}, 520);
					}, _time_ready - Date.now());
					_time_ready += 520;

				} else if (t >= 850 && _stage == 1 && !_completed[1]) {

					_completed[1] = true;
					_stage = 2;

					time_ready = Math.max(Date.now(), _time_ready);
					setTimeout(function () {
						$('.airplane').removeClass(allFrames).addClass('airplane_frame2 airplane_frame2_end');
					}, _time_ready - Date.now());
					_time_ready += 520;

				} else if (t >= 750 && !_completed[0]) {

					_completed[0] = true;
					_stage = 1;

					$('.airplane').removeClass(allFrames).addClass('airplane_frame1 airplane_frame1_end');
					_time_ready = Date.now() + 520;

				}
			} else if (_i == 0) {

				_stage = 0;
				_completed = [false, false, false, false, false];
				_current = 0; 
				_current_v = 0;
				_target = 0;
				np = 0;
				$('.airplane').removeClass(allFrames + ' airplane_frame1_end airplane_frame2_end airplane_frame3_end').addClass('airplane_frame1');
				$('.airplane').attr('style', '');

			}
		}

		function move () {
			var st = $(window).scrollTop();

			airplane(st);

			$(window).resize();
		}
	}

	var tutorial = new function () {
		var _marker;

		this.bind = function (dom, which) {
			dom.unbind('click').click(EmailHush.generic.message.show(which, which.attr('targetWidth')));
		};

		this.setMarker = function (dom) {
			_marker = dom;
		}

		this.setState = function (dom, msg) {
			_marker.css('left',dom.position().left + 80);
			_marker.children('#stepNextMsg').html(msg);
		};
	};

	EmailHush.generic.launch = function (url, target, w, h) {
		w = w || 600;
		h = h || 400;
		return window.open(url, target, 'width=' + w + ', height=' + h);
	};

	EmailHush.generic.message = new function () {
		this.show = function (which, width, height) {
			width = width || "auto";
			height = height || "auto";

			return function () {
				which.dialog({
					modal : true,
					width: width,
					height: height,
					resizable: false,
					draggable: false,
					show: "fade",
					open: function (event, ui) {
						$("body").css({ overflow: 'hidden' });
						$('*').blur();
					},
					beforeClose: function (event, ui) {
						$("body").css({ overflow: 'inherit' });
					}
				});
			};
		};
	};

	EmailHush.scroller = new function () {
		var _s, _i = -1, _sections;

		this.init = function (sections, targets, highlight) {
			_sections = [];
			_h = highlight;

			var extrema = {
				min : {top : Infinity, idx : -1},
				max : {top : 0, idx : -1},
			};

			for ( var i = 0; i < sections.length; i += 1 ) {
				var no = {
					link : sections[i],
					obj : targets[i],
					hot : {
						top : targets[i].offset().top,
						bottom : targets[i].offset().top + targets[i].height() - 50
					}
				};

				_sections.push(no);

				if (no.hot.top < extrema.min.top) {
					extrema.min.idx = _sections.length-1;
					extrema.min.top = no.hot.top;
				}
				if (no.hot.bottom > extrema.max.top) {
					extrema.max.idx = _sections.length-1;
					extrema.max.top = no.hot.bottom;
				}
			}

			_sections[extrema.max.idx].hot.bottom = $(document).height();
			_sections[extrema.min.idx].hot.top = 0;

			$(window).scroll(move);
			move();
		}

		this.getSection = function () {
			return _i;
		}

		function setTarget (s) {
			var l = s.link;
			_h.css( 'width', l.outerWidth(true) ).css( 'height', l.outerHeight(true) );
			_h.css( 'left', l.position().left ).css( 'top', l.position().top );
		};

		function changeSection (st) {
			var s, i;

			for ( i = 0; i < _sections.length; i += 1 ) {
				if (i !== _i ) {
					s = _sections[i];
					if ( st >= s.hot.top && st < s.hot.bottom ) {

						setTarget(s);
						_i = i;
						break;
					}
				}
			}
		};

		function move () {
			var st = $(window).scrollTop() + $(window).height()/2;
			
			changeSection(st);

			$(window).resize();
		};
	};

	EmailHush.home.headerInit = function () {
		headerScroller.init();
	};

	EmailHush.home.init = function () {
		EmailHush.scroller.init([$('[href="#start"]'), $('[href="#what"]'), $('[href="#new"]')], [$('#start'), $('#what'), $('#new')], $('#nav_highlight'));
		
		homeScroller.init();
		headerScroller.init();

		tutorial.setMarker($('.step_pointer'));

		var w1 = {closed: true};
		var w1c = true;

		$('#launchGmail').click( function(e) {
			e.preventDefault();
			e.stopPropagation();
			w1 = EmailHush.generic.launch('https://mail.google.com/mail/u/0/#create-filter/to=*','eh_gmail');
			$("#launchedGmail").show();
			w1c = false;
			$('#launchGmail button').removeClass('green_button').addClass('gray_button');
			$('#filterDone').removeClass('gray_button').addClass('green_button');
		});

		function showLaterWarning (e) {
			$(".ui-dialog-content").dialog("close");
			(EmailHush.generic.message.show($('#tutorial_mustcomplete'), 360))();
		}

		$('#filterLater').click( showLaterWarning );
		$('#scheduleLater').click( showLaterWarning );

		$('#filterDone').click( function(e) {
			$.post('engine/account/state', {state : 1});
			EmailHush.home.setState(2);
			$('#tutorial_filter').dialog('close');
		});

		$('#scheduleDone').click( function(e) {
			$.post('engine/account/state', {state : 2}, function() {
				(EmailHush.generic.message.show($('#tutorial_complete'), 400))();
			});
			$('#tutorial_schedule').dialog('close');
		});

		$('#setupDone').click( function(e) {
			window.location.reload();
		});

		$('#setupSkip').click( function (e) {
			$('#tutorial_mustcomplete').dialog('close');
		});

		setInterval( function () {
			if (w1.closed && !w1c) {
				w1c = true;
				$("#launchedGmail").hide();
				$('#launchGmail button').removeClass('gray_button').addClass('green_button');
				$('#filterDone').removeClass('green_button').addClass('gray_button');
			}
		}, 500);
	};

	EmailHush.home.setState = function (state) {
		var $dom = $('.steps li:nth-child(' + (state+1) + ')');
		tutorial.setState( $dom, 'Step ' + (state+1) );

		$('.steps li:nth-child(1)').removeClass('active');
		$('.steps li:nth-child(2)').removeClass('active');
		$('.steps li:nth-child(3)').removeClass('active');

		$dom.addClass('active');
		switch (state) {
		case 1:
			$('#gmailInit').dialog({
				closeOnEscape: false,
				resizable: false,
				open: function(event, ui) { $('.ui-dialog-titlebar').hide(); },
				modal: true,
				dialogClass: 'loading_dialog gmail_init'
			});

			$.post('engine/account/regen', {type : 'gmail'}, function (data) {

				if (data.success) {
					$('#gmailInit').dialog('close');
				}

			}, 'json');

			tutorial.bind($('#filter_button'), $('#tutorial_filter'));
			break;
		case 2:
			$('#gcalInit').dialog({
				closeOnEscape: false,
				resizable: false,
				open: function(event, ui) { $('.ui-dialog-titlebar').hide(); },
				modal: true,
				dialogClass: 'loading_dialog gcal_init'
			});

			$.post('engine/account/regen', {type : 'gcal'}, function (data) {

				if (data.success) {
					$('#gcalInit').dialog('close');
				}

			}, 'json');

			tutorial.bind($('#filter_button'), $('#tutorial_filter'));
			tutorial.bind($('#schedule_button'), $('#tutorial_schedule'));
			$('.steps li:nth-child(2)').addClass('active_inactive');
			break;
		default:
			break;
		}
	};
}( window.EmailHush = window.EmailHush || {}, jQuery ));