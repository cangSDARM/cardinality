---
---

# Longrun

**run** 指的是一段连续的整数序列，这种结构常见于游程编码。
即在数据相当密集时，RoaringBitmap 会加入第三种数据容器 RunContainer

RunContainer 在概念上很简单：给定一个 LongRun(例如，$[10,1000]$)，我们存储起始点(10)和它的 长度-1(990)；存储起始点和长度，每个使用 16 位

这种压缩算法的性能和数据的连续性关系极为密切。
对于连续的 100 个整数(short)，它能从 200 字节压缩为 4 字节，但对于完全不连续的 100 个，编码完之后反而会从 200 字节变为 400 字节。
最好情况，即只存在一个数据或只存在一串连续数字，那么只会存储2个short，占用4字节；
最坏情况，0~65535 的范围内填充所有的奇/偶数位，需要存储 65536 个 short，128kb

与 ArrayContainer 和 BitmapContainer 不同，RunContainer 通常不会自动创建：

1. 主动调用`runOptimize`函数。此时 RoaringBitmap 会尝试找到其他容器中的 LongRun 并优化为 RunContainer
2. 调用插入连续值的函数（例如`addMany`）。比较 ArrayContainer 和 RunContainer，选取空间占用较少的

RunContainer 查找需要二分查找
