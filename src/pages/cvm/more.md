---
---

# More

CVM 算是基数估计算法中的“理论新秀”，用完全不同的思路（采样）解决了同样的问题。算法十分简单优雅。
相关内容可以查看：Flajolet-Martin -> LogLog -> HyperLogLog -> HyperLogLog++

如果扩展到用有限空间估计中位数、P99 等分位数，可以参考：GK Sketch -> t-Digest -> DDSketch，其中，t-Digest 在工程上非常流行，Elasticsearch、Apache DataSketches 都有实现
