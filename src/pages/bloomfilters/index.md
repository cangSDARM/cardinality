---
---

# BloomFilters

本网站旨在探索以下论文

- [Space/Time Trade-offs in Hash Coding with Allowable Errors (1970)](https://dl.acm.org/doi/10.1145/362686.362692)

包含以下部分概念

- 探索 BloomFilters 如何工作的[原理](/streaming-algorithms/bloomfilters/principle)
- 探索 BloomFilters 的[概率计算过程](/streaming-algorithms/bloomfilters/probability)
- 探索 BloomFilters 的[扩展变种](/streaming-algorithms/bloomfilters/falsePositive)
- 探索 BloomFilters 的[衍生和具体实践](/streaming-algorithms/bloomfilters/more)

## 总而言之

BloomFilters 是基数查询的利器：

- ✅ 存储空间是常数
- ✅ 插入/查询时间是常数
- ✅ 无隐私问题
- ✅ 可以表示全集
- ✅ 交并差运算简单

但是：

- ⚠️ 无法给出精确结果 - 根据场景结果可能会出现误算率
- ⚠️ 存入数量增加，误算率也会跟着增加
- ⚠️ 不能从布隆过滤器中删除元素(扩展的如 CBF 可以)

潜在应用场景：

- 缓存代理服务中的缓存命中逻辑
- 数据库查询设计
- 去重
- 判断给定数据是否存在在巨大集合中
- 探索性分析

## 致谢

- BloomFilter 概率推导：https://eli.thegreenplace.net/2025/bloom-filters/
- BloomFilter 用例：https://www.cnblogs.com/liyulong1982/p/6013002.html
- BloomFilter 扩展变种讲解：https://www.cnblogs.com/88223100/p/Interpretation-of-Classic-Papers-BloonFilter.html
