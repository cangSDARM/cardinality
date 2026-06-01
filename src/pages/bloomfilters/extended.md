---
---

# Extended

## Counting BloomFilter

普通的 BloomFilter 并不支持删除元素，因为多个元素可能哈希到一个布隆过滤器的同一个位置，如果直接删除该位置的元素，则会影响其他元素的判断。

因此，为了弥补这一缺点，在 2000 年的论文 [Summary Cache: A Scalable Wide-Area Web Cache Sharing Protocol](https://pages.cs.wisc.edu/%7Ejussara/papers/00ton.pdf) 中，Li Fan 等人设计了带计数器的布隆过滤器。
