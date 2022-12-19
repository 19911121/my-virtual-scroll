import { ScrollDirection } from './scroll';
import type { ScrollRect, ScrollRefCoordinates } from './scroll';
import type * as CSS from 'csstype';
import type { ScrollDirectionValue } from './scroll';

/**
 * CSS 반환 타입
 */
interface StyleReturnType extends
  CSS.Properties<string | number>,
  CSS.PropertiesHyphen<string | number> {
    // https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
    // ...or allow any other property
    [index: string]: any;
}
/**
 * 옵션 방향에 따른 여백 반환
 * 
 * @param direction 스크롤 방향
 * @param computedStyle 
 */
const getRealMarginAccordingToDirection = (direction: ScrollDirectionValue, computedStyle: CSSStyleDeclaration): number => {
  return 'horizontal' === direction
    ? Number.parseFloat(computedStyle['marginLeft']) + Number.parseFloat(computedStyle['paddingLeft'])
    : Number.parseFloat(computedStyle['marginTop']) + Number.parseFloat(computedStyle['paddingTop'])
};

interface WrapperStylePropKey {
  transformFunctionName: 'translateX' | 'translateY';
  size: 'width' | 'height';
}

interface StyleWrapper {
  /** 
   * wrapper size
   * 
   * direction
   *  horizontal => width
   *  vertical => height
   */
  size: number;

  /**
   * 현재 위치
   * 
   * direction
   *  horizontal => x
   *  vertical => y
   */
  current : number;
}

/**
 * 
 * 
 * @param scrollRefCoordinates 
 */
const getStartMarginName = (scrollRefCoordinates: ScrollRefCoordinates): Capitalize<ScrollRefCoordinates[0]> => {
  const name = scrollRefCoordinates[0];

  return name[0].toUpperCase() + name.slice(1) as Capitalize<ScrollRefCoordinates[0]>;
};

/**
 * 방향에 따른 wrapper 시작 마진
 * 
 * @param computedStyle 
 * @param scrollRefCoordinates 
 */
const getWrapperStartMargin = (computedStyle: CSSStyleDeclaration, scrollRefCoordinates: ScrollRefCoordinates): number => Number.parseFloat(computedStyle[`margin${getStartMarginName(scrollRefCoordinates)}`]);

/**
 * 방향에 따른 wrapper 시작 패딩
 * @param computedStyle 
 * @param scrollRefCoordinates 
 * @returns 
 */
const getWrapperStartPadding = (computedStyle: CSSStyleDeclaration, scrollRefCoordinates: ScrollRefCoordinates): number => Number.parseFloat(computedStyle[`padding${getStartMarginName(scrollRefCoordinates)}`]);

/**
 * 방향에 따른 wrapper 시작 마진과 패딩의 합
 * @param computedStyle 
 * @param scrollRefCoordinates 
 * @returns 
 */
const getWrapperMarginPaddingSum = (computedStyle: CSSStyleDeclaration, scrollRefCoordinates: ScrollRefCoordinates) => getWrapperStartMargin(computedStyle, scrollRefCoordinates) + getWrapperStartPadding(computedStyle, scrollRefCoordinates);

/**
 * wrapper 시작부분 margin 반환
 * 
 * @param containerRect 
 * @param wrapperRect 
 * @param scrollRefCoordinates 
 */
// const getWrapperStartMargin = (containerRect: ScrollRect, wrapperRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates): number => {

  
//   const [startCoordinateKey] = scrollRefCoordinates;

//   return wrapperRect[startCoordinateKey] - containerRect[startCoordinateKey];
// };

/**
 * wrapper 시작부분 padding 반환
 * 
 * @param rowRects 
 * @param wrapperRect 
 * @param scrollRefCoordinates 
 * @returns 
 */
// const getWrapperStartPadding = (rowRects: ScrollRect[], wrapperRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates): number => {
//   const [startCoordinateKey, endCoordinateKey] = scrollRefCoordinates;

//   return rowRects[0][startCoordinateKey] - wrapperRect[startCoordinateKey];
// };

/**
 * wrapper 마진 패딩 합계
 * 
 * @param rowRects
 * @param containerRect 
 * @param wrapperRect 
 * @param scrollRefCoordinates 
 * @returns 
 */
// const getWrapperMarginPaddingSum = (rowRects: ScrollRect[], containerRect: ScrollRect, wrapperRect: ScrollRect, scrollRefCoordinates: ScrollRefCoordinates) => {
//   return getWrapperStartMargin(containerRect, wrapperRect, scrollRefCoordinates) + getWrapperStartPadding(rowRects, wrapperRect, scrollRefCoordinates);
// };

/**
 * 스타일 속성 키 반환
 * 
 * @param direction 스크롤 방향
 */
const getStylePropKey = (direction: ScrollDirectionValue): WrapperStylePropKey => {
  return ScrollDirection.Horizontal === direction ? {
    transformFunctionName: 'translateX',
    size: 'width'
  } : {
    transformFunctionName: 'translateY',
    size: 'height'
  };
};

/**
 * wrapper 적용 할 스타일 반환
 * 
 * @param wrapper 
 * @param direction 
 * @param computedStyle 
 * @param styleWrapper 
 * @returns 
 */
const getWrapperStyle = (wrapper: HTMLElement, stylePropKey: WrapperStylePropKey, styleWrapper: StyleWrapper): StyleReturnType => {
  const transform = wrapper.style.transform;
  const transformFunction = `${stylePropKey.transformFunctionName}(${styleWrapper.current}px)`;
  const regex = new RegExp(`${stylePropKey.transformFunctionName}(.+)`);
  const styles: StyleReturnType = {};

  styles.transform = transform
      ? wrapper.style.transform.replace(regex, transformFunction)
      : transformFunction;
  styles[stylePropKey.size] = `${styleWrapper.size - styleWrapper.current}px`;

  return styles;
}

/**
 * wrapper 초기화 스타일 반환
 * 
 * @param wrapper 
 * @param stylePropKey 
 */
const getResetWrapperStyles = (wrapper: HTMLElement, stylePropKey: WrapperStylePropKey) => {
  const transform = wrapper.style.transform;
  const transformFunction = `${stylePropKey.transformFunctionName}(0px)`;
  const regex = new RegExp(`${stylePropKey.transformFunctionName}(.+)`);
  const styles: StyleReturnType = {};

  styles.transform = transform
    ? wrapper.style.transform.replace(regex, transformFunction)
    : transformFunction;
  styles[stylePropKey.size] = 'auto';

  return styles;
};

export {
  getWrapperStartMargin,
  getWrapperStartPadding,
  getWrapperMarginPaddingSum,
  getRealMarginAccordingToDirection,
  getStylePropKey,
  getWrapperStyle,
  getResetWrapperStyles
};

export type {
  StyleReturnType,
  StyleWrapper,
};