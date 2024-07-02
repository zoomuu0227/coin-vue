<script setup>
import * as echarts from 'echarts';
import {ref, onMounted, defineProps, watch} from 'vue';
import request from "../../utils/request.js";

const chart = ref(null)
const data = ref([])
const bars = ['5m', '15m', '30m', '1H', '4H', '1Dutc']
const barIndex = ref(2)
const props = defineProps({
  id: String
})

// 时间戳转年/月/日 时:分:秒
const formatDate = (timestamp) => {
  const date = new Date(+timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`
}

const getData = () => {
  request.get(`/candles?id=${props.id}&bar=${bars[barIndex.value]}`).then(res => {
    data.value = res.data
    init()
  })
}

const init = () => {
  const myChart = echarts.init(chart.value);
  let option;

  const upColor = '#ec0000';
  const upBorderColor = '#8A0000';
  const downColor = '#00da3c';
  const downBorderColor = '#008F28';
// Each item: open，close，lowest，highest
  const data0 = splitData(data.value.reverse().map(item=>[formatDate(item[0]),item[1],item[4],item[2],item[3]]));

  function splitData(rawData) {
    const categoryData = [];
    const values = [];
    for (var i = 0; i < rawData.length; i++) {
      categoryData.push(rawData[i].splice(0, 1)[0]);
      values.push(rawData[i]);
    }
    return {
      categoryData: categoryData,
      values: values
    };
  }

  function calculateMA(dayCount) {
    var result = [];
    for (var i = 0, len = data0.values.length; i < len; i++) {
      if (i < dayCount) {
        result.push('-');
        continue;
      }
      var sum = 0;
      for (var j = 0; j < dayCount; j++) {
        sum += +data0.values[i - j][1];
      }
      result.push(sum / dayCount);
    }
    return result;
  }

  option = {
    title: {
      text: props.id,
      left: 0
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      formatter: (params) => {
        const kData = params[0].data;
        const open = kData[1];
        const close = kData[2];
        const change = ((close - open) / open * 100).toFixed(2);
        return `
              Date: ${params[0].name}<br/>
              Change: ${change}%
            `;
      }
    },
    legend: {
      data: ['MA5', 'MA15', 'MA50']
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: data0.categoryData,
      boundaryGap: false,
      axisLine: {onZero: false},
      splitLine: {show: false},
      min: 'dataMin',
      max: 'dataMax'
    },
    yAxis: {
      scale: true,
      splitArea: {
        show: true
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 50,
        end: 100
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 50,
        end: 100
      }
    ],
    series: [
      {
        type: 'candlestick',
        data: data0.values,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upBorderColor,
          borderColor0: downBorderColor
        }
      },
      {
        name: 'MA5',
        type: 'line',
        data: calculateMA(5),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        },
        itemStyle: {
          opacity: 0 // 去掉圆点
        },
      },
      {
        name: 'MA15',
        type: 'line',
        data: calculateMA(15),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        },
        itemStyle: {
          opacity: 0 // 去掉圆点
        },
      },
      {
        name: 'MA50',
        type: 'line',
        data: calculateMA(50),
        smooth: true,
        lineStyle: {
          opacity: 0.5
        },
        itemStyle: {
          opacity: 0 // 去掉圆点
        },
      }
    ]
  };

  option && myChart.setOption(option);
}

const switchBar = (index) => {
  barIndex.value = index;
  getData()
}

watch(()=>props.id, (newVal, oldVal) => {
  console.log(newVal)
  if (newVal) getData()
}, {
  immediate: true
})
</script>

<template>
  <div>
    <a-button size="small" @click="switchBar(index)" v-for="(item,index) of bars" :type="index === barIndex ? 'primary':'default'">{{ item }}
    </a-button>
  </div>
  <div ref="chart" style="width: 100%; height: 400px;"></div>
</template>

<style scoped>

</style>