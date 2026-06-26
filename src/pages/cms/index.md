---
---

# Count-Min Sketch

本网站旨在探索以下论文

- [An Improved Data Stream Summary: The Count-Min Sketch and its Applications(2005)](https://dl.acm.org/doi/10.1016/j.jalgor.2003.12.001)

包含以下部分概念

- 探索 CMS 如何工作的[原理](/streaming-algorithms/cms/principle)
- 探索如何[设计最优](/streaming-algorithms/cms/optimize) CMS
- 探讨 CMS 的[衍生阅读](/streaming-algorithms/cms/more)

## 总而言之

CMS 是词频统计的利器：

- ✅ 算法效率高，内存固定
- ✅ 误差单向(返回的结果是计数上限值)

但是：

- ⚠️ 无法给出精确统计 - 结果会出现小的 +/- 偏差
- ⚠️ 不支持删除操作

潜在应用场景：

- 在微博热搜、电商搜索词、CDN 访问日志中，找出 Top-K 热词
- 在热门时段区分哪些 IP 是流量大户
- 收集用户输入热区
- SQL 选最优 Join
- 探索性分析

## 致谢

- CMS 实现和例子：https://crahen.github.io/algorithm/stream/count-min-sketch-point-query.html
- CMS 概率分析：https://florian.github.io/count-min-sketch/
- CMS 原理解析：https://zhuanlan.zhihu.com/p/369981005
