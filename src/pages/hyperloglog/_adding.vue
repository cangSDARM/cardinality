<script setup lang="ts">
import { ref } from "vue";
import { HyperLogLog } from "./_hyperloglog";
import { murmurhash3_32_gc } from "./_murmurhash3.js";
import { KATEX_RENDERS } from './_katex'

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

const reset = (e: any, p: number) => {
  if (p !== hll.value.p) {
    hll.value = HyperLogLog(p);
  }
};

const add = () => {
  reset(null, precision.value);
  var addRet = hll.value.add(murmurhash3_32_gc(data.value, 100));
  var count = hll.value.count();

  console.log(addRet, result.value, count);

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
      <h4>Insert (<span v-html="KATEX_RENDERS['v']"></span>)</h4>
      <div class="mb-2">
        <input placeholder="a value to insert into hyperloglog" class="form-control" v-model="data" type="text" />

        <button class="btn btn-primary float-right" v-on:click="add">Add</button>
        <button class="btn btn-secondary float-right" style="margin-right: 4px" v-on:click="random">Random</button>
      </div>
    </div>
    <div class="min-md:basis-1/2 relative w-full px-3">
      <h4>Precision (<span v-html="KATEX_RENDERS['p']"></span>)</h4>
      <input class="form-control" type="range" min="4" max="16" step="1" id="slider" v-model="precision" />
      <output id="precision">{{ precision }}</output>
    </div>
  </div>

  <div class="row" v-if="result">
    <div class="col">
      <p v-if="result.registerUpdated" style="font-size: 32px; padding: 16px; text-align: center">
        Register #<strong>{{ result.b }}</strong> was updated with value <strong>{{ result.w }}</strong>
      </p>
      <p v-if="result.registerUpdated === false" style="font-size: 32px; padding: 16px; text-align: center">
        Value in register #<strong>{{ result.b }}</strong> is > <strong>{{ result.w }}</strong
        >, no update occurred.
      </p>
    </div>
  </div>

  <div id="results" class="row" v-if="!result">
    <div class="col">
      <div class="card bg-info text-white" style="margin-top: 10px; margin-bottom: 10px">
        <div class="card-body" style="text-align: center; font-size: 20px">
          <p class="card-text">
            <i>Try inserting some data above, or click "Random" to insert a random value</i>
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="row" v-if="result">
    <div class="col">
      <h3>Calculation</h3>
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
            <td>The hash of the value</td>
          </tr>
          <tr>
            <td v-html="KATEX_RENDERS['idx']"></td>
            <td>
              <code>{{ toBinary(result.b, result.p) }}</code> ({{ result.b }})
            </td>
            <td>Top {{ result.p }} bits of <span v-html="KATEX_RENDERS['h_v']"></span></td>
          </tr>
          <tr>
            <td v-html="KATEX_RENDERS['w']"></td>
            <td>{{ result.w }}</td>
            <td>
              The number of leading zeroes + 1<br />
              of the remaining {{ 32 - result.p }} bits
            </td>
          </tr>

          <tr>
            <td v-html="KATEX_RENDERS['m[idx]'] + ' updated?'"></td>
            <td>
              <span v-if="result.registerUpdated">✅</span>
              <span v-if="result.registerUpdated === false">❌</span>
            </td>
            <td></td>
          </tr>
          <tr>
            <td v-html="KATEX_RENDERS['E']"></td>
            <td>{{ result.E }}</td>
            <td>The <a href="./counting">approximate cardinality</a></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <a name="registers-section" />
  <div class="flex flex-row flex-wrap" v-if="registers.length > 0">
    <div class="flex flex-col flex-grow max-w-1/1">
      <h3>
        Registers <small>{{ result.m }}</small>
      </h3>
      <p>Each register represents the maximum number of leading zeroes + 1 seen.</p>
      <div id="registers" v-if="result.m > 8192">
        <p>
          <i
            >There are too many registers to display here, but you can imagine it! Try setting the precision to a lower
            value if you want to see the registers in action!</i
          >
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
