<template>
  <component
    :is="containerTag"
    ref="refContainer"
  >
    <slot name="before-wrapper"></slot>
    <component
      :is="wrapperTag"
      ref="refWrapper"
      :class="wrapperClass"
      :style="wrapperStyle"
    >
      <slot name="before-item"></slot>
      <component
        :is="itemTag"
        v-for="(row, index) in renderRows"
        :key="row[uniqueKey]"
        :class="itemClass"
        :style="itemStyle"
      >
        <slot
          :row="row"
          :row-index="firstRenderRow + index"
          :index="index"
        ></slot>
      </component>
      <slot name="after-item"></slot>
    </component>
    <slot name="after-wrapper"></slot>
  </component>
</template>
<script setup lang="ts">
  import fbModuleComposable, { emits as moduleEmits, props as moduleProps } from '@/composables/modules/virtual-scroll';

  const emit = defineEmits(moduleEmits);
  const props = defineProps(moduleProps);
  const {
    refContainer,
    refWrapper,
    renderRows,
    wrapperStyle,
    firstRenderRow,
  } = fbModuleComposable(emit, props);
</script>