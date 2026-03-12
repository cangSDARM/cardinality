<script setup lang="ts">
import { ref } from "vue";
import RoaringBitmap from "./_roaringbitmap";

const roaring = RoaringBitmap();

const data = ref(0);
const result = ref<{
  length: number;
  ptr: { name: string; msb: bigint; length: number }[];
  size: number;
}>();

function toBinary(num: bigint, trunc: number) {
  var b = num.toString(2);
  if (b.length === trunc) {
    return b;
  }

  return "0".repeat(trunc - b.length) + b;
}
const getResult = () => {
  result.value = {
    length: roaring.length(),
    ptr: roaring.ptr.map(ptr => ({ name: ptr.constructor.name, msb: ptr.msb, length: ptr.length() })),
    size: roaring.size(),
  };
};
const add = () => {
  roaring.insert(data.value);
  getResult();
};
const random = () => {
  data.value = Math.floor(Math.random() * Math.pow(2, 32));
  getResult();
};
const insert1000Multiples62 = () => {
  Array.from({ length: 1000 }).forEach((_, multiplier) => {
    roaring.insert(multiplier * 62);
  });
  getResult();
};
const insert100IntegersFrom216 = () => {
  const base = Math.pow(2, 16);
  Array.from({ length: 100 }).forEach((_, adder) => {
    roaring.insert(base + adder);
  });
  getResult();
};
const insertEvenBetween131072A196607 = () => {
  const start = 131072;
  const step = 2;

  Array.from({ length: (196608 - start) / step }).forEach((_, adder) => {
    roaring.insert(start + adder * step);
  });
  getResult();
};
</script>

<template>
  <div class="flex flex-row flex-wrap mx-1 mt-[5px] mb-[10px] p-[20px] border border-black rounded-sm">
    <div class="min-md:basis-1/2 relative w-full px-3">
      <h4>数据项</h4>
      <div class="mb-2">
        <input
          placeholder="添加进 RoaringBitmap 的数据"
          class="form-control my-2"
          v-model="data"
          step="1"
          type="number"
        />

        <button class="btn btn-primary float-right" v-on:click="add">添加</button>
        <button class="btn btn-secondary float-right" style="margin-right: 4px" v-on:click="random">随机</button>
      </div>
    </div>
    <div class="min-md:basis-1/2 relative w-full px-3">
      <h4>预设</h4>

      <div>
        <button class="btn btn-primary" v-on:click="insert1000Multiples62">
          前 1000 个 62 的倍数 (0, 62, 124, 186... 61938)
        </button>
        <button class="btn btn-secondary" v-on:click="insert100IntegersFrom216">
          2^16 到 2^16 + 100 的所有整数 (65536, 65537, 65538... 65635)
        </button>
        <button class="btn btn-primary" v-on:click="insertEvenBetween131072A196607">
          131072 到 196607 之间的所有偶数 (131072, 131074, 131076... 196606)
        </button>
      </div>
    </div>
  </div>

  <div class="flex flex-row flex-wrap" v-if="result && result.length > 0">
    <div class="flex flex-col flex-grow max-w-1/1">
      <h3>
        共有
        <small>{{ result.length }}</small>
        个容器
      </h3>
      <p>
        共计占用 <small>{{ result.size }}</small> bit /
        <small>{{ (result.size / 8 / 1024).toFixed(2) }}</small>
        KB 内存
      </p>
      <div>
        <table class="table">
          <thead>
            <tr>
              <th scope="col">类型</th>
              <th scope="col">最高位</th>
              <th scope="col">含有数据个数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowindex) in result.ptr">
              <td v-bind:title="'Container: ' + rowindex + '\x0AType: ' + row.name">
                {{ row.name }}
              </td>
              <td v-bind:title="'Container: ' + rowindex + '\x0AMSB: ' + row.msb">
                {{ toBinary(row.msb, 16) }}
              </td>
              <td v-bind:title="'Container: ' + rowindex + '\x0ALength: ' + row.length">
                {{ row.length }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.form-control {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.table {
  --bs-emphasis-color: #000;
  --bs-body-bg: #fff;
  --bs-border-color: #dee2e6;
  --bs-emphasis-color-rgb: 0, 0, 0;

  --bs-table-color-type: initial;
  --bs-table-bg-type: initial;
  --bs-table-color-state: initial;
  --bs-table-bg-state: initial;
  --bs-table-color: var(--bs-emphasis-color);
  --bs-table-bg: var(--bs-body-bg);
  --bs-table-border-color: var(--bs-border-color);
  --bs-table-accent-bg: transparent;
  --bs-table-striped-color: var(--bs-emphasis-color);
  --bs-table-striped-bg: rgba(var(--bs-emphasis-color-rgb), 0.05);
  --bs-table-active-color: var(--bs-emphasis-color);
  --bs-table-active-bg: rgba(var(--bs-emphasis-color-rgb), 0.1);
  --bs-table-hover-color: var(--bs-emphasis-color);
  --bs-table-hover-bg: rgba(var(--bs-emphasis-color-rgb), 0.075);
  width: 100%;
  margin-bottom: 1rem;
  vertical-align: top;
  border: 1px solid var(--bs-table-border-color);

  tbody,
  td,
  tfoot,
  th,
  thead,
  tr {
    border-color: inherit;
    border-style: solid;
    border-width: 0;
    text-align: center;
  }
  > :not(caption) > * > * {
    padding: 0.5rem 0.5rem;
    color: var(--bs-table-color-state, var(--bs-table-color-type, var(--bs-table-color)));
    background-color: var(--bs-table-bg);
    border-bottom-width: 1px;
    box-shadow: inset 0 0 0 9999px var(--bs-table-bg-state, var(--bs-table-bg-type, var(--bs-table-accent-bg)));
  }
  thead {
    vertical-align: bottom;
  }
  tbody {
    vertical-align: inherit;
  }
}
</style>
