<script setup lang="ts">
import { ref } from "vue";
import { HyperLogLog } from "./_hyperloglog";
import { murmurhash3_32_gc } from "./_murmurhash3.js";
import { KATEX_RENDERS } from "./_katex";

function buckets_to_rows(buckets: number[], rowsize: number) {
  var b: number[][] = [[]];
  var row = 0;
  var i = 0;
  for (const reg in buckets) {
    b[row].push(buckets[i]);
    i++;

    if (i % rowsize == 0) {
      row++;
      b[row] = [];
    }
  }
  return b;
}

function toBinary(num: number, trunc: number) {
  var b = num.toString(2);
  if (b.length === trunc) {
    return b;
  }

  return "0".repeat(trunc - b.length) + b;
}

function generateGuid() {
  var result, i, j;
  result = "";
  for (j = 0; j < 32; j++) {
    if (j == 8 || j == 12 || j == 16 || j == 20) result = result + "-";
    i = Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase();
    result = result + i;
  }
  return result;
}
const DEFAULT_PRECISION = 10;

const precision = ref(DEFAULT_PRECISION);
const hll = ref(HyperLogLog(DEFAULT_PRECISION));
const result = ref<any>(null);
const data = ref("");
const registers = ref<number[][]>([]);

const reset = (p: number) => {
  if (p !== hll.value.p) {
    hll.value = HyperLogLog(p);
  }
};

const add = () => {
  reset(precision.value);
  var addRet = hll.value.add(murmurhash3_32_gc(data.value, 100));
  var count = hll.value.count();

  result.value = {
    ...addRet,
    data: data,
    E: Math.round(count.estimate),
    m: count.m,
  };
  if (count.m > 8192) {
    registers.value = [0] as any;
  } else {
    registers.value = buckets_to_rows(hll.value.buckets, 64);
  }
};
const random = () => {
  data.value = generateGuid();
  add();
};
</script>

<template>
  <div class="flex flex-row flex-wrap mx-1 mt-[5px] mb-[10px] p-[20px] border border-black rounded-sm">
    <div class="min-md:basis-1/2 relative w-full px-3">
      <h4>数据项 (<span v-html="KATEX_RENDERS['v']"></span>)</h4>
      <div class="mb-2">
        <input placeholder="添加进 HyperLogLog 的数据" class="form-control my-2" v-model="data" type="text" />

        <button class="btn btn-primary float-right" v-on:click="add">添加</button>
        <button class="btn btn-secondary float-right" style="margin-right: 4px" v-on:click="random">随机</button>
      </div>
    </div>
    <div class="min-md:basis-1/2 relative w-full px-3">
      <h4>精度 (<span v-html="KATEX_RENDERS['p']"></span>)</h4>
      <input class="form-control" type="range" min="4" max="16" step="1" id="slider" v-model="precision" />
      <output id="precision">{{ precision }}</output>
    </div>
  </div>

  <div class="row" v-if="result">
    <div class="col">
      <p v-if="result.registerUpdated" style="font-size: 32px; padding: 16px; text-align: center">
        寄存器 #<strong>{{ result.b }}</strong> 被更新，值为 <strong>{{ result.w }}</strong>
      </p>
      <p v-if="result.registerUpdated === false" style="font-size: 32px; padding: 16px; text-align: center">
        寄存器 #<strong>{{ result.b }}</strong> 没有被更新，值为 <strong>{{ result.w }}</strong>
      </p>
    </div>
  </div>

  <div id="results" class="row" v-if="!result">
    <div class="border rounded bg-cyan-600 flex text-white my-2">
      <div class="text-center text-xl p-5 flex-grow">
        <p class="mb-0!">
          <i>尝试输入值并“添加”，或者点击“随机”插入一个随机值</i>
        </p>
      </div>
    </div>
  </div>
  <div class="row" v-if="result">
    <div class="col">
      <h3>运算结果</h3>
      <table class="table">
        <tbody>
          <tr>
            <td v-html="KATEX_RENDERS['v']"></td>
            <td>{{ result.data }}</td>
            <td></td>
          </tr>
          <tr>
            <td v-html="KATEX_RENDERS['h_v']"></td>
            <td>
              <code>{{ toBinary(result.h, 32) }}</code> ({{ result.h }})
            </td>
            <td>数据项的哈希值</td>
          </tr>
          <tr>
            <td v-html="KATEX_RENDERS['idx']"></td>
            <td>
              <code>{{ toBinary(result.b, result.p) }}</code> ({{ result.b }})
            </td>
            <td><span v-html="KATEX_RENDERS['h_v']"></span>的前 {{ result.p }} 个比特</td>
          </tr>
          <tr>
            <td v-html="KATEX_RENDERS['w']"></td>
            <td>{{ result.w }}</td>
            <td>
              剩下的 {{ 32 - result.p }} 比特中<br />
              前导零 + 1
            </td>
          </tr>

          <tr>
            <td v-html="KATEX_RENDERS['m[idx]'] + ' 是否被更新?'"></td>
            <td>
              <span v-if="result.registerUpdated">✅</span>
              <span v-if="result.registerUpdated === false">❌</span>
            </td>
            <td></td>
          </tr>
          <tr>
            <td v-html="KATEX_RENDERS['E']"></td>
            <td>{{ result.E }}</td>
            <td><a href="./counting">计数结果</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <a name="registers-section" />
  <div class="flex flex-row flex-wrap" v-if="registers.length > 0">
    <div class="flex flex-col flex-grow max-w-1/1">
      <h3>
        共有<small>{{ result.m }}</small
        >个寄存器
      </h3>
      <p>每个寄存器存储值 = max(运算结果<span v-html="KATEX_RENDERS['w']"></span>)。</p>
      <div id="registers" v-if="result.m > 8192">
        <p>
          <i>处于性能和展示方便考虑，寄存器多于 8192 个时不会显示。如果希望看到寄存器结果的可视化，请尝试将精度设置为较低的值！</i>
        </p>
      </div>
      <div id="registers" v-if="registers.length <= 8192">
        <table class="table">
          <tbody>
            <tr v-for="(row, rowindex) in registers">
              <td
                v-bind:title="'Register: ' + (rowindex * 64 + index) + '\x0AValue: ' + value"
                v-for="(value, index) in row"
                v-bind:class="[value > 0 ? 'register-on' : 'register-off']"
              >
                {{ value }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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

#registers {
  table td {
    padding: 3px;
    font-size: 10px;
    text-align: center;
    font-weight: bold;
    font-family: monospace;
  }
  .register-off {
    background-color: white;
    border-color: #dedede;
    color: #dedede;
  }
  .register-on {
    background-color: #dedede;
  }
}
</style>
