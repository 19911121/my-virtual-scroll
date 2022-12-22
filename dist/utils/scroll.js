'use strict';

const ScrollDirection = {
    Horizontal: 'horizontal',
    Vertical: 'vertical'
};
const convertDOMRectToScrollRect = (domrect) => {
    const rect = {
        top: domrect.top,
        right: domrect.right,
        bottom: domrect.bottom,
        left: domrect.left,
        width: domrect.width,
        height: domrect.height,
        x: domrect.x,
        y: domrect.y,
    };
    return rect;
};
const getContainerCurrentScroll = (container, direction) => {
    return 'horizontal' === direction ? container.scrollLeft : container.scrollTop;
};

exports.ScrollDirection = ScrollDirection;
exports.convertDOMRectToScrollRect = convertDOMRectToScrollRect;
exports.getContainerCurrentScroll = getContainerCurrentScroll;
