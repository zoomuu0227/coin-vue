<script setup>
import request from "../../utils/request.js";
import KLine from "@/components/KLine.vue";
import {DeleteOutlined} from '@ant-design/icons-vue'
import {onMounted, reactive, ref} from "vue";

const spinning = ref(false)
const time = ref('')

const data = ref([{
  instId: 'BTC-USDT-SWAP',
  ctValCcy: 'BTC',
}])
const list = reactive({
  bullish: [],
  bearish: [],
  observe: []
})
const start = () => {
  spinning.value = true
  // 获取当前时间 小时：分钟
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  time.value = `${hour}:${minute}`;
  request.get('/crawl').then(res => {
    data.value = [{
      instId: 'BTC-USDT-SWAP',
      ctValCcy: 'BTC',
    }, ...res.data]
    cache.storage[cache.timeStamp].filter = data.value
    cache.update()
  }).catch(err => {
    alert('筛选失败')
  }).finally(() => {
    spinning.value = false
  })
}

const current = ref({})
const show = (item) => {
  current.value = {
    ctValCcy: item['ctValCcy'],
    instId: item['instId'],
  }
}
const cache = {
  storage: {},
  timeStamp: '',
  init() {
    // 判断localstorage是否有coinResults，同时coinResults是否存在key为当日的时间戳，如果不存在则新增，否则更新
    let coinResults = localStorage.getItem('coinResults') ? JSON.parse(localStorage.getItem('coinResults')) : {}
    const now = new Date();
    // 设置小时、分钟、秒和毫秒为 0
    now.setHours(0, 0, 0, 0);
    // 获取该日期的时间戳（以毫秒为单位）
    const timestamp = now.getTime();
    this.timeStamp = timestamp
    if (!coinResults[timestamp]) {
      coinResults = {}
      coinResults[timestamp] = {
        filter: [],
        bullish: [],
        bearish: [],
        observe: []
      }
      this.storage = coinResults
      this.update()
    }
    this.storage = coinResults
  },
  get(type) {
    return this.storage[this.timeStamp][type]
  },
  set(type) {
    this.storage[this.timeStamp][type].push(current.value)
    this.update()
  },
  update() {
    localStorage.setItem('coinResults', JSON.stringify(this.storage))
  }
}
const handle = (type) => {
  cache.set(type)
}

const del = (index, type) => {
  cache.storage[cache.timeStamp][type].splice(index, 1)
  cache.update()
}

onMounted(() => {
  cache.init();
  data.value = cache.get('filter')
  list.bullish = cache.get('bullish')
  list.bearish = cache.get('bearish')
  list.observe = cache.get('observe')
})
</script>

<template>
  <a-spin :spinning="spinning">
    <a-button size="large" type="primary" @click="start">筛选</a-button>
    <div class="flex-wrap">
      <div class="flex-item">
        <h3>筛选列表: {{ time }}</h3>
        <ul>
          <li v-for="(item,index) of data">
            <a href="#" @click="show(item)">{{ item['ctValCcy'] }}</a>
          </li>
        </ul>
      </div>
      <div class="flex-item">
        <h3>看多列表</h3>
        <ul>
          <li v-for="(item,index) of list.bullish">
            <a href="#" @click="show(item)">{{ item['ctValCcy'] }}</a>
            <DeleteOutlined @click="del(index, 'bullish')"/>
          </li>
        </ul>
      </div>
      <div class="flex-item">
        <h3>看空列表</h3>
        <ul>
          <li v-for="(item,index) of list.bearish">
            <a href="#" @click="show(item)">{{ item['ctValCcy'] }}</a>
            <DeleteOutlined @click="del(index, 'bearish')"/>
          </li>
        </ul>
      </div>
      <div class="flex-item">
        <h3>观察列表</h3>
        <ul>
          <li v-for="(item,index) of list.observe">
            <a href="#" @click="show(item)">{{ item['ctValCcy'] }}</a>
            <DeleteOutlined @click="del(index, 'observe')"/>
          </li>
        </ul>
      </div>
    </div>
    <k-line :id="current['instId']"></k-line>
    <div>
      <a-button type="primary" @click="handle('bullish')">看多</a-button>
      <a-button type="primary" danger @click="handle('bearish')">看空</a-button>
      <a-button @click="handle('observe')">观察</a-button>
    </div>

  </a-spin>
</template>

<style scoped>
.flex-wrap {
  display: flex;
}

.flex-item {
  height: 300px;
  overflow-y: auto;
  padding: 0 20px;
  border: 1px solid #ccc;
}
ul {
  margin: 0;
  padding: 0;
}
li {
  list-style: none;
  padding: 5px 0;
  display: flex;
  justify-content: space-between;
  width: 200px;
}
</style>