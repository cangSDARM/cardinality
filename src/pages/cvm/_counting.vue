<script setup lang="ts">
import { Chart, registerables } from "chart.js";
import annotation from "chartjs-plugin-annotation";
import { computed, onMounted, ref, watch } from "vue";
import { arithmeticMean, calcF0, CVM, getCountDataset, standardError } from "./_utils";
import { renderToString } from "katex";

Chart.register(...registerables, annotation);

const times = ref(2000);
const inputs = ref({
  text: "",
  f0: 0,
  n: 0,
});
const variables = ref({
  delta: 0.1,
  epsilon: 0.5,
  t: 0,
});
let chart: Chart;
let segments: string[] = [];

const range = computed(() => [
  (1 - variables.value.epsilon) * inputs.value.f0,
  (1 + variables.value.epsilon) * inputs.value.f0,
]);

const setInput = (text: string) => {
  const [segs, f0, n] = calcF0(text, ["zh-CN", "en"]);
  inputs.value = {
    text,
    f0,
    n,
  };
  segments = segs;
};

const onSampleChange = (e: Event) => {
  inputs.value.text = (e.target as HTMLTextAreaElement).value;
};
const setHamletAsSample = () => {
  import("./_hamlet.txt?raw").then(text => setInput(text.default));
};
const setTheBeastAsSample = () => {
  import("./_TheBeastThatShouted.txt?raw").then(text => setInput(text.default));
};
const setAtTheMountainsAsSample = () => {
  import("./_AtTheMountainsOfMadness.txt?raw").then(text => setInput(text.default));
};

const createChart = (chartId: string, labels: any, chartData: any) => {
  if (chart && chart instanceof Chart) {
    chart.destroy();
  }

  const ctx = document.getElementById(chartId)! as HTMLCanvasElement;
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          data: chartData,
          backgroundColor: "#25a",
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        annotation: {
          annotations: {
            currentTime: {
              type: "line",
              scaleID: "y",
              borderWidth: 0,
              value: ctx => {
                // @ts-ignore
                const max = Math.max(...ctx.chart.data.datasets[0].data);
                return max < 0 ? 1 : max;
              },
              label: {
                rotation: "auto",
                position: "end",
                backgroundColor: "black",
                content: "当前次数",
                display: true,
              },
            },
            se: {
              type: "line",
              borderWidth: 0,
              borderColor: "#FF8822",
              xMax: 0,
              xMin: 0,
              xScaleID: "x",
              yMax: 0,
              yMin: 0,
              yScaleID: "y",
            },
            f0: {
              type: "line",
              scaleID: "x",
              borderWidth: 0,
              borderColor: "#FF8822",
              value: () => inputs.value.f0,
              label: {
                position: "start",
                backgroundColor: "#FF8822",
                content: () => "真实值: " + inputs.value.f0,
                display: false,
              },
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          grid: {
            display: true,
          },
          ticks: {
            maxTicksLimit: 16,
          },
          title: {
            display: true,
            text: "区间",
            align: "end",
            font: { size: 12 },
          },
        },
        y: {
          grid: {
            display: true,
          },
          ticks: {
            // @ts-ignore
            beginAtZero: true,
          },
          title: {
            display: true,
            text: "频率",
            align: "end",
            font: { size: 12 },
          },
        },
      },
    },
  });
};
const computeCVM = async () => {
  console.log("compute %d", times.value);

  chart.options.scales!.x!.min = range.value[0];
  chart.options.scales!.x!.max = range.value[1];
  // @ts-ignore
  chart.options.plugins.annotation.annotations.se.borderWidth = 2;
  // @ts-ignore
  chart.options.plugins.annotation.annotations.f0.borderWidth = 2;
  // @ts-ignore
  chart.options.plugins.annotation.annotations.f0.label.display = true;
  chart.update();

  const samples: number[] = [];
  for (let i = 0; i < times.value; i++) {
    const { labels, data } = getCountDataset(samples);
    const mean = arithmeticMean(samples);
    const se = standardError(samples, mean);

    samples.push(CVM(segments, variables.value.t));
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    // @ts-ignore
    chart.options.plugins.annotation.annotations.currentTime.label.content = `当前次数: ${i + 1}；CVM 平均：${mean.toFixed(2)}；标准差：${se.toFixed(2)}`;
    // @ts-ignore
    chart.options.plugins.annotation.annotations.se.xMin = mean - se;
    // @ts-ignore
    chart.options.plugins.annotation.annotations.se.xMax = mean + se;
    // @ts-ignore
    chart.options.plugins.annotation.annotations.se.yMax = arithmeticMean(data);
    // @ts-ignore
    chart.options.plugins.annotation.annotations.se.yMin = arithmeticMean(data);

    chart.options.scales!.x!.min = Math.min(...labels);
    chart.options.scales!.x!.max = Math.max(...labels);

    chart.update();

    await new Promise(resolve => requestAnimationFrame(resolve));
  }
};

