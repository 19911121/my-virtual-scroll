/** 스크롤 옵션 */
interface Options {
  /**
   * 가상 스크롤 사용할 방향
   */
  direction: ScrollDirectionValue;
}

/** 스크롤 사각영역 좌표 */
type ScrollRect = Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height' | 'x' | 'y'>;

/** 스크롤 이벤트 발생 시 callback 할 함수 */
type ScrollCallBack = (e: Event) => void;

/**
 * 화면에 표시하기 위해 계산 할 좌표 위치 속성 값
 * 
 * 아래와 같이 사용
 * 
 * - 가로: left, right
 * - 세로: top, bottom
 */
type ScrollRefCoordinates = ['left', 'right'] | ['top', 'bottom'];

/** 스크롤 진행 방향 */
const ScrollDirection = {
  Horizontal: 'horizontal',
  Vertical: 'vertical'
} as const;
/** 스크롤 진행 방향을 담은 키 */
type ScrollDirectionKey = keyof typeof ScrollDirection;
/** 스크롤 진행 방향을 담은 값 */
type ScrollDirectionValue = typeof ScrollDirection[ScrollDirectionKey];

/**
 * domRect => scrollRect 변환
 *
 * @param domrect {@link DOMRect}
 */
const convertDOMRectToScrollRect = (domrect: DOMRect) => {
  const rect: ScrollRect = {
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
}

/**
 * 현재 스크롤 위치 반환
 * 
 * @param container 스크롤 타겟 요소
 * @param direction 방향 {@link Options}
 */
const getContainerCurrentScroll = (container: HTMLElement, direction: Options['direction']) => {
  return 'horizontal' === direction ? container.scrollLeft : container.scrollTop;
};


export {
  ScrollDirection,
  getContainerCurrentScroll,
  convertDOMRectToScrollRect,
};

export type {
  ScrollRect,
  ScrollCallBack,
  ScrollDirectionKey,
  ScrollDirectionValue,
  ScrollRefCoordinates,
  Options as ScrollOptions,
};