import virtualScrollComposable, { props as vsProps } from './virtual-scroll';
import type { Props as VSProps } from './virtual-scroll';
import type { PropType } from 'vue';
import type { CustomEmit } from '@/interfaces/types';

// #region Emits & Props
type Emits = 'container-scroll' | 'updated';
interface Props extends VSProps {
  tableClass: string | Record<string, unknown>;
  tableStyle: Record<string, any>;
}

const emits: Emits[] = ['container-scroll', 'updated'];
const props = {
  ...vsProps,
  
  tableClass: {
    type: [String, Object] as PropType<Props['tableClass']>,
    default: '',
    required: false,
  },

  tableStyle: {
    type: [String, Object] as PropType<Props['tableStyle']>,
    default: '',
    required: false,
  },

};
// #endregion

export default function virtualScrollTableComposable(emit: CustomEmit<Emits>, props: Props) {
  const {
    refContainer,
    renderRows,
    refWrapper,
    wrapperStyle,
    firstRenderRow
  } = virtualScrollComposable(emit, props);

  return {
    refContainer,
    renderRows,
    refWrapper,
    wrapperStyle,
    firstRenderRow,
  };
}

export {
  emits,
  props,
};