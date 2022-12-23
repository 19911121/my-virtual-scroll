import { ScrollDirection } from './scroll';
import type * as CSS from 'csstype';
import type { ScrollRefCoordinates } from './scroll';
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
 * 스타일 적용 할 속성목록
 */
interface WrapperStyleProp {
  transformFunctionName: 'translateX' | 'translateY';
  size: 'width' | 'height';
}

/**
 * wrapper style적용에 필요한 정보
 */
interface StyleWrapper {
  /** 
   * direction에 따른 wrapper size
   * 
   * - horizontal => width
   * - vertical => height
   */
  size: number;

  /**
   * direction에 따른 현재 위치
   * 
   *  horizontal => x
   *  vertical => y
   */
  current: number;
}

/** 사이즈 방향 */
type SizeDirection = Capitalize<'top' | 'right' | 'bottom' | 'left'>;

/** 
 * @see {@link SizeSingleName}
 * 
 * SizeSingleName에서 ScrollRefCoordinates(Top, Right, Bottom, Left)를 제외 한 항목 명
 * 
 * - margin | padding...
 */
type SizeSingleStartName<K extends keyof CSSStyleDeclaration = keyof CSSStyleDeclaration> = K extends `${infer S}${SizeDirection}`
  ? S
  : never;
  
/** 
 * ScrollRefCoordinates(Top, Right, Bottom, Left)으로 끝나는 항목 명
 * 
 * - ${name}Top | ${name}Right...
 * - marginTop | marginRight...
 */
type SizeSingleName = keyof Pick<CSSStyleDeclaration, keyof CSSStyleDeclaration & `${SizeSingleStartName}${SizeDirection}`>;

/**
 * @see {@link SizePairName}
 * 
 * 중간에 ScrollRefCoordinates(Top, Right, Bottom, Left)가 존재하는 항목 명 그룹
 * 
 * - 구분자 **_** 
 */
type SizePairNameGroup = ['border_width'];

/**
 * @see {@link SizePairNameGroup}
 * 
 * pair 그룹 분리
 */
type SizePairNameSplit<G extends SizePairNameGroup[number] = SizePairNameGroup[number]> = G extends `${infer S}_${infer E}`
  ? [S, E]
  : never;

/**
 * 중간에 ScrollRefCoordinates(Top, Right, Bottom, Left)가 존재하는 항목 명
 * 
 * - ${startName}Top${endName} | ${startName}Right${endName} ...
 * - borderTopWidth | borderRightWidth ...
 */
type SizePairName = keyof Pick<CSSStyleDeclaration, keyof CSSStyleDeclaration & `${SizePairStartName}${SizeDirection}${Capitalize<SizePairEndName<SizePairStartName>>}`>;

/**
 * @see {@link SizePairName}의 startName
 * 
 * 중간에 ScrollRefCoordinates(Top, Right, Bottom, Left)가 존재하는 시작 항목 명
 * 
 * - border...
 */
type SizePairStartName<K extends keyof CSSStyleDeclaration = keyof CSSStyleDeclaration> = 
K extends `${infer S}${SizeDirection}${Capitalize<SizePairNameSplit[1]>}`
  ? S
  : never;

/**
 * @see {@link SizePairName}의 endName
 * 
 * 중간에 ScrollRefCoordinates(Top, Right, Bottom, Left)가 존재하는 마지막 항목 명
 * 
 * - width(border)...
 */
type SizePairEndName<S extends SizePairStartName, K extends keyof CSSStyleDeclaration = keyof CSSStyleDeclaration> = 
  K extends `${S}${SizeDirection}${infer E}`
  ? E extends Capitalize<SizePairNameSplit[1]>
    ? Uncapitalize<E>
    : never
  : never;

/** 사이즈 항목 명 */
type SizeName = keyof Pick<CSSStyleDeclaration, SizeSingleName | SizePairName>;

/**
 * 항목명 첫 문자열 대문자로 변경
 * 
 * @param name 변경 할 항목명
 */
