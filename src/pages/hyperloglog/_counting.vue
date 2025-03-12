<script lang="ts" setup>
import { ref, onMounted, onUpdated } from "vue";
import { HyperLogLog } from "./_hyperloglog";
import { Chart, registerables } from "chart.js";
import annotation from "chartjs-plugin-annotation";
import { murmurhash3_32_gc } from "./_murmurhash3.js";
import { getLinearCountChart } from "./_chart.js";
import { KATEX_RENDERS } from "./_katex.js";

Chart.register(...registerables, annotation);

function random_unique(num = 1) {
  const data: Record<string, number> = {};
  for (let i = 0; i < num; i++) {
    while (true) {
      const r = (Math.floor(Math.random() * 1000000000) + 1).toString();
      if (!data.hasOwnProperty(r)) {
        data[r] = 0;
        break;
      }
    }
  }

  const iterations = 1000000 / num;
  const keys = Object.keys(data);
  const result = [];
  for (let i = 0; i < iterations; i++) {
    for (let q = 0; q < keys.length; q++) {
      result.push(keys[q]);
    }
  }
  return result;
}

//TODO move this
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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const DEFAULT_PRECISION = 10;

const cardinality_examples = ref([1, 10, 100, 1000, 10000, 100000, 1000000]);
const cardinalityDatasets = ref<Record<string, any[]>>({});
const precision = ref(DEFAULT_PRECISION);
const hll = ref(HyperLogLog(DEFAULT_PRECISION));
const result = ref<(ReturnType<ReturnType<typeof HyperLogLog>["count"]> & { actual_cardinality: number }) | null>(null);
const registers = ref<number[][]>([]);
const selectedCard = ref(1000);
const isProcessing = ref(false);
let chart: Chart;

const reset = (p: number) => {
  if (p && p !== DEFAULT_PRECISION) {
    precision.value = p;
    hll.value = HyperLogLog(p);
  } else {
    precision.value = DEFAULT_PRECISION;
    hll.value = HyperLogLog(DEFAULT_PRECISION);
  }
  result.value = null;
  registers.value = [];
};

function random_unique_update(c: number) {
  return new Promise<void>(function (resolve, reject) {
    reset(precision.value);
    setTimeout(function () {
      console.log("before resolve");
      if (c != null) {
        selectedCard.value = c;
      }
      //if (this.cardinalityDatasets.hasOwnProperty(this.selectedCard.toString()) == false) {
      cardinalityDatasets.value[selectedCard.value.toString()] = random_unique(selectedCard.value);
      //}
      var data = cardinalityDatasets.value[selectedCard.value.toString()];

      for (var i = 0; i < data.length; i++) {
        hll.value.add(murmurhash3_32_gc(data[i], 100));
      }

      result.value = {
        ...hll.value.count(),
        actual_cardinality: selectedCard.value,
      };
      if (result.value.m > 8192) {
        registers.value = [0] as any;
      } else {
        registers.value = buckets_to_rows(hll.value.buckets, 64);
      }

      resolve();
    }, 0);
  });
}

const randomUnique = async (c?: any) => {
  isProcessing.value = true;
  await sleep(200);
  console.log("calling");
  await random_unique_update(c);
  isProcessing.value = false;
  console.log("Done");
};

const createChart = (chartId: string, chartData: any) => {
  if (chart && chart instanceof Chart) {
    chart.destroy();
  }

  const ctx = document.getElementById(chartId)! as HTMLCanvasElement;
  chart = new Chart(ctx, {
    type: chartData.type,
    data: chartData.data,
    options: chartData.options,
  });
};

onMounted(() => {
  randomUnique();
});
onUpdated(() => {
  if (
    result.value != null &&
    result.value.correction_used != null &&
    result.value.correction_used.name === "LinearCount"
  ) {
    createChart("linear-count-chart", getLinearCountChart(result.value.m, result.value.correction_used.metadata.V));
  }
});
</script>

