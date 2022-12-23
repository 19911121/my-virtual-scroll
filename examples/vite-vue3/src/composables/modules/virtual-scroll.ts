import { nextTick, onMounted, PropType, ref, watch } from 'vue';
import MyVirtualScroll from '../../../../../src/my-virtual-scroll';
import type { MyVirtualScrollOptions } from '../../../../../src/my-virtual-scroll';
import type { CustomEmit, PropRequiredTrue } from '@/interfaces/types';

// #region Emits & Props
type Emits = 'container-scroll' | 'updated';
interface Props {
  uniqueKey: string | number | symbol;
  direction: MyVirtualScrollOptions['direction'];
  containerTag: string;
  containerClass: string | Record<string, any>;
  containerStyle: Record<string, any>;
  wrapperTag: string;
  wrapperClass: string | Record<string, any>;
  wrapperStyle: Record<string, any>;
  itemTag: string;
  itemClass: string | Record<string, any>;
  itemStyle: Record<string, any>;
  rowSize: MyVirtualScrollOptions['rowSize'];
  bench: MyVirtualScrollOptions['bench'];
  rows: any[];
  autoStyles: boolean;
}

const emits: Emits[] = ['container-scroll', 'updated'];
const props = {
  uniqueKey: {
    type: [String, Number, Symbol] as PropType<Props['uniqueKey']>,
    required: true as const,
  },

  /** 스크롤 방향 */
  direction: {
    type: String as PropType<Props['direction']>,
    default: 'vertical',
    required: false,
  },

  containerTag: {
    type: String as PropType<Props['containerTag']>,
    default: 'div',
    required: false,
  },

  containerClass: {
    type: [String, Object] as PropType<Props['containerClass']>,
    default: '',
    required: false,
  },

  containerStyle: {
    type: [String, Object] as PropType<Props['containerStyle']>,
    default: '',
    required: false,
  },

  wrapperTag: {
    type: String as PropType<Props['wrapperTag']>,
    default: 'ul',
    required: false,
  },

  wrapperClass: {
    type: [String, Object] as PropType<Props['wrapperClass']>,
    default: '',
    required: false,
  },

  wrapperStyle: {
    type: [Object] as PropType<Props['wrapperStyle']>,
    default: () => {
      return {};
    },
    required: false,
  },

  itemTag: {
    type: String as PropType<Props['itemTag']>,
    default: 'li',
    required: false,
  },

  itemClass: {
    type: [String, Object] as PropType<Props['itemClass']>,
    default: '',
    required: false,
  },

  itemStyle: {
    type: [String, Object] as PropType<Props['itemStyle']>,
    default: '',
    required: false,
  },

  /** row height (px) */
  rowSize: {
    type: Number as PropType<Props['rowSize']>,
    default: 0,
    required: false,
  },

  bench: {
    type: Number as PropType<Props['bench']>,
    default: 0,
    required: false,
  },

  rows: {
    type: Array as PropType<Props['rows']>,
    required: true as PropRequiredTrue,
  },

  autoStyles: {
    type: Boolean as PropType<Props['autoStyles']>,
    default: false,
    required: false,
  },
};
// #endregion

export default function virtualScrollComposable(emit: CustomEmit<Emits>, props: Props) {
  let myVirtualScroll: MyVirtualScroll;

  /**
   * 렌더링 할 Rows
   */
  const renderRows = ref<MyVirtualScrollOptions['rows']>([]);
  const refContainer = ref<HTMLElement>();
  const refWrapper = ref<HTMLElement>();

  // #region container
  const updateRows = () => {
    if (!myVirtualScroll) return;
    if (!props.autoStyles) updateWrapperStyle();

    renderRows.value = myVirtualScroll.getRenderRows();
    firstRenderRow.value = myVirtualScroll.getRenderFirstRow();
  }; 

  /**
   * 1. container 스크롤 이벤트 발생 시 호출
   * 
   * @param e 
   */
  const handleContainerScroll = (e: Event) => {
    updateRows();

    emit('container-scroll', e);
  };
  // #endregion

  // #region wrapper
  const wrapperStyle = ref<Record<string, any>>();

  const updateWrapperStyle = () => {
    if (!myVirtualScroll) return;
    if ('string' === typeof props.wrapperStyle) return;
    
    wrapperStyle.value = {
      ...myVirtualScroll.getWrapperStyle(),
      ...props.wrapperStyle,
    };
  };
  // #endregion

  const firstRenderRow = ref(0);

  /**
   * 모듈 초기화
   */
  const initModule = async () => {
    await nextTick();

    watch(() => props.rows, async (newValue) => {
      // 동적으로 생성하는 경우에는 초기 데이터 필요
      if (!props.rowSize) renderRows.value = newValue;

      await nextTick();
      
      if (!refContainer.value || !refWrapper.value) return;
      if (myVirtualScroll) {
        const vs = myVirtualScroll.updateRows(newValue);

        await nextTick();
        vs.rendered();
      }
      else {
        myVirtualScroll = new MyVirtualScroll(refContainer.value, refWrapper.value, {
          rowSize: props.rowSize,
          bench: props.bench,
          rows: newValue,
          direction: props.direction,
          autoStyles: props.autoStyles,
        });
        myVirtualScroll.addContainerScrollEvent(handleContainerScroll);
      }

      updateRows();
      emit('updated');
    }, {
      immediate: true,
      flush: 'post'
    });
  };

  onMounted(() => {
    initModule();
  });

  return {
    refContainer,
    renderRows,
    refWrapper,
    wrapperStyle,
    firstRenderRow,
  };
}

export type {
  Emits,
  Props,
};

export {
  emits,
  props,
};