const toCapitalize = <N extends string = string>(name: N): Capitalize<N> => {
  return name[0].toUpperCase() + name.slice(1) as Capitalize<N>;
};

/**
 * 속성 시작명 반환(첫 문자열 대문자로 변경)
 * 
 * @param scrollRefCoordinates {@link ScrollRefCoordinates} 
 */
const getStartDirectionName = (scrollRefCoordinates: ScrollRefCoordinates): Capitalize<ScrollRefCoordinates[0]> => {
  const name = scrollRefCoordinates[0];

  return name[0].toUpperCase() + name.slice(1) as Capitalize<ScrollRefCoordinates[0]>;
};

/**
 * 속성 종료명 반환(첫 문자열 대문자로 변경)
 * 
 * @param scrollRefCoordinates {@link ScrollRefCoordinates} 
 */
const getEndDirectionName = (scrollRefCoordinates: ScrollRefCoordinates): Capitalize<ScrollRefCoordinates[0]> => {
  const name = scrollRefCoordinates[1];

  return toCapitalize(name) as Capitalize<ScrollRefCoordinates[0]>;
};

/**
 * 스타일 속성 반환
 * 
 * @param direction 스크롤 방향({@link ScrollDirectionValue})
 */
const getStyleProp = (direction: ScrollDirectionValue): WrapperStyleProp => {
  return ScrollDirection.Horizontal === direction ? {
    transformFunctionName: 'translateX',
    size: 'width'
  } : {
    transformFunctionName: 'translateY',
    size: 'height'
  };
};

/**
 * 시작 및 끝 속성에 대한 wrapper style 객체 반환
 * 
 * @param computedStyle 계산된 스타일
 * @param scrollRefCoordinates {@link ScrollRefCoordinates} 
 * @param prop 속성명
 */
const wrapperStartOrEndStyleValue = (computedStyle: CSSStyleDeclaration, prop: SizeName) => {
  const value = computedStyle[prop];

  return {
    /** 속성 값 반환 */
    value: () => value,
    /** 속성 값 숫자형식으로 반환 */
    number: () => value ? Number.parseFloat(value.toString()) : NaN,
  }
};

/**
 * 적용 된 inline 스타일 반환
 * 
 * @param wrapper 
 */
const getAppliedInlineStyles = (wrapper: HTMLElement) => {
  const wrapperStylesText = wrapper.style.cssText;

  return wrapperStylesText
    ? Object.fromEntries(wrapperStylesText.split(';').slice(0, -1).map(v => {
      const [key, value] = v.split(':');

      return [key, value.trim()]
    }))
    : {};
};

/**
 * wrapper 적용 할 스타일 반환
 * 
 * @param wrapper 스크롤 wrapper
 * @param styleProp {@link WrapperStyleProp} 
 * @param styleWrapper {@link StyleWrapper} 
 */
const getWrapperStyle = (wrapper: HTMLElement, styleProp: WrapperStyleProp, styleWrapper: StyleWrapper): StyleReturnType => {
  const wrapperStyles = getAppliedInlineStyles(wrapper);
  const transform = wrapper.style.transform;
  const transformFunction = `${styleProp.transformFunctionName}(${(styleWrapper.current)}px)`;
  const regex = new RegExp(`${styleProp.transformFunctionName}(.+)`);
  const styles: StyleReturnType = {};

  for (const [k, v] of Object.entries(wrapperStyles)) {
    styles[k] = v;
  }

  styles.transform = transform
    ? wrapper.style.transform.replace(regex, transformFunction)
    : transformFunction;

  return styles;
}

/**
 * wrapper 초기화 스타일 반환
 * 
 * @param wrapper 스크롤 wrapper
 * @param styleProp {@link WrapperStyleProp}
 */
