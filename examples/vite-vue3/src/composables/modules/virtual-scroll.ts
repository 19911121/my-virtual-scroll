import { computed, nextTick, onMounted, PropType, ref, watch } from 'vue';
import MyVirtualScroll from '../../../../../src/my-virtual-scroll';
import type { MyVirtualScrollOptions } from '../../../../../src/my-virtual-scroll';
import type { CustomEmit, PropRequiredTrue } from '@/interfaces/types';

// #region Emits & Props
type Emits = 'container-scroll' | 'updated';
interface Props {
  containerTag: string;
  containerClass: string | Record<string, any>;
  containerStyle: Record<string, any>;
  wrapperTag: string;
  wrapperClass: string | Record<string, any>;
  wrapperStyle: Record<string, any>;
  itemTag: string;
  itemClass: string | Record<string, any>;
  itemStyle: Record<string, any>;
  rowHeight: MyVirtualScrollOptions['rowHeight'];
  bench: MyVirtualScrollOptions['bench'];
  rows: any[];
  direction: MyVirtualScrollOptions['direction'];
}

const emits: Emits[] = ['container-scroll', 'updated'];
const props = {
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
  rowHeight: {
    type: Number as PropType<Props['rowHeight']>,
    default: 0,
    required: false,
  },

  bench: {
    type: Number as PropType<Props['bench']>,
    default: 5,
    required: false,
  },

  rows: {
    type: Array as PropType<Props['rows']>,
    required: true as PropRequiredTrue,
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
  /**
   * 1. container 스크롤 이벤트 발생 시 호출
   * 
   * @param e 
   */
  const handleContainerScroll = (e: Event) => {
    if (!myVirtualScroll) return;

    renderRows.value = myVirtualScroll.getRenderRows();

    updateWrapperStyle();
    firstRenderRow.value = myVirtualScroll.getRenderFirstRow();
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
      if (!props.rowHeight) renderRows.value = newValue;

      await nextTick();
      
      if (!refContainer.value || !refWrapper.value) return;
      if (myVirtualScroll) {
        const vs = myVirtualScroll.updateRows(newValue);

        vs.rendered();
      }
      else {
        myVirtualScroll = new MyVirtualScroll(refContainer.value, refWrapper.value, {
          rowHeight: props.rowHeight,
          bench: props.bench,
          rows: newValue,
          direction: props.direction
        });
        myVirtualScroll.addContainerScrollEvent(handleContainerScroll);
      }

      updateWrapperStyle();
      renderRows.value = myVirtualScroll.getRenderRows();
      
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