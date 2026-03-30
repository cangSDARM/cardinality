---
---

# RoaringBitmap

本网站旨在探索以下论文

- [Better bitmap performance with Roaring bitmaps (2016)](https://arxiv.org/pdf/1402.6407)
- [Consistently faster and smaller compressed bitmaps with Roaring (2018)](https://arxiv.org/pdf/1603.06549)

包含以下部分概念

- 探索 RoaringBitmap 如何工作的[原理](/cardinality/roaring/principle)
- 探索 RoaringBitmap 如何[添加数据项](/cardinality/roaring/adding)
- 探索 RoaringBitmap 如何优化[长连续的整数](/cardinality/roaring/longrun)
- 探索 RoaringBitmap 如何支持[交并集操作](/cardinality/roaring/union_intersection)
- 探索 RoaringBitmap 的[衍生和具体实践](/cardinality/roaring/more)

## 总而言之

RoaringBitmap 是基数统计的利器：

- ✅ 很快
- ✅ 可精确统计
- ✅ 可随时写入
- ✅ 可并发计算

但是：

- ⚠️它依然属于位图，无法很好的处理密集型随机值集合

RoaringBitmap 已成为大数据索引、用户画像、OLAP 去重的事实标准。核心价值是用极小内存实现超快集合运算

## 致谢

- 原文：https://vikramoberoi.com/posts/a-primer-on-roaring-bitmaps-what-they-are-and-how-they-work/
- RoaringBitmap：https://roaringbitmap.org/
- How a Bitmap Index Works：https://richardstartin.github.io/posts/how-a-bitmap-index-works
