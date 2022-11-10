(function($) {
    "use strict";
    $.fn.touch_sortable = function(options) {
        options = options || {};
        var startEvent = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'mousedown';

        return this.each(function() {
            var parent = $(this);
            var els = parent.children()
                .on(startEvent, onStart)
                .css({
                    cursor: "move",
                    'user-select': 'none'
                })
                .attr('unselectable', 'on')
                .on('selectstart', false);

            /* If only one element we do nothing */
            if (els.length < 2) {
                return;
            }

            /* assumes the distance between the first and second element is the same as 
               the distance between each other element and the next element */
            // var elDistance = els.filter(':nth-child(2)').offset().top - els.filter(':first').offset().top;
            var elDistance = els.filter(':nth-child(2)').offset().left - els.filter(':first').offset().left;


            /* Set with each onStart and updated on move if necessary */
            // var el, parentTop, parentBtm, positionAtStart, hasQueuedAni;
            var el, parentLeft, parentRight, positionAtStart, hasQueuedAni;


            function onStart(e) {
                e = e.originalEvent.touches ? e.originalEvent : e;
                el = $(e.touches ? e.touches[0].target : e.target);
                if (!el.is('div')) el = el.closest('div');
                parentLeft = parent.position().left;
                parentRight = parentLeft + parent.innerWidth() + el.width();

                els.css('position', 'relative');
                el.addClass('inMotion').css('z-index', 1);
                hasQueuedAni = false;

                /* Bind respective events based on start trigger */
                if (e.touches) {
                    positionAtStart = e.touches[0].pageX;
                    $('body').on('touchmove.sortable', onMove).on('touchend.sortable', onEnd).on('touchcancel.sortable', onEnd);
                } else {
                    positionAtStart = e.pageX;
                    $('body').on('mousemove.sortable', onMove).on('mouseup.sortable', onEnd).on('mouseleave.sortable', onEnd);
                }
            }

            function onMove(e) {
                var positionDelta;
                if (e) {
                    e = e.originalEvent.touches ? e.originalEvent : e;
                    var positionNow = (e.touches) ? e.touches[0].pageX : e.pageX;

                    /* Constrain dragging to limits of parent */
                    positionNow = Math.min(Math.max(parentLeft, positionNow), parentRight);

                    /* If the cursor is near document boundary, scroll the page */
                    if (50 >= (positionNow - $(window).scrollLeft())) {
                        window.scrollBy(0, -5);
                    } else if (50 >= $(window).width() + $(window).scrollLeft()) {
                        window.scrollBy(0, 5);
                    }

                    /* Move item  */
                    positionDelta = positionNow - positionAtStart;
                    el.css('left', positionDelta);
                } else {
                    positionDelta = el.css('left').split('%')[0];
                }

                /* Distance remaining to move, as a number of elDistances */
                var mvUnits = Math.floor(Math.abs(positionDelta / elDistance));
                var sel;
                /* Re-order the list once item crosses over the neighboring elements */
                if (positionDelta < -elDistance && el.prev().length) {

                    if (!els.filter(':animated').length) {
                        hasQueuedAni = true;

                        /* Animate and swap */
                        sel = el.prevAll().slice(0, mvUnits);
                        sel.animate({
                            'left': elDistance
                        }, 150).promise().done(function() {
                            positionAtStart = positionAtStart - elDistance * mvUnits;
                            el.insertBefore(sel.last()).css('left', '+=' + (elDistance * mvUnits));
                            sel.css('left', '');
                            onMove();
                        });
                    }
                } else if (positionDelta > elDistance && el.next().length) {

                    if (!els.filter(':animated').length) {
                        hasQueuedAni = true;

                        /* Animate and swap */
                        sel = el.nextAll().slice(0, mvUnits);
                        sel.animate({
                            'left': -elDistance
                        }, 150).promise().done(function() {
                            positionAtStart = positionAtStart + elDistance * mvUnits;
                            el.insertAfter(sel.last()).css('left', '-=' + (elDistance * mvUnits));
                            sel.css('left', '');
                            onMove();
                        });
                    }

                } else {
                    hasQueuedAni = false;
                }

                if (e) {
                    e.preventDefault();
                }
            }

            function onEnd() {
                $('body').off('.sortable');

                function complete() {
                    el.animate({
                        'left': "-=" + el.css('left')
                    }, 150, function() {
                        el.css({ 'left': '', 'z-index': '' }).removeClass('inMotion');
                        els.css('position', '');
                        // if (options.onComplete) {
                        //     options.onComplete(el);
                        // }
                        if (options.updated) {
                            options.updated(el);
                        }
                    });
                }
                /* Ensures all animations are complete, and the item is in it's
                final position before completing. The promise() waits for the 
                current animation to complete. setTimeout(x, 1) allows any remaning 
                animation to be queued up */
                var aniEls = els.filter(':animated');
                if (aniEls.length || hasQueuedAni) {
                    setTimeout(function() {
                        aniEls.promise().done(onEnd);
                    }, 1);
                } else {
                    complete();
                }
            }
        });
    };
})(jQuery);