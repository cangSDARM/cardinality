---
---

# Union / Intersection

考虑 RoaringBitmap 实例 A 和 B。A、B 的逻辑运算，只可能是最高位相同的容器会存在交并集。
则只考虑同高位的容器之间的相互操作即可。

## 并集

- Bitmap / Bitmap：计算两个位图的或，结果存储在 BitmapContainer 中（不可能$<4096$）
- Bitmap / Array：克隆位图，遍历数组插入所有的元素到新位图中。结果存储在 BitmapContainer（不可能$<4096$）
- Array / Array：乐观地假设结果是 BitmapContainer。依次遍历并设置所有的元素，最后按照情况转换容器

- Run / Run：使用双指针归并等算法进行操作。合并的依然是 RunContainer
- Run / Array：论文里面对这个问题采用了和 Run / Run 一样的算法。结果按照情况对容器类型转化
- Run / Bitmap：用 Bitmap 或 RunContainer 里的位。结果按照情况对容器类型转化

## 交集

- Bitmap / Bitmap：计算两个位图的与，结果按情况存储（$<4096$个放 ArrayContainer，大于放 BitmapContainer）
- Bitmap / Array：依序遍历数组，检查是否在位图中。结果存储在 ArrayContainer（不可能$>4096$）
- Array / Array：如果两个 Array 的基数相近($\farc{c_1}/{64} < c_2 < 64c_1$), 那么使用一个普通的 merge 算法；否则使用 galloping intersection 算法（遍历小数组中每个元素，在大数组中二分查找。要求输入两个数组大小差距非常悬殊）

- Run / Run：使用双指针扫描等算法进行操作。结果按情况存储
- Run / Array：挨个对比。结果的存储在 ArrayContainer 中
- Run / Bitmap：计算两个的与把 RunContainer 里的位补设为 0。结果按情况存储（$<4096$个放 ArrayContainer，大于放 BitmapContainer）
