---
---

# RoaringBitmap

本网站旨在探索以下论文

- [Better bitmap performance with Roaring bitmaps (2016)](https://arxiv.org/pdf/1402.6407)
- [Consistently faster and smaller compressed bitmaps with Roaring (2018)](https://arxiv.org/pdf/1603.06549)

包含以下部分概念

- 探索 RoaringBitmap 如何工作的[原理](/cardinality/bitmap/principle)
- 探索 RoaringBitmap 如何在[内存中表示](/cardinality/bitmap/representing)
- 探索 RoaringBitmap 如何支持[更改](/cardinality/bitmap/mutating)
- 探索 RoaringBitmap 如何保证[长时间工作](/cardinality/bitmap/longrun)
- 探索 RoaringBitmap 的[衍生和具体实践](/cardinality/bitmap/more)

## 总而言之

RoaringBitmap 是基数统计的利器：

- ✅ 很快
- ✅ 可精确统计
- ✅ 可随时写入
- ✅ 可并发计算

但是：

- ⚠️它依然属于位图，无法很好的处理密集型随机值集合

潜在应用场景：

- 数据库索引
- 搜索引擎索引
- 大数据标签

## 致谢

- 原文：https://vikramoberoi.com/posts/a-primer-on-roaring-bitmaps-what-they-are-and-how-they-work/
- RoaringBitmap：https://roaringbitmap.org/
- How a Bitmap Index Works：https://richardstartin.github.io/posts/how-a-bitmap-index-works
