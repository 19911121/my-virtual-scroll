<template>
  <main>
    <h1>
      Virtual Scroll(자동 스타일 적용)
    </h1>

    <virtual-scroll
      class="virtual-scroll__conatiner"
      :rows="rows"
      :bench="3"
      auto-styles
    >
      <template #default="{ row, rowIndex }">
        <span>
          <em class="row">{{ rowIndex }}</em>
          {{ row.value }}
        </span>
      </template>
    </virtual-scroll>

    <h1>
      Virtual Scroll(자동 스타일 적용 안함)
    </h1>

    <virtual-scroll
      class="virtual-scroll__conatiner"
      :rows="rows"
      :bench="3"
    >
      <template #default="{ row, rowIndex }">
        <span>
          <em class="row">{{ rowIndex }}</em>
          {{ row.value }}
        </span>
      </template>
    </virtual-scroll>

    <h1>
      Virtual Scroll Fixed Height
    </h1>
    <virtual-scroll
      class="virtual-scroll__conatiner"
      :row-height="18"
      :rows="rows"
      :bench="3"
    >
      <template #default="{ row, rowIndex }">
        <span>
          <em class="row">{{ rowIndex }}</em>
          {{ row.value }}
        </span>
      </template>
    </virtual-scroll>

    <h1>
      Virtual Scroll Table
    </h1>

    <virtual-scroll-table
      class="virtual-scroll__conatiner"
      :rows="rows"
      :bench="1"
    >
      <template #default="{ row, rowIndex }">
        <tr>
          <td class="row">
            {{ rowIndex }}
          </td>
          <td class="value">
            {{ row.value }}
          </td>
        </tr>
      </template>
    </virtual-scroll-table>
  </main>
</template>
<script setup lang="ts">
  import { nextTick, onMounted, ref } from 'vue';
  import virtualScroll from '@/components/modules/virtual-scroll.vue';
  import virtualScrollTable from '@/components/modules/virtual-scroll-table.vue';
  import type { Ref } from 'vue';

  export interface Row {
    index: number;
    value: number;
  }

  const rows: Ref<Row[]> = ref(Array.from({ length: 5000 }, (_, i): Row => {
    return {
      index: i + 1,
      value: i
    };
  }));


  onMounted(async () => {
    await nextTick();

    setTimeout(() => {
      console.log('add rows!');

      const newRows: Row[] = Array.from({ length: 5000 }, (_, i): Row => {
        return {
          index: 100 + i + 1,
          value: 100 + i
        };
      });

      rows.value = rows.value.concat(newRows);
    }, 10000);
  });
</script>

<style lang="scss" scoped>
  .virtual-scroll {
    &__conatiner {
      display: block;
      overflow: auto;
      width: 500px;
      height: 300px;
      margin: auto;

      :deep() .row {
        display: inline-block;
        width: 100px;
      }
    }
  }
</style>