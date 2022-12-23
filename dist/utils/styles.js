'use strict';

const ScrollDirection = {
    Horizontal: 'horizontal',
    Vertical: 'vertical'
};

const toCapitalize = (name) => {
    return name[0].toUpperCase() + name.slice(1);
};
const getStartDirectionName = (scrollRefCoordinates) => {
    const name = scrollRefCoordinates[0];
    return name[0].toUpperCase() + name.slice(1);
};
const getEndDirectionName = (scrollRefCoordinates) => {
    const name = scrollRefCoordinates[1];
    return toCapitalize(name);
};
const getStyleProp = (direction) => {
    return ScrollDirection.Horizontal === direction ? {
        transformFunctionName: 'translateX',
        size: 'width'
    } : {
        transformFunctionName: 'translateY',
        size: 'height'
    };
};
const wrapperStartOrEndStyleValue = (computedStyle, prop) => {
    const value = computedStyle[prop];
    return {
        value: () => value,
        number: () => value ? Number.parseFloat(value.toString()) : NaN,
    };
};
const getAppliedInlineStyles = (wrapper) => {
    const wrapperStylesText = wrapper.style.cssText;
    return wrapperStylesText
        ? Object.fromEntries(wrapperStylesText.split(';').slice(0, -1).map(v => {
            const [key, value] = v.split(':');
            return [key, value.trim()];
        }))
        : {};
};
const getWrapperStyle = (wrapper, styleProp, styleWrapper) => {
    const wrapperStyles = getAppliedInlineStyles(wrapper);
    const transform = wrapper.style.transform;
    const transformFunction = `${styleProp.transformFunctionName}(${(styleWrapper.current)}px)`;
    const regex = new RegExp(`${styleProp.transformFunctionName}(.+)`);
    const styles = {};
    for (const [k, v] of Object.entries(wrapperStyles)) {
        styles[k] = v;
    }
    styles.transform = transform
        ? wrapper.style.transform.replace(regex, transformFunction)
        : transformFunction;
    return styles;
};
const getResetWrapperStyles = (wrapper, styleProp) => {
    const transform = wrapper.style.transform;
    const transformFunction = `${styleProp.transformFunctionName}(0px)`;
    const regex = new RegExp(`${styleProp.transformFunctionName}(.+)`);
    const styles = {};
    styles.transform = transform
        ? wrapper.style.transform.replace(regex, transformFunction)
        : transformFunction;
    return styles;
};
const getWrapperSingleNameStartEmptySize = (args) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getStartDirectionName(args[1])}`).number();
const getWrapperSingleNameEndEmptySize = (args) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getEndDirectionName(args[1])}`).number();
const getWrapperPairNameStartEmptySize = (args) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getStartDirectionName(args[1])}${toCapitalize(args[3])}`).number();
const getWrapperPairNameEndEmptySize = (args) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getEndDirectionName(args[1])}${toCapitalize(args[3])}`).number();
const wrapperStyles = (computedStyle, scrollRefCoordinates) => {
    const args = [computedStyle, scrollRefCoordinates];
    return {
        getStartEmptySize: (name) => getWrapperSingleNameStartEmptySize([...args, name]),
        getEndEmptySize: (name) => getWrapperSingleNameEndEmptySize([...args, name]),
        getEmptySizeSum: (name) => getWrapperSingleNameStartEmptySize([...args, name]) + getWrapperSingleNameEndEmptySize([...args, name]),
        getPairStartEmptySize: (startName, endName) => getWrapperPairNameStartEmptySize([...args, startName, endName]),
        getPairEndEmptySize: (startName, endName) => getWrapperPairNameEndEmptySize([...args, startName, endName]),
        getPairEmptySizeSum: (startName, endName) => getWrapperPairNameStartEmptySize([...args, startName, endName]) + getWrapperPairNameEndEmptySize([...args, startName, endName]),
    };
};

exports.getResetWrapperStyles = getResetWrapperStyles;
exports.getStartDirectionName = getStartDirectionName;
exports.getStyleProp = getStyleProp;
exports.getWrapperStyle = getWrapperStyle;
exports.wrapperStyles = wrapperStyles;
