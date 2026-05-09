(function($) {
    "use strict";
    $.fn.touch_sortable = function(options) {
        options = options || {};
        var startEvent = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'mousedown';

        return this.each(function() {
            var parent = $(this);

            function bindChildren() {
                parent.children()
                    .off(startEvent + '.sortable selectstart.sortable')
                    .on(startEvent + '.sortable', onStart)
                    .css({ cursor: 'move', 'user-select': 'none' })
                    .attr('unselectable', 'on')
                    .on('selectstart.sortable', false);
            }
            bindChildren();

            var el, origFixedLeft, origFixedTop, startPageX, startPageY, placeholder;

            function onStart(e) {
                var native = e.originalEvent || e;
                var touch = native.touches ? native.touches[0] : native;

                el = $(touch.target);
                if (!el.is('.listitemClass')) el = el.closest('.listitemClass');
                if (!el.length) return;

                var offset = el.offset();
                origFixedLeft = offset.left - $(window).scrollLeft();
                origFixedTop  = offset.top  - $(window).scrollTop();
                startPageX = touch.pageX;
                startPageY = touch.pageY;

                /* Placeholder holds the gap while el floats */
                placeholder = $('<div>').addClass('listitemClass sort-placeholder')
                    .css({ visibility: 'hidden' });
                el.after(placeholder);

                /* Float el above the layout */
                el.css({
                    position: 'fixed',
                    left: origFixedLeft,
                    top:  origFixedTop,
                    width: el.outerWidth(),
                    zIndex: 1000
                }).addClass('inMotion');

                if (native.touches) {
                    $('body').on('touchmove.sortable', onMove)
                             .on('touchend.sortable touchcancel.sortable', onEnd);
                } else {
                    $('body').on('mousemove.sortable', onMove)
                             .on('mouseup.sortable', onEnd);
                }

                e.preventDefault();
            }

            function onMove(e) {
                var native = e.originalEvent || e;
                var touch = native.touches ? native.touches[0] : native;

                var dx = touch.pageX - startPageX;
                var dy = touch.pageY - startPageY;

                el.css({
                    left: origFixedLeft + dx,
                    top:  origFixedTop  + dy
                });

                /* Current pointer position in page coords */
                var pX = touch.pageX;
                var pY = touch.pageY;

                /* Find the first sibling whose centre is "after" the pointer
                   in reading order (top-to-bottom, left-to-right) */
                var insertBefore = null;
                parent.children().not(el).each(function() {
                    if (insertBefore) return;
                    var sib = $(this);
                    var off = sib.offset();
                    var cx  = off.left + sib.outerWidth()  / 2;
                    var cy  = off.top  + sib.outerHeight() / 2;
                    var rowH = sib.outerHeight();

                    var isAfter = (cy > pY + rowH * 0.4) ||
                                  (Math.abs(cy - pY) <= rowH * 0.4 && cx > pX);
                    if (isAfter) insertBefore = sib;
                });

                if (insertBefore) {
                    insertBefore.before(placeholder);
                } else {
                    parent.append(placeholder);
                }

                e.preventDefault();
            }

            function onEnd() {
                $('body').off('.sortable');

                /* Drop el into the placeholder's position */
                placeholder.replaceWith(el);
                el.css({ position: '', left: '', top: '', width: '', zIndex: '' })
                  .removeClass('inMotion');

                if (options.updated) options.updated(el);

                /* Re-bind so newly ordered children are draggable */
                bindChildren();
            }
        });
    };
})(jQuery);