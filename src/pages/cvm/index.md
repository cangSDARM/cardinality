---
---

# CVM

本网站旨在探索以下论文

- [Distinct Elements in Streams: An Algorithm for the (Text) Book (2023)](https://arxiv.org/abs/2301.10191)

包含以下部分概念

- 探索 CVM 如何工作的[原理](/streaming-algorithms/cvm/principle)
- 探索 CVM 的[计算过程](/streaming-algorithms/cvm/counting)
- 探索 CVM 的[衍生阅读](/streaming-algorithms/cvm/more)

## 总而言之

CVM 是基数估计的利器：

- ✅ 算法实现简单
- ✅ 使用非常小的内存
- ✅ 理论分析优美
- ✅ 目前已知最简单的基数估计算法之一

但是：

- ⚠️ 无法给出精确统计 - 结果会出现小的 +/- 偏差
- ⚠️ 缺乏合并、插入等特性(建议使用 HyperLogLog)

潜在应用场景：

- 估算有多少独立用户/IP访问了同一个网站
- 大数据量的算法设计
- 探索性分析

## 致谢

- CVM 原理解析：https://buttondown.com/jaffray/archive/the-cvm-algorithm/
- CVM 概率分析：https://observablehq.com/@rreusser/counting-distinct-items-with-the-cvm-algorithm
- CVM 简单例子：https://skal65535.github.io/CVM/
