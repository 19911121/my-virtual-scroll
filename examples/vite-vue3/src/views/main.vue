<template>
  <main>
    <h1>
      Virtual Scroll
    </h1>

    <virtual-scroll
      class="virtual-scroll__conatiner"
      unique-key="index"
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
      Virtual Scroll Fixed Size
    </h1>
    <virtual-scroll
      class="virtual-scroll__conatiner"
      unique-key="index"
      :row-size="18"
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
      unique-key="index"
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

    <h1>
      Horizontal Scroll
    </h1>

    <virtual-scroll
      class="virtual-scroll__conatiner virtual-scroll__conatiner--horizontal"
      unique-key="index"
      direction="horizontal"
      :rows="rows"
      :bench="1"
      auto-styles
    >
      <template #default="{ row, rowIndex }">
        <span class="row">
          <em>{{ rowIndex }}</em>
          {{ row.value }}
        </span>
      </template>
    </virtual-scroll>

    <h1>
      Horizontal Scroll Fixed Size
    </h1>

    <virtual-scroll
      class="virtual-scroll__conatiner virtual-scroll__conatiner--horizontal"
      unique-key="index"
      direction="horizontal"
      :rows="rows"
      :bench="1"
      :row-size="100"
      auto-styles
    >
      <template #default="{ row, rowIndex }">
        <span class="row">
          <em>{{ rowIndex }}</em>
          {{ row.value }}
        </span>
      </template>
    </virtual-scroll>
  </main>
</template>
<script setup lang="ts">
  import { nextTick, onMounted, ref } from 'vue';
  import virtualScroll from '@/components/modules/virtual-scroll.vue';
  import virtualScrollTable from '@/components/modules/virtual-scroll-table.vue';
  import type { Ref } from 'vue';

  export interface Row {
    index: number;
    value: string;
    [k: `text${number}`]: any;
  }

  const rows: Ref<Row[]> = ref(Array.from({ length: 1000 }, (_, i): Row => {
    return {
      index: i + 1,
      value: `v${i}`,
      text1: 't1',
      text2: 't2',
      text3: 't3',
      text4: 't4',
      text5: 't5',
      text6: 't6',
      text7: 't7',
      text8: 't8',
      text9: 't9',
      text10: 't0',
    };
  }));

  onMounted(async () => {
    await nextTick();

    setTimeout(() => {
      console.log('add rows!');

      const newRows: Row[] = Array.from({ length: 1000 }, (_, i): Row => {
        return {
          index: 1000 + i + 1,
          value: `v${1000 + i}`
        };
      });

      rows.value = rows.value.concat(newRows);
    }, 3000);
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

      :deep() & {
        .row {
          display: inline-block;
          width: 100px;
        }
      }

      &--horizontal {
        width: 300px;
        height: 100px;
        
        :deep() {
          ul {
            display: inline-flex;
            margin: 0;
            padding: 0;
          }
        }
      }
    }
  }
</style>