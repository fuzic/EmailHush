(function($) {

// We only support a single instance per call, so these variables are available
// for all subsequent calls.
var methods = {};
var opts = {};
var selectedTimzone = null;
var imgElement = null;
var mapElement = null;

methods.init = function(initOpts) {
  var $origCall = this;

  // Set the instance options.
  opts = $.extend({}, $.fn.timezonePicker.defaults, initOpts);
  selectedTimzone = opts.timezone;

  return $origCall.each(function(index, item) {
    imgElement = item;
    mapElement = document.getElementsByName(imgElement.useMap.replace(/^#/, ''))[0];

    // Wrap the img tag in a relatively positioned DIV for the pin.
    $(imgElement).wrap('<div class="timezone-picker"></div>').parent().css({
      position: 'relative',
      width: $(imgElement).width() + 'px'
    });

    // Main event handler when a timezone is clicked.
    $(mapElement).find('area').click(function() {
      var areaElement = this;
      
      // Update the target select list.
      if (opts.target) {
        var timezoneName = $(areaElement).attr('data-timezone');
        if (timezoneName) {
          $(opts.target).val(timezoneName);

          if (opts.cb) opts.cb(timezoneName);

          $('[name="timezoneMap"] area').each(function(){
            var d = $(this).data('maphilight') || {};
            if(d.alwaysOn == true) {
              d.alwaysOn = false;  
            }
          });
	      var data = $('[data-timezone="' + timezoneName + '"]').data('maphilight') || {};
          data.alwaysOn = true;
          $('[data-timezone="' + timezoneName + '"]').data('maphilight', data).trigger('alwaysOn.maphilight');
	    }
      }

      return false;
    });

    // Adjust the timezone if the target changes.
    if (opts.target) {
      $(opts.target).bind('change', function() {
        $origCall.timezonePicker('updateTimezone', $(this).val());
      });
    }

    // This is very expensive, so only run if enabled.
    if (opts.responsive) {
      var resizeTimeout = null;
      $(window).resize(function() {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(function() {
          $origCall.timezonePicker('resize');
        }, 200);
      });
    }

    // Give the page a slight time to load before selecting the default
    // timezone on the map.
    setTimeout(function() {
      if (opts.responsive && parseInt(imgElement.width) !== parseInt(imgElement.getAttribute('width'))) {
        $origCall.timezonePicker('resize');
      }
      else if (opts.maphilight && $.fn.maphilight) {
        $(imgElement).maphilight(opts);
      }
      if (opts.target) {
        $(opts.target).triggerHandler('change');
      }
    }, 500);

  });
};

/**
 * Update the currnetly selected timezone and update the pin location.
 */
methods.updateTimezone = function(newTimezone) {
  selectedTimzone = newTimezone;
  $(mapElement).find('area').each(function(m, areaElement) {
    if (areaElement.getAttribute('data-timezone') === selectedTimzone) {
      $(areaElement).triggerHandler('click');
      return false;
    }
  });

  return this;
};

/**
 * Update the currnetly selected timezone and update the pin location.
 */
methods.detectLocation = function(detectOpts) {
  var detectDefaults = {
    success: undefined,
    error: undefined,
    complete: undefined
  };
  detectOpts = $.extend(detectDefaults, detectOpts);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, handleErrors);
  }

  function showPosition(position) {
    var $imgElement = $(imgElement);
    var imageXY = convertXY(position.coords.latitude, position.coords.longitude, $imgElement.width(), $imgElement.height());

    $(mapElement).find('area').each(function(m, areaElement) {
      var coords = areaElement.getAttribute('coords').split(',');
      var shape = areaElement.getAttribute('shape');
      var poly = [];
      for (var n = 0; n < coords.length/2; n++) {
        poly[n] = [ coords[n * 2], coords[n * 2 + 1] ];
      }

      if ((shape === 'poly' && isPointInPoly(poly, imageXY[0], imageXY[1])) ||
          (shape === 'rect' && isPointInRect(coords, imageXY[0], imageXY[1]))
        ) {
        $(areaElement).triggerHandler('click', detectOpts['success']);
        return false;
      }
    });
    if (detectOpts['complete']) {
      detectOpts['complete'](position);
    }
  }

  function handleErrors(error) {
    if (detectOpts['error']) {
      detectOpts['error'](error);
    }
    if (detectOpts['complete']) {
      detectOpts['complete'](error);
    }
  }

  // Converts lat and long into X,Y coodinates on a Equirectangular map.
  function convertXY(latitude, longitude, map_width, map_height) {
    var x = Math.round((longitude + 180) * (map_width / 360));
    var y = Math.round(((latitude * -1) + 90) * (map_height / 180));
    return [x, y];
  }

  // Do a dual-check here to ensure accuracy. Ray-tracing algorithm gives us the
  // basic idea of if we're in a polygon, but may be inaccurate if the ray goes
  // through a single point exactly at its vertex. We double check positives
  // against a bounding box, ensuring the item is actually in that area.
  function isPointInPoly(poly, x, y){
    var inside = false;
    var bbox = [1000000,1000000,-1000000,-1000000];
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1];
      var xj = poly[j][0], yj = poly[j][1];
      bbox[0] = Math.min(bbox[0], xi);
      bbox[1] = Math.min(bbox[1], yi);
      bbox[2] = Math.max(bbox[2], xi);
      bbox[3] = Math.max(bbox[3], yi);

      var intersect = ((yi > y) != (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside && isPointInRect(bbox, x, y);
  }

  // Simple check if a point is in between two X/Y coordinates. Input may be
  // any two points, with a box made between them.
  function isPointInRect(rect, x, y) {
    // Adjust so we're always going top-left to lower-right.
    rect = [
      Math.min(rect[0], rect[2]),
      Math.min(rect[1], rect[3]),
      Math.max(rect[0], rect[2]),
      Math.max(rect[1], rect[3])
    ];
    return (x >= rect[0] && x <= rect[2] && y >= rect[1] && y <= rect[2]);
  }

  return this;
};

/**
 * Experimental method to rewrite the imagemap based on new image dimensions.
 *
 * This does not resize the image itself, it recalculates the imagemap to match
 * the current dimensions of the image.
 */
methods.resize = function() {
  $(mapElement).find('area').each(function(m, areaElement) {
    // Save the original coordinates for further resizing.
    if (!areaElement.originalCoords) {
      areaElement.originalCoords = {
        timezone: areaElement.getAttribute('data-timezone'),
        coords: areaElement.getAttribute('coords'),
      };
    }
    var rescale = imgElement.width/imgElement.getAttribute('width');

    // Adjust the image size.
    $(imgElement).parent().css({
      width: $(imgElement).width() + 'px'
    });

    // Adjust the coords attribute.
    var originalCoords = areaElement.originalCoords.coords.split(',');
    var newCoords = new Array();
    for (var j = 0; j < originalCoords.length; j++) {
      newCoords[j] = Math.round(parseInt(originalCoords[j]) * rescale);
    }
    areaElement.setAttribute('coords', newCoords.join(','));

    // Fire the change handler on the target.
    if (opts.target) {
      $(opts.target).triggerHandler('change');
    }

  });

  return this;
};

$.fn.timezonePicker = function(method) {
  // Method calling logic.
  if (methods[method]) {
    return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
  }
  else if (typeof method === 'object' || !method) {
    return methods.init.apply(this, arguments);
  }
  else {
    $.error('Method ' +  method + ' does not exist on jQuery.timezonePicker');
  } 
};

$.fn.timezonePicker.defaults = {
  // Preselect a particular timezone.
  timezone: null,
  // Pass through options to the jQuery maphilight plugin.
  maphilight: true,
  // Selector for the select list, textfield, or hidden to update upon click.
  target: null,
  // If this map should automatically adjust its size if scaled. Note that
  // this can be very expensive computationally and will likely have a delay
  // on resize. The maphilight library also is incompatible with this setting
  // and will be disabled.
  responsive: false,

  // Default options passed along to the maphilight plugin.
  fade: false,
  stroke: true,
  strokeColor: '999999',
  strokeOpacity: 0.4,
  fillColor: 'bbbbbb',
  fillOpacity: 0.3,
  groupBy: 'data-offset'
};

})(jQuery);