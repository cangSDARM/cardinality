<script setup>
import { CMSketch } from "./_cms";
import { onMounted, ref, shallowRef, watch } from "vue";
import { renderToString } from "katex";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const properties = ref([
  {
    name: "预估正确概率",
    val: 0,
  },
  {
    val: 0,
    name: "存储占用 (Kb)",
  },
  {
    val: 0,
    name: "节省的存储 (Kb)",
  },
  {
    val: 0,
    name: "哈希数量",
  },
  {
    name: "哈希计数器大小",
    val: 0,
  },
]);
const controls = ref([
  { name: "\\varepsilon", min: 0.0001, max: 0.01, step: 0.0001, val: 0.0001 },
  { name: "\\delta", min: 0.01, max: 1, step: 0.01, val: 0.99 },
  { name: "\\text{Seed}", min: 0, max: 10000, step: 1, val: 5000 },
  { name: "\\text{基数}", min: 0, max: 50000, step: 1, val: 1000 },
  { name: "U", min: 0, max: 50000, step: 1, val: 4000 },
]);

let chart;
let timeout;

const createChart = chartId => {
  if (chart && chart instanceof Chart) {
    chart.destroy();
  }

  const ctx = document.getElementById(chartId);
  chart = new Chart(ctx, {
    type: "scatter",
    data: {
      datasets: [
        {
          data: [],
          backgroundColor: "#6699CC",
          borderColor: "#6699CC",
          pointStyle: "circle",
          pointRadius: 8,
          pointHoverRadius: 10,
          label: "置信范围内",
        },
        {
          data: [],
          backgroundColor: "#FF2233",
          borderColor: "#FF2233",
          pointStyle: "circle",
          pointRadius: 8,
          pointHoverRadius: 10,
          label: "超出置信范围",
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "white",
          },
          display: true,
        },
        tooltip: {
          enabled: false,
        },
      },
      scales: {
        x: {
          border: {
            color: "#aaa",
          },
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
          title: {
            display: false,
          },
        },
        y: {
          border: {
            color: "#aaa",
          },
          ticks: {
            display: false,
          },
          grid: {
            display: false,
          },
          title: {
            display: false,
          },
        },
      },
    },
  });
};
const computeCMS = () => {
  if (!chart) return;

  const epsilon = Math.max(controls.value[0].val, 0.0001);
  const delta = Math.max(controls.value[1].val, 0.01);
  const seed = controls.value[2].val;
  const cardinality = controls.value[3].val;
  const volume = controls.value[4].val;

  const data = [];
  const estimate = [];
  const sketch = new CMSketch(epsilon, delta, seed);
  const space = sketch.space();
  const depth = sketch.depth();
  const width = sketch.width();

  properties.value[1].val = space / 1024;
  properties.value[2].val = 0;
  properties.value[3].val = width;
  properties.value[4].val = depth;

  const animate = (delay, start, step) => {
    if ("undefined" == typeof start) {
      clearTimeout(timeout);
      chart.data.datasets[0].data = [];
      chart.data.datasets[1].data = [];
      start = 0;
    }
    if (start > volume) return;
    if ("undefined" == typeof step) {
      step = Math.ceil(volume / 75);
    }

    const limit = Math.min(start + step, volume);
    // Generate data from [0, volume] step items at a time.
    for (let n = start; n < limit; n = n + 1) {
      let key = "k" + n;
      let val = n;
      let est = sketch.update(key, val);
      data.push(val);
      estimate.push(est);
    }
    // Update the series used to draw the graph
    let errors = 0;
    for (var i = start; i < limit; i++) {
      // Look at all of the data to determine the actual error, but only draw
      // one step'th the datapoints to keep the svg simple.
      const pt = { x: data[i], y: estimate[i] };
      if (typeof pt.x == "undefined" || typeof pt.y == "undefined") {
        break;
      }
      if (pt.y <= pt.x + epsilon * pt.x) {
        chart.data.datasets[0].data.push(pt);
      } else {
        errors += 1;
        chart.data.datasets[1].data.push(pt);
      }
      chart.update();
      break;
    }

    // Update the output variables
    properties.value[0].val = 1;
    properties.value[2].val = /* sizeof(long) */ (8 * cardinality - space) / 1024;
    if (errors > 0) {
      properties.value[0].val = 1 - errors / properties.value[1].val;
    }

    timeout = setTimeout(function () {
      animate(1, start + step, step);
    }, 20);
  };

  animate(1);
};

