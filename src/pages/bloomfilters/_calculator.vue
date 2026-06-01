<script setup lang="ts">
import { ref } from "vue";
import { KATEX_RENDERS } from "./_katex";

const epsilon = ref(1);
const size = ref(10 ** 5);

const result = ref<any>(undefined);

const compute = () => {
  console.log(epsilon.value, size.value);

  const ln2 = Math.LN2;
  const mn = -(Math.log(epsilon.value * 0.01) / Math.pow(ln2, 2));
  const bits = Math.ceil(mn * size.value);
  const hash = Math.ceil(mn * ln2);

  result.value = {
    bits,
    hash,
  };
};
</script>

<template>
  <div class="flex flex-row flex-wrap mx-1 mt-[5px] mb-[10px] p-[20px] border border-black rounded-sm">
    <div class="min-md:basis-1/2 relative w-full px-3">
      <h4 class="h-[1.25em]">目标精度 (<span v-html="KATEX_RENDERS['epsilon']"></span>)</h4>
      <input
        class="form-control"
        type="number"
        max="100"
        min="0"
        v-model.number="epsilon"
        @input="epsilon = Math.max(0, Math.min(100, epsilon))"
      />
    </div>
    <div class="min-md:basis-1/2 relative w-full px-3">
      <h4 class="h-[1.25em]">预计元素个数</h4>
      <input
        class="form-control mb-2"
        type="number"
        :max="2 ** 50"
        min="0"
        v-model.number="size"
        @input="size = Math.max(0, Math.min(2**50, size))"
      />
      <button class="btn btn-primary float-right w-[6em]" v-on:click="compute">计算</button>
    </div>
  </div>

  <div class="flex flex-row justify-evenly text-2xl" v-if="result">
    <p>
      位集合需要 <strong>{{ result.bits }}</strong> bits 即 <strong>{{ (result.bits / 1024 / 1024).toFixed(2) }}</strong> MB
    </p>
    <p>
      哈希函数个数 <strong>{{ result.hash }}</strong>
    </p>
  </div>
</template>

<style lang="less">
.base {
  display: none;
}

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
</style>
