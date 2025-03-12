export function getLinearCountChart(m, V) {
  const xLabels = [];
  const yData = [];

  var b = 1;
  switch (Math.log2(m)) {
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      b = 2;
      break;
    case 9:
    case 10:
      b = 4;
      break;
    case 11:
    case 12:
      b = 16;
      break;
    case 13:
    case 14:
      b = 64;
      break;
    case 15:
    case 16:
      b = 1024;
      break;
  }
  b = b - 1;
  for (var i = 0; i < m; i += b) {
    xLabels.push(i);
    yData.push(-m * Math.log(i / m));
  }
  console.log("b =", b);

  return {
    type: "line",
    data: {
      labels: xLabels,
      datasets: [
        {
          yAxisID: "y",
          // one line graph
          label: "Estimated Cardinality (E)",
          data: yData,
          backgroundColor: "rgba(54,73,93,.5)",
          borderColor: "#36495d",
          borderWidth: 3,
          pointRadius: 0.2,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          display: true,
          title: {
            display: true,
            text: "Estimated Cardinality (E)",
          },
        },
        x: {
          type: "linear",
          bounds: "data",
          display: true,
          title: {
            display: true,
            text: "No. of empty registers (V)",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "LinearCount cardinality estimation for V",
        },
        annotation: {
          common: {
            drawTime: "afterDraw",
          },
          annotations: {
            line1: {
              type: "line",
              value: b * Math.round(V / b),
              scaleID: "x",
              borderColor: "rgb(255,99,132)",
              borderWidth: 2,
              label: {
                backgroundColor: "rgba(0,0,0,0.8)",
                color: "#fff",
                font: {
                  size: 10,
                  family: "sans-serif",
                  weight: "bold",
                },
                padding: 6,
                borderRadius: 6,
                position: "start",
                xAdjust: 25,
                yAdjust: 0,
                display: true,
                content: "V = " + V,
              },
            },
          },
        },
      },
    },
  };
}
