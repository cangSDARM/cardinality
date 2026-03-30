---
---

# More

本网站仅涉及原始 RoaringBitmap 论文的细节。自发布以来，已经有了一些改进算法：

- 对于 int64 类型的，可以使用 Roaring64NavigableMap
  - Roaring64NavigableMap 也是使用拆分模式，将一个 int64 数据，拆分为高 32 位与低 32 位。高 32 位代表索引，低 32 位存储到对应 RoaringBitmap 中
- [CRoaring](https://arxiv.org/pdf/1709.07821v4.pdf)，用C编写的实现。该实现利用了 SIMD（单指令多数据）指令的向量化算法

## 衍生阅读

- BSI（Bit-Slice Index）：位切片索引，在 Roaring 基础上支持数值聚合（sum/avg/min/max），适合实时 OLAP 与高基数列分析
- RoaringTreemap：有序 Roaring 位图，支持范围查询（如 [100, 200]），适合时序与区间过滤
- pg_roaringbitmap：PostgreSQL 扩展，提供 SQL 级位图函数（rb_and/rb_or/rb_agg）
- Redis Roaring 扩展：在 Redis 中存储 Roaring 位图，实现分布式位图计算