const onReset = () => {
  [0.0001, 0.99, Math.floor(Math.random() * 1000), 1000, 4000].forEach((v, i) => {
    controls.value[i].val = v;
  });
};

watch(
  controls,
  () => {
    computeCMS();
  },
  { immediate: true, deep: true }
);
onMounted(() => {
  if (!chart) {
    createChart("chart", [], []);
  }
});
</script>

<template>
  <h3>动手试一试</h3>
  <p>假设输入的数值(基数)<span v-html="renderToString('x')" />被输入<span v-html="renderToString('x')"/>次。我们使用 CMS 预估所有数据的次数。</p>
  <p>当数据点超出置信范围时，会以红色显示。作为参考，一个完美的估计应该看起来像一条对角线，并且完全不包含红色。</p>

  <main class="flex flex-col items-center">
    <h4>真实值 (x轴) vs. 预估值 (y轴)</h4>

    <div class="chart-container">
      <div style="float: left">
        <h6 class="text-center">属性:</h6>
        <section class="ui-widget-content properties flex flex-col gap-1">
          <div v-for="(property, i) in properties" class="grid grid-cols-2 grid-rows-1 justify-stretch gap-1">
            <span class="justify-self-end">{{ property.name }}</span>
            <input
              size="8"
              disabled
              :style="
                i === 0
                  ? property.val < controls[1].val
                    ? { color: 'rgb(0, 128, 0)', 'font-weight': 'normal' }
                    : { color: 'rgb(128, 0, 0)', 'font-weight': 'boldest' }
                  : {}
              "
              :value="property.val"
            />
          </div>
        </section>
        <h6 class="text-center">参数:</h6>
        <div class="ui-widget-content controls flex flex-col gap-1">
          <div v-for="control in controls" class="grid grid-cols-3 grid-rows-1 justify-stretch gap-1">
            <span class="justify-self-end" v-html="renderToString(control.name)" />
            <input size="8" :value="control.val" @input="control.val = Number($event.target.value)" />
            <input
              size="8"
              type="range"
              :min="control.min"
              :max="control.max"
              :step="control.step"
              :value="control.val"
              @input="control.val = Number($event.target.value)"
            />
          </div>
          <div class="flex flex-row justify-between">
            <span>重置</span>
            <button type="button" @click="onReset">重置</button>
          </div>
        </div>
      </div>
      <canvas id="chart" style="float: left; padding: 5px" width="500" height="400"></canvas>
    </div>
  </main>
</template>

<style scoped lang="less">
.chart-container {
  font-family: Arial;
  font-size: 12px;
  color: #fff;
  background: #404040;
  display: inline-block;
  padding: 12px 5px;
  border-radius: 2px;
  position: relative;

  .ui-widget-content {
    border: 1px solid #555555;
    background: #000000;
    color: #ffffff;
    width: 220px;
    padding: 0.25em;
    input {
      background-color: field;
      color: fieldtext;
      font-family: Verdana, Arial, sans-serif;
      font-size: 1em;
      padding: 1px 2px;

      &:disabled {
        cursor: default;
        color: light-dark(rgb(84, 84, 84), rgb(170, 170, 170));
        background-color: light-dark(rgba(239, 239, 239, 0.7), rgba(59, 59, 59, 0.3));
      }
    }
    button {
      background-color: buttonface;
      color: buttontext;
      padding: 0 1em;
    }
  }
}
</style>
