---
title = "more"
---

# More

本网站仅涉及原始 HyperLogLog 论文的细节。自发布以来，已经有了一些改进算法，如 [HyperLogLog++](https://research.google.com/pubs/pub40671.html)，它

- 使用 64 位整型而非 32 位
- 为寄存器引入*稀疏表示*以节省内存(而不是一个巨大的数组)
- 引入一组进一步纠偏的公式，以提高较低基数下的计数

## 衍生阅读

- Redis 中使用到 HyperLogLog 的 `PF*` [指令](https://redis.io/commands/pfcount)
  - 其 HLL 结构使用了 2^14=16384 个桶，hash 值采用 64bit 表示，除了桶编号之外剩余的 50 bit (64-14=50) 全部用于统计得分。为了确保桶中记录的分数最大范围高于 50，每个桶需要占用 6 bit 空间（2^6>50）。这样，总体的空间占用为 16384\*6bit=12KB
  - 假设，估算有多少独立用户/IP访问了同一个网站。如果 key 对应页面名称，value 对应用户 id
    - `pfadd key value` 将 key 对应的一个 value 存入
    - `pfcount key` 统计 key 的 value 有多少个

- Apache DataSketch 算法族中包含 HyperLogLog 的实现，该算法族被广泛用于许多大数据基础组件中，用于支持基数、分位数等的快速计算。例如：
  - Hive/Spark 通过官方 [UDXF](https://github.com/apache/datasketches-hive) 的方式使用 DataSketch；
  - Apache Druid 通过[官方插件](https://druid.apache.org/docs/latest/development/extensions-core/datasketches-extension.html)的形式引入 DataSketch 扩展；
  - PostgreSQL 也通过[插件](https://github.com/apache/datasketches-postgresql)形式引入 DataSketch 算法
- PrestoDB 中使用到 HyperLogLog 的 `approx_distinct` [SQL 语句](https://prestodb.io/docs/current/functions/aggregate.html#approx_distinct)
- Github 关于 HyperLogLog 实现的 [topic page](https://github.com/topics/hyperloglog)
- 原作者写的工具 [card](https://github.com/djhworld/card)。可以使用它来确定输入(通过 stdin 或文件)的近似基数，底层使用了 [Clark Duvall](https://github.com/clarkduvall) 编写的 [HyperLogLog++ 库](https://github.com/clarkduvall/hyperloglog)
- 通过概率论来计数的基本思想是根据「实验观察」与「概率理论」反推出「背后的事实」，而不是直接研究「背后的事实」，这种思想被广泛用于除 HyperLogLog 之外的很多地方，例如：[利用蒙特卡洛方法估算圆周率](https://en.wikipedia.org/wiki/Monte_Carlo_method#Overview)、[太阳升起问题](https://en.wikipedia.org/wiki/Sunrise_problem)。

## 背景介绍

- [Using Linear Counting, LogLog, and HyperLogLog to Estimate Cardinality](http://www.moderndescartes.com/essays/hyperloglog/index.html)
- [Damn Cool Algorithms: Cardinality estimation](http://blog.notdot.net/2012/09/Dam-Cool-Algorithms-Cardinality-Estimation)

### 前置研究

- LogLog
  - [Durand M., Flajolet P. (2003) Loglog Counting of Large Cardinalities. In: Di Battista G., Zwick U. (eds) Algorithms - ESA 2003. ESA 2003. Lecture Notes in Computer Science, vol 2832. Springer, Berlin, Heidelberg](http://algo.inria.fr/flajolet/Publications/DuFl03-LNCS.pdf)
- LinearCount
  - [Whang, K., Vander-Zanden, B. and Taylor, H. (1990). A linear-time probabilistic counting algorithm for database applications. ACM Transactions on Database Systems, 15(2), pp.208-229.](http://dblab.kaist.ac.kr/Publication/pdf/ACM90_TODS_v15n2.pdf)
