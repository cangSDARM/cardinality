---
---

# HyperLogLog

本网站旨在探索以下论文

- [HyperLogLog: the analysis of a near-optimal cardinality estimation algorithm (2007)](http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf)
- [HyperLogLog in Practice: Algorithmic Engineering of a State of The Art Cardinality Estimation Algorithm (2013)](https://research.google.com/pubs/pub40671.html)

包含以下部分概念

- 探索 HyperLogLog 如何工作的[原理](/cardinality/hyperloglog/principle)
- 探索 HyperLogLog 如何[添加数据项](/cardinality/hyperloglog/adding)
- 探索 HyperLogLog 如何[基于近似的计数](/cardinality/hyperloglog/counting)
- 探索 HyperLogLog 如何支持[合并](/cardinality/hyperloglog/merging)
- 探索 HyperLogLog 的[衍生和具体实践](/cardinality/hyperloglog/more)

## 总而言之

HyperLogLog 是基数估计的利器：

- ✅ 很快
- ✅ 占用内存小
- ✅ 可并发计算
- ✅ 满足交换律

但是：

- ⚠️ 无法给出精确统计 - 根据场景结果可能会出现小的 +/- 偏差(标准误差为 0.81%)

潜在应用场景：

- 估算有多少独立用户/IP访问了同一个网站
- 度量操作数的时间序列数据
- 数据库查询设计
- 探索性分析

## 致谢

- 原文：https://djhworld.github.io/hyperloglog/
- HyperLogLog 原理讲解：https://www.cnblogs.com/linguanh/p/10460421.html