watch([inputs, variables], ([{ n }, { delta, epsilon }]) => {
  if (n < 0.1) {
    variables.value.t = 0;
  } else {
    variables.value.t = Math.ceil((12 / epsilon ** 2) * Math.log2((8 * n) / delta));
  }
});
onMounted(() => {
  if (!chart) {
    createChart("chart-container", [], []);
  }
});
</script>

<template>
  <h3>动手试一试</h3>
  <section class="flex flex-col gap-4">
    <div class="flex flex-row gap-4">
      <div class="flex flex-col gap-4">
        预设：
        <button class="btn btn-primary" v-on:click="setHamletAsSample">哈姆雷特-莎士比亚</button>
        <button class="btn btn-secondary" v-on:click="setTheBeastAsSample">在世界的中心呼唤爱的野兽-哈兰·埃里森</button>
        <button class="btn btn-primary" v-on:click="setAtTheMountainsAsSample">疯狂山脉-爱手艺</button>
      </div>
      <label class="flex flex-col flex-grow">
        <span>
          <strong>给定参数集合文字（Intl.Segmenter 分词）</strong>
          <button class="btn btn-primary" @click="setInput(inputs.text)">计算</button>
        </span>
        <textarea class="border" rows="8" columns="80" @change="onSampleChange">{{ inputs.text }}</textarea>
      </label>
    </div>
    <div>
      <label class="grid grid-cols-7 gap-4 items-center mb-4">
        <span v-html="renderToString('\\delta')"></span>
        <input class="form-control" type="number" v-model="variables.delta" />
        <input
          class="form-control"
          type="range"
          min="0.0001"
          max="1"
          :value="variables.delta"
          @input="variables.delta = Number(($event.target as HTMLInputElement).value)"
          step="0.0001"
        />
      </label>
      <label class="grid grid-cols-7 gap-4 items-center">
        <span v-html="renderToString('\\varepsilon')"> </span>
        <input class="form-control" type="number" v-model="variables.epsilon" />
        <input
          class="form-control"
          type="range"
          min="0"
          max="1"
          :value="variables.epsilon"
          @input="variables.epsilon = Number(($event.target as HTMLInputElement).value)"
          step="0.0001"
        />
      </label>
    </div>
    <div class="flex flex-row justify-center gap-4">
      <span
        v-html="
          renderToString(
            String.raw`
\left\{ \begin{aligned}
  n &= ${inputs.n} \\
  F_0(\mathcal{A}) &= ${inputs.f0} \\
  \mathcal{t} &= ${variables.t} \\
  \mathcal{R} &= [${range[0]}, ${range[1]}] \\
  Pr[c\in\mathcal{R}] &\geq ${1 - variables.delta}
\end{aligned} \right.`,
            {
              displayMode: true,
            }
          )
        "
      />
    </div>
  </section>

  <label class="grid grid-cols-7 gap-4 items-center mb-4 mt-10">
    <span>CVM 算法运行次数</span>
    <input class="form-control" type="number" v-model="times" />
    <input
      class="form-control"
      type="range"
      min="1"
      max="5000"
      :value="times"
      @input="times = Number(($event.target as HTMLInputElement).value)"
      step="1"
    />
    <button
      class="btn btn-primary disabled:cursor-not-allowed disabled:opacity-75"
      :disabled="variables.delta < 0 || inputs.f0 < 1 || variables.t < 0"
      @click="computeCVM()"
    >
      RUN
    </button>
  </label>
  <section class="flex flex-row justify-center">
    <canvas id="chart-container" height="400" width="600"></canvas>
  </section>
</template>

<style scoped lang="css">
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
  grid-column: span 2 / span 2;
}
</style>
