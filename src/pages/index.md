---
---

基数 (Cardinality, 也译作势) 是指一个集合或多个集合中不重复元素的个数，有时候也称为 Distinct Values(Distinct Value Problem)

计算出基数的方法叫做“统计基数(Cardinality Counting)”。

统计近似基数的也叫做“基数估计(Cardinality Estimation)”。

### 流式算法

用于大数据中全局聚合指标的估算

核心约束:

1. 内存占用小: 内存远小于数据总量，占用与数据总量无关
2. 亚线性: 算法内存占用与数据量呈亚线性关系(对数级甚至常数级)
3. 有上界: 确定性或高概率的理论上界
4. 用于聚合统计类数据: 基数有多少、基数是否存在、基数的频率分布如何

```txt
大数据处理(Algorithms for Big Data)
├── 流式算法(Streaming Algorithms)
│     ├── 精确算法
│     │     └── 基数查询: RoaringBitmap
│     └── 近似算法
│           ├── 基数估计: CVM, HyperLogLog
│           ├── 基数查询: BloomFilter
│           ├── 频率估计: Count-Min Sketch
│           └── 分位数估计: t-Digest
└── 采样方法(Sampling Methods)
```
