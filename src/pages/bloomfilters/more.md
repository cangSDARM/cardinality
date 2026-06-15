---
---

# More

## 哈希函数

BloomFilter 里的哈希函数需要彼此独立且均匀分布。
同时，它们也需要尽可能的快。

一个关于 BloomFilter 实现方式的简单调查:

- [Chromium](https://chromium.googlesource.com/chromium/chromium/+/refs/heads/main/chrome/browser/safe_browsing/bloom_filter.cc) 使用 [HashMix](https://web.archive.org/web/20061030103559/http://www.concentric.net/~Ttwang/tech/inthash.htm)
- [python-bloomfilter](https://github.com/jaybaird/python-bloomfilter/blob/master/pybloom/pybloom.py) 使用加密哈希算法
- [Plan9](https://plan9.io/sources/plan9/sys/src/cmd/venti/srv/bloom.c) 使用 [Mitzenmacher 2005](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.152.579&rank=1)
- [Sdroege BloomFilter](https://github.com/sdroege/snippets/blob/master/snippets/bloomfilter.c) 使用 fnv1a
- Squid 使用 MD5

### 多少个哈希函数

当需要 10 个哈希函数的时候，我们不可能真的选择 10 个不同的哈希函数来进行操作，这样甚至无法编程。

哈佛大学的一篇论文计算证明，按照一定策略，只需要取 2 个哈希函数，即可以达到生成任意多个哈希函数的目的。论文中提出了两种可行的策略:

- Partition Schemes: $h_i=h_1(u) + ih_2(u) \bmod m'$
- Double Hashing Schemes: $h_i=h_1(u) + ih_2(u) + f(i) \bmod m$

其中 $h_1$ 和 $h_2$ 是两个哈希函数，$m$ 是 BloomFilter 大小，$m'$是 $\frac{m}{k}$（要求 $m$ 能整除 $k$）

### 衍生阅读

BloomFilter 是一个非常活跃的研究领域，衍生出了大量解决不同场景需求的变体。

- 解决“删除”问题: 标准 BF 不支持删除，计数 BF 解决了这个问题但空间开销大
  - [Bloomier Filter](https://dl.acm.org/doi/abs/10.5555/982792.982797)	不仅能判断存在，还能为每个元素存储一个关联值（如函数值）。可以看作是 BF + 键值存储
  - [Cuckoo Filter](https://www.eecs.harvard.edu/~michaelm/postscripts/cuckoo-conext2014.pdf)	用布谷鸟哈希替代位数组，每个槽存一个指纹。支持删除，且空间效率显著优于计数 BF，是 dlCBF 之外最主流的支持删除方案
  - [Xor Filter](https://arxiv.org/abs/1912.08258) 比 Cuckoo Filter 更省空间（约 20-30%），查询更快，但构建时间较长，适合静态数据集
  - [Quotient Filter](https://arxiv.org/pdf/1208.0290) 通过存储商数和余数来支持删除和动态扩容，缓存友好的内存访问模式，是计数 BF 的空间高效替代方案
- 解决“动态扩容”与“集合基数未知”问题
  - [Adaptive Bloom Filter](https://www.jstage.jst.go.jp/article/transinf/E91.D/5/E91.D_5_1292/_pdf/-char/en) 根据查询负载自适应调整过滤器参数，优化查询性能
  - [Elastic Bloom Filter](https://ieeexplore.ieee.org/document/9382900) 在 Scable BF 基础上支持删除和动态收缩，用于流式数据等场景
- 解决“空间效率极限”与“查询性能”
  - [Blocked Bloom Filter](https://dl.acm.org/doi/epdf/10.1145/1498698.1594230) 将位数组划分为多个小块，每个元素的哈希落在单个块内，提升缓存局部性，查询更快
  - [Spectral Bloom Filter](https://dl.acm.org/doi/10.1145/872757.872787) Counting BF 的扩展，可以返回元素的近似出现次数（而不仅仅是存在性）

还有一些新的实现方式

- 将机器学习与数据结构结合: [Learned Bloom Filter](https://arxiv.org/pdf/1712.01208)。用一个小型神经网络预测元素是否在集合中，BF 只做后备纠错，空间节省可达 20-30%
- 对 BF 进行同态加密或添加差分隐私噪声: [UltraFilter](https://dl.acm.org/doi/10.1145/3701716.3715497)，用于隐私保护下的集合成员测试

## 实践

- Google Bigtable，HBase 和 Cassandra 以及 Postgresql 使用 BloomFilter 来减少不存在的行或列的 IO
- Squid 网页代理缓存服务器在 cache digests 中就使用了 BloomFilter
- Chrome 使用 BloomFilter 加速安全浏览服务
- Venti 文档存储系统使用 BloomFilter 来检测先前存储的数据
- SPIN 模型检测器使用 BloomFilter 在大规模验证问题时跟踪可达状态空间
- Redis v4.0 之后有了 Module（模块/插件）功能，BloomFilter 就是其中的 Module