const getResetWrapperStyles = (wrapper: HTMLElement, styleProp: WrapperStyleProp) => {
  const transform = wrapper.style.transform;
  const transformFunction = `${styleProp.transformFunctionName}(0px)`;
  const regex = new RegExp(`${styleProp.transformFunctionName}(.+)`);
  const styles: StyleReturnType = {};

  styles.transform = transform
    ? wrapper.style.transform.replace(regex, transformFunction)
    : transformFunction;

  return styles;
};

/**
 * {@link SizeSingleName}에 대한 빈 시작영역 사이즈 반환
 * 
 * @param args {@link CSSStyleDeclaration} {@link ScrollRefCoordinates} {@link SizeSingleStartName}
 */
const getWrapperSingleNameStartEmptySize = (args: [CSSStyleDeclaration, ScrollRefCoordinates, SizeSingleStartName]) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getStartDirectionName(args[1])}`).number();

/**
 * {@link SizeSingleName}에 대한 빈 끝영역 사이즈 반환
 * 
 * @param args {@link CSSStyleDeclaration} {@link ScrollRefCoordinates} {@link SizeSingleStartName}
 */
const getWrapperSingleNameEndEmptySize = (args: [CSSStyleDeclaration, ScrollRefCoordinates, SizeSingleStartName]) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getEndDirectionName(args[1])}`).number();

/**
 * {@link SizePairName}에 대한 빈 시작영역 사이즈 반환
 * 
 * @param args {@link CSSStyleDeclaration} {@link ScrollRefCoordinates} {@link SizePairStartName} {@link SizePairEndName}
 */
const getWrapperPairNameStartEmptySize = (args: [CSSStyleDeclaration, ScrollRefCoordinates, SizePairStartName, SizePairEndName<SizePairStartName>]) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getStartDirectionName(args[1])}${toCapitalize(args[3])}`).number();

/**
 * {@link SizePairName}에 대한 빈 끝영역 사이즈 반환
 * 
 * @param args {@link CSSStyleDeclaration} {@link ScrollRefCoordinates} {@link SizePairStartName} {@link SizePairEndName}
 */
const getWrapperPairNameEndEmptySize = (args: [CSSStyleDeclaration, ScrollRefCoordinates, SizePairStartName, SizePairEndName<SizePairStartName>]) => wrapperStartOrEndStyleValue(args[0], `${args[2]}${getEndDirectionName(args[1])}${toCapitalize(args[3])}`).number();

/**
 * wrapper에 대한 사이즈 정보를 담고 있는 클로저
 * 
 * @param computedStyle 계산 된 사이즈
 * @param scrollRefCoordinates {@link ScrollRefCoordinates} 
 */
const wrapperStyles = (computedStyle: CSSStyleDeclaration, scrollRefCoordinates: ScrollRefCoordinates) => {
  const args: [CSSStyleDeclaration, ScrollRefCoordinates] = [computedStyle, scrollRefCoordinates];

  return {
    getStartEmptySize: (name: SizeSingleStartName) => getWrapperSingleNameStartEmptySize([...args, name]),
    getEndEmptySize: (name: SizeSingleStartName) => getWrapperSingleNameEndEmptySize([...args, name]),
    getEmptySizeSum: (name: SizeSingleStartName) => getWrapperSingleNameStartEmptySize([...args, name]) + getWrapperSingleNameEndEmptySize([...args, name]),
    getPairStartEmptySize: (startName: SizePairStartName, endName: SizePairEndName<typeof startName>) => getWrapperPairNameStartEmptySize([...args, startName, endName]),
    getPairEndEmptySize: (startName: SizePairStartName, endName: SizePairEndName<typeof startName>) => getWrapperPairNameEndEmptySize([...args, startName, endName]),
    getPairEmptySizeSum: (startName: SizePairStartName, endName: SizePairEndName<typeof startName>) => getWrapperPairNameStartEmptySize([...args, startName, endName]) + getWrapperPairNameEndEmptySize([...args, startName, endName]),
  };
};

export {
  wrapperStyles,
  getStyleProp,
  getWrapperStyle,
  getResetWrapperStyles,
  getStartDirectionName,
};

export type {
  StyleReturnType,
  StyleWrapper,
};