/* Modified by Mark Richardson */

jQuery.fn.toggleSwitch = function (params) {

    var defaults = {
        highlight: false,
        width: 20,
        change: null
    };

    var options = $.extend({}, defaults, params);

    $(this).each(function (i, item) {
        generateToggle(item);
    });

    function generateToggle(selectObj) {

        // create containing element
        var $contain = $('<div></div>').addClass('ui-toggle-switch');

        // generate labels
        $(selectObj).find('option').each(function (i, item) {
            $contain.append('<label>' + $(item).text() + '</label>');
        }).end().addClass('ui-toggle-switch');

        // generate slider with established options
        var startTime;
        var $slider = $('<div></div>').slider({
            min: 0,
            max: 100,
            animate: 'fast',
            change: options.change,
            start: function(e, ui) {
                startTime = Date.now();
            },
            stop: function (e, ui) {
                var delta = ( Date.now() - startTime );

                var opts = $(this.parentNode).parent().find('option');
                var prevState, roundedVal;

                for (var i = 0; i < opts.length; i += 1) {
                    if ($(opts[i]).attr('selected')) {
                        prevState = i;
                        break;
                    }
                }

                if (delta > 300) {
                    var thresh = (prevState - 0.5) * 0.7;
                    roundedVal = Math.round((ui.value / 100) - thresh);
                } else {
                    roundedVal = (1 - prevState);
                }
                window.setTimeout(toggleValue, 20, this.parentNode, roundedVal);
            },
            range: (options.highlight && !$(selectObj).data('hideHighlight')) ? 'max' : null
        }).width(options.width);

        $slider.find( ".ui-slider-handle" ).wrap( "<div class='ui-handle-helper-parent'></div>" );

        // put slider in the middle
        $slider.insertAfter(
            $contain.children().eq(0)
		);

        // bind interaction
        $contain.delegate('label', 'click', function () {
            if ($(this).hasClass('ui-state-active')) {
                return;
            }
            var labelIndex = ($(this).is(':first-child')) ? 0 : 1;
            toggleValue(this.parentNode, labelIndex);
        });

        function toggleValue(slideContain, index) {
            $(slideContain).find('label').eq(index).addClass('ui-state-active').siblings('label').removeClass('ui-state-active');
            $(slideContain).parent().find('option').eq(index).attr('selected', true);
            $(slideContain).find('.ui-slider').slider('value', index * 100);
        }

        // initialise selected option
        $contain.find('label').eq(selectObj.selectedIndex).click();

        // add to DOM
        $(selectObj).parent().append($contain);
    }
};