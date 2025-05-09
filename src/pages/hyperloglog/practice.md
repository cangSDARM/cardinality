---
---

实践中 HyperLogLog 使用的 hash 算法为 [MurmurHash](https://en.wikipedia.org/wiki/MurmurHash)。其主要优势是随机性强和快速

## Redis

假设，估算有多少独立用户/IP访问了同一个网站。如果 key 对应页面名称，value 对应用户 id

- `pfadd key value` 将 key 对应的一个 value 存入
- `pfcount key` 统计 key 的 value 有多少个
