<template>
  <main>
    <!-- <h1>
      Virtual Scroll
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
    </virtual-scroll> -->

    <h1>
      Virtual Scroll Table
    </h1>

    <virtual-scroll-table
      class="virtual-scroll__conatiner"
      :rows="rows"
      :bench="1"
    >
      <template #before-tbody>
        <thead>
          <tr>
            <td>no</td>
            <td>value</td>
          </tr>
        </thead>
      </template>
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
  import { ref } from 'vue';
  import virtualScroll from '@/components/modules/virtual-scroll.vue';
  import virtualScrollTable from '@/components/modules/virtual-scroll-table.vue';
  import type { Ref } from 'vue';

  export interface Row {
    index: number;
    value: number;
  }

  const rows: Ref<Row[]> = ref(Array.from({ length: 10000 }, (_, i): Row => {
    return {
      index: i + 1,
      value: i
    };
  }));

  // onMounted(() => {
  //   setTimeout(() => {
  //     console.log('row update!');
  //     rows.value = rows.value.map(v => {
  //       return {
  //         row: v.row * 2,
  //         value: v.value * 2
  //       };
  //     });
  //   }, 5000);
  // });
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