---
title: "principle"
---

# Principle

## 如何估计

### 最简单估计

假设一直抛硬币，直到它出现正面为止(概率 $p = \frac{1}{2}$)，我们记录为一次完整的试验。这个试验就是`伯努利试验`。

其中，在`n`次伯努利试验中，必然会有一个最大的抛掷次数<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msub><mi>k</mi><mrow><mi>m</mi><mi>a</mi><mi>x</mi></mrow></msub></mrow><annotation encoding="application/x-tex">k_{max}</annotation></semantics></math></span></span>，例如抛了12次才出现正面，那么称<span class="katex"><span class="katex-mathml"><math><semantics><mrow><msub><mi>k</mi><mrow><mi>m</mi><mi>a</mi><mi>x</mi></mrow></msub><mo>=</mo><mn>12</mn></mrow><annotation encoding="application/x-tex">k_{max}=12</annotation></semantics></math></span></span>，代表抛了最多的次数。

结合极大似然估算的方法，发现在 $n$ 和 $k_{max}$ 中存在估算关联： $n=2^{k_{max}}$。

> 问：假设一轮伯努利实验有抛了12次才出现正面，求是有几次实验？
>
> 答： n = $2^{12}$ = 4096

### 优化

如果只是进行一次估计的话，当 $n$ 足够大的时候，估算的误差率会相对减少，但仍然不够小。显然可以利用多次估计来进行估算。

那么可以：

- 进行多次试验估计，然后再取每轮次的 $k_{max}$，进行平均操作再进行估算 $n$；
- 或者计算多个 $n$，再进行平均

### 引申/实践

> 问：统计 APP 的一个页面，每天有多少用户(uid)点击进入的次数
>
> 答：通过 hash 函数将 uid 转为随机的二进制串，例如 001001。
> 根据前面的估计算法，则可以假定多次随机后出现 1 的前导零个数($k_{max}$)概率和用户数($n$)有关联。
> 则可用前文的 $n = 2^{k_{max}}$ 推算出大概的用户个数。

## HyperLogLog

实践中 HyperLogLog 使用的 hash 算法为 [MurmurHash](https://en.wikipedia.org/wiki/MurmurHash)。其主要优势是随机性强和快速

同时，基于前文的优化思维，HyperLogLog 会分桶进行估计。先计算出每个桶的基数，然后求调和平均数。

且 HyperLogLog 的精度和桶数存在明显相关。其定量关系为：$相对标准误差(RSD)=\frac{1.04}{\sqrt{m}}$
