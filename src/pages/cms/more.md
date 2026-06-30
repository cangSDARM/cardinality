---
---

# More

## 衍生阅读

CMS 虽然解决了词频统计、词云问题，但对于细分领域还有更多有待解决的问题：

- 解决"精度瓶颈"问题：标准 CMS 在高频与低频元素冲突时误差显著
  - [Conservative Update Count-Min Sketch (CMS-CU)](https://dl.acm.org/doi/10.1145/633025.633056) 更新时仅增加当前计数最小的哈希桶，其他桶不变，精度提升可达10倍有余。
  - [Count-Less](https://arxiv.org/abs/2111.02759) 针对数据流常见的 Zipf 分布优化数据结构，通过级联多层过滤器分离"大象流"与"老鼠流"，缓解高冲突带来的精度损失
  - [Learned Count-Min Sketch](https://www.sciencedirect.com/science/article/abs/pii/S0020025519307856) 用小型回归模型（如神经网络）学习历史数据分布，预测高频元素频率，将低频元素存入后备 CMS，在同等空间下精度更高。
- 解决"查询优化"与"误差评估"问题：标准 CMS 只保证上界，无法给出有实用意义的单次查询误差
  - [Optimal Count Estimator](https://arxiv.org/abs/1811.04150) 将 CMS 的计数问题建模为统计推断问题，从 Sketch 自身估计误差分布，提供最大似然估计和贝叶斯估计两种方案，经证明可达到理论最优精度
  - [The Adaptive Use of Count-Min Sketch](https://dl.acm.org/doi/10.1145/3711896.3737152) 研究当查询和更新依赖历史估计结果时（即"自适应使用"场景），CMS 的鲁棒性问题。发现其易受恶意查询攻击，并提出在随机预言模型下的加固方案
- 解决"扩展功能"问题：标准 CMS 只能做单点查询(Point Query)
  - [kJoin Sketch](https://ieeexplore.ieee.org/document/10132503) 将 CMS 的 min 操作替换为位置感知操作，从流大小估计拓展到流分散度估计（即每个流中不同元素的数量），用于网络监控等场景

## 实践

- Redis Stack 自 v2.2 起内置 Count-Min Sketch 模块(`CMS.INITBYPROB` 命令)，用于零售销量统计、热点商品识别等场景；其阈值计算公式为 `threshold = error_rate * total_count`，低于该值的计数值应视为噪声忽略
- Apache Spark 提供 CountMinSketch 类(`org.apache.spark.util.sketch`)，用于大规模数据流频率估计
- 网络流量监控 CMS 及其变体广泛应用于骨干网的大象流检测、DDoS 攻击识别等场景
- 物联网异常检测 国内研究中，有方案将 CMS 与图神经网络结合，构建物联网卡画像特征，再以 XGBoost 识别异常流量，提升了违规识别的准确率和召回率
- 自然语言处理 CMS 用于词频统计和特征选择，在超大规模词表场景下节省内存