<template>
  <div class="relative w-full px-2">
    <h1>
      Counting
      <small style="font-size: 16px; font-style: italic" v-if="isProcessing"> loading 💫 </small>
    </h1>
    <p style="text-align: justify">
      <i
        >This algorithm approximates the number of unique items (<i>cardinality</i>) of a multiset. This is achieved by
        using a hash function that is applied to every element that is to be counted. The algorithm observes the maximum
        number of leading zeros that occur for all hash values, where intuitively hash values with more leading zeros
        are less likely and indicate a larger cardinality.</i
      >
    </p>
  </div>
  <hr />
  <div class="flex flex-row">
    <div class="min-md:basis-1/2 relative w-full px-3">
      <h4>Inputs</h4>
      <p>
        <small>
          <i>Insert 1,000,000 random records with a given cardinality of...</i>
        </small>
      </p>
      <div class="button-group">
        <button
          v-for="c in cardinality_examples"
          type="button"
          v-bind:title="'Insert dataset with cardinality ' + c"
          v-bind:value="c"
          v-bind:class="[selectedCard === c ? 'btn btn-primary' : 'btn btn-link']"
          v-on:click="randomUnique(c)"
        >
          {{ c }}
        </button>
      </div>
    </div>

    <div class="min-md:basis-1/2 relative w-full px-3">
      <h4>Precision</h4>
      <p>
        <small>
          <i>Smaller will give a worse estimate</i>
        </small>
      </p>
      <div>
        <span style="float: right; color: #aeaeae">
          <small>less error, more memory &rarr;</small>
        </span>
        <span style="float: left; color: #aeaeae">
          <small>&larr;greater error, less memory</small>
        </span>
      </div>

      <input
        class="form-control"
        type="range"
        min="4"
        max="16"
        step="1"
        id="slider"
        v-model="precision"
        v-on:change="randomUnique()"
      />
      <output id="precision">{{ precision }}</output>
    </div>
  </div>
  <hr />

  <div id="estimate" class="flex px-2" v-if="result !== null">
    <div class="w-full relative">
      <h3>Result</h3>

      <table class="table">
        <tbody>
          <tr class="table-info">
            <td>
              <strong>Estimate (<span v-html="KATEX_RENDERS['E']"></span>)</strong>
            </td>
            <td>
              {{ Math.round(result.estimate) }}
              <span v-if="result.correction_used">*</span>
              <small class="error"
                >({{
                  (
                    ((Math.round(result.estimate) - result.actual_cardinality) / result.actual_cardinality) *
                    100.0
                  ).toFixed(2)
                }}% error)
              </small>
            </td>
            <td></td>
          </tr>
          <tr>
            <td width="200px">
              <strong>Registers (<span v-html="KATEX_RENDERS['m']"></span>)</strong>
            </td>
            <td width="200px">{{ result.m }}</td>
            <td>The number of <a href="#registers-section">registers</a> used.</td>
          </tr>
          <tr class="table">
            <td>
              <strong>Memory used</strong>
            </td>
            <td>
              {{ result.m * 8 }}
            </td>
            <td>bytes</td>
          </tr>
        </tbody>
      </table>
      <span v-if="result.correction_used"
        >*
        <i>Estimate has been <a href="#corrections">corrected</a> using {{ result.correction_used.name }}</i>
      </span>
    </div>
  </div>
  <hr v-if="result !== null" />
  <div id="calculation" class="flex flex-wrap" v-if="result !== null">
    <div class="px-2 w-full relative">
      <h3>Calculation</h3>
      <p>
        The cardinality (<span v-html="KATEX_RENDERS['E']"></span>) is estimated by the formula
        <span v-html="KATEX_RENDERS['cardinality_estimation']"></span>
      </p>
      <table class="table">
        <tbody>
          <tr>
            <td width="200px">
              <!--{{console.log("a_m = " + katex.renderToString("a_m"))}}-->
              <span v-html="KATEX_RENDERS['a_m']"></span>
            </td>
            <td width="200px">{{ result.alpha_m }}</td>
            <td>A constant used to correct a systematic multiplicative bias</td>
          </tr>
          <tr>
            <td>
              <!--{{console.log("m^2 = " + katex.renderToString("m^2"))}}-->
              <span v-html="KATEX_RENDERS['m^2']"></span>
            </td>
            <td>{{ Math.pow(result.m, 2.0) }}</td>
            <td>The number of registers (<span v-html="KATEX_RENDERS['m']"></span>) squared</td>
          </tr>
          <tr>
            <td>
              <!--{{console.log("Z = " + katex.renderToString("Z"))}}-->
              <span v-html="KATEX_RENDERS['Z']"></span>
            </td>
            <td>{{ result.z }}</td>
            <td>
              The <a href="https://en.wikipedia.org/wiki/HyperLogLog#Count" target="new">harmonic mean</a> of the
              registers
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <hr v-if="result != null && result.correction_used" />
  <div id="corrections" class="flex flex-wrap" v-if="result !== null">
    <div class="px-2 w-full relative" v-if="result.correction_used">
      <h3>Corrections</h3>
      <a name="corrections" />
      <p>
        For certain cardinalities, the above calculation yields an incorrect result, so HyperLogLog applies a measure to
        correct this
      </p>
      <table class="table">
        <tbody>
          <tr>
            <td width="200px">
              <strong>Original estimate (<span v-html="KATEX_RENDERS['E']"></span>)</strong>
            </td>
            <td>{{ result.originalEstimate }}</td>
          </tr>
          <tr>
            <td>
              <strong>Correction Method</strong>
            </td>
            <td>
              {{ result.correction_used.name }}
              <small v-if="result.correction_used.name == 'LinearCount'"
                >(load factor = {{ result.correction_used.metadata.FillFactor }})</small
              >
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="result.correction_used.name === 'LinearCount'">
        <h5>Linear Count</h5>
        <p>
          <a href="http://dblab.kaist.ac.kr/Publication/pdf/ACM90_TODS_v15n2.pdf">Linear Count</a> is a simple counting
          algorithm that considers the <i>load factor</i> of the registers. A low <i>load factor</i> indicates the
          probability of <u>collisions</u> is low, and the cardinality can be estimated by counting the number of
          registers that are empty (<span v-html="KATEX_RENDERS['V']"></span>), and applying the following formula
          <!--{{console.log(katex.renderToString("-m \\cdot log(\\frac{V}{m})", {'displayMode': true}))}}-->
          <span v-html="KATEX_RENDERS['linear_count']"></span>
        </p>

        <p>
          As you can see from the graph below, this gives a fairly good estimate of the cardinality when the registers
          are not full, but becomes more prone to error as <span v-html="KATEX_RENDERS['V']"></span> approaches 0.
        </p>
        <p>This is why HyperLogLog only uses LinearCount for smaller cardinalities.</p>

        <div id="#linearCountChart">
          <canvas ref="linearCountChart" id="linear-count-chart"></canvas>
        </div>
      </div>
    </div>
  </div>
  <hr v-if="result !== null" />
  <a name="registers-section" />
  <div class="flex flex-wrap" v-if="registers.length > 0 && result !== null">
    <div class="px-2 w-full relative">
      <h3>
        Registers
        <small>{{ result.m }}</small>
      </h3>
      <div id="registers" v-if="result.m > 8192">
        <p>
          <i>
            There are too many registers to display here, but you can imagine it! Try setting the precision to a lower
            value if you want to see the registers in action!</i
          >
        </p>
      </div>
      <div id="registers" v-if="result.m <= 8192">
        <p>Each register represents the maximum number of leading zeroes + 1 seen.</p>
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

.katex {
  font:
    normal 1.21em KaTeX_Main,
    Times New Roman,
    serif;
  line-height: 1.2;
  white-space: nowrap;
  text-indent: 0;
  text-rendering: auto;
}

.katex-display {
  display: block;
  margin: 1em 0;
  text-align: center;
}

.error {
  color: var(--color-red-700);
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
