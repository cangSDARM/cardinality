---
---

# Principle

## 如何估计

### 最简单估计

由于直接的统计精确数据，即反复统计集合$S$是非常消耗内存和时间的，因此我们可以假设一个随机过程：

每次加入元素则$50\%$概率丢弃，或$50\%$保留。

那么对于一个大小为$n$的集合$S_i$，其最终集合大小是一个二项分布随机变量，对应估计结果的期望$E(S)=n\times p=0.5n$。

显而易见，我们直接乘以2，得到$R(S)=2E(S)=0.5\times2\times n=n$……等等，这不就是我们期望的统计结果$n$么，问题解决了？

这个想法不错，但它有一个非常明显的反例：如果我们有一个元素完全相同的集合$S_{same}=\{x,x,\dots,x\mid x=a\}, a\in\mathbb{R}$，那么我们的真正的结果应该是 1，而不是受到$n$的影响。

### 去重估计

反例说明我们需要对已有元素去重。

则我们改进插入的步骤：每次统计元素时，立即删除结果集合$S_r$中的相同元素。再以$50\%$概率插入：

那么对于一个有$N$个**不同元素**的集合$S_i$，每个元素独立地以$0.5$的概率在集合中，对应估计结果的期望$E(S)=N\times p=0.5N$。

那么，我们依然直接乘以2，得到$R(S)=2E(S)=0.5\times2\times N=N$。

## CVM

去重估计已经让我们的期望等于了我们想要的结果。但是，还是有一点小问题，那就是：我们的内存依然受限于输入长度，固定是$\frac{\text{len}(S)}{2}$

那么我们可以要求加入一个“决定系数”$\varepsilon$，来替换之前固定的$50\%$，让每轮插入概率受该系数影响：$p_i=0.5^{\varepsilon_i}$。

此时，如果$\varepsilon$太小，内存使用量会过高。如果$\varepsilon$太大，估计值的方差又会很大。我们想要的是对小数据集使用较小的$\varepsilon$，对大数据集则使用较大的$\varepsilon$——这就是 CVM 算法用到的最后一个技巧：动态地选择抛掷次数。

我们为集合大小设置一个上限$\text{trash}$，当已观察到的集合变得过大时，就增加抛掷次数。这个新标准既要应用于新元素，也要应用于已经见过的元素。由于已在集合中的每个元素都已经通过了概率$p_i=0.5^{\varepsilon_i}$，我们可以让它们再进行一次，从而要求它们必须满足概率$p_{i+1}=0.5^{\varepsilon_{i+1}},\ \ \varepsilon_{i+1}=\varepsilon +1$。

完整的 CVM 算法代码如下：

```js
function CVM(inputs, trash) {
  let epsilon = 0;
  const s = new Set();
  for (const input of inputs) {
    s.delete(input);
    if (Math.random() < Math.pow(0.5, epsilon)) s.add(input);
    if (s.size == trash) {
      for (let item of s) if (Math.random() < 0.5) s.delete(item);
      epsilon += 1;
    }
  }
  return Math.floor(s.size * Math.pow(2, epsilon));
}
```
