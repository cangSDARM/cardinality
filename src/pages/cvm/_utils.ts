function sanitize(word: string) {
  return word
    .trim()
    .replace(/[\.?!,—;:]/, "")
    .replace(/’d$/, "")
    .replace(/^\[_/, "")
    .replace(/_\]$/, "")
    .toLowerCase();
}

function getActuallySize(inputs: string[]): number {
  const s = new Set();
  for (const input of inputs) {
    s.delete(input);
    s.add(input);
  }
  return s.size;
}

function segment(text: string, locals?: Intl.LocalesArgument) {
  const seg = new Intl.Segmenter(locals, { granularity: "word" });
  const res = [];
  for (const s of seg.segment(text)) {
    if (!s.isWordLike) continue;
    res.push(s.segment);
  }
  return res;
}

export const calcF0 = (text: string, locals?: Intl.LocalesArgument) => {
  const sanitized = segment(text, locals).map(sanitize).filter(Boolean);

  return [sanitized, getActuallySize(sanitized), sanitized.length] as const;
};

export function getCountDataset(arr: number[]) {
  const countMap: Record<number, number> = {};
  arr.forEach(val => {
    countMap[val] = (countMap[val] || 0) + 1;
  });
  const sortedKeys = Object.keys(countMap)
    .map(Number)
    .sort((a, b) => a - b);
  return {
    labels: sortedKeys,
    data: sortedKeys.map(k => countMap[k]),
  };
}

export function CVM(inputs: string[], thresh: number): number {
  let epsilon = 0;
  const s = new Set();
  for (const input of inputs) {
    s.delete(input);
    if (Math.random() < Math.pow(0.5, epsilon)) s.add(input);
    if (s.size == thresh) {
      for (let item of s) if (Math.random() < 0.5) s.delete(item);
      epsilon += 1;
    }
  }
  return Math.floor(s.size * Math.pow(2, epsilon));
}

const summation = (arr: number[]) => {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  let compensation = 0.0;

  return arr.reduce((sum, cur) => {
    const y = cur - compensation;
    const t = sum + y;
    compensation = t - sum - y;
    return t;
  }, 0);
};

export const arithmeticMean = (arr: number[]) => {
  if (!Array.isArray(arr) || arr.length === 0) return 0;
  const length = arr.length;
  return summation(arr) / length;
};

export const standardError = (arr: number[], mean: number = arithmeticMean(arr)) => {
  if (!Array.isArray(arr) || arr.length <= 1) return 0;
  const squareDiffs = arr.map(x => Math.pow(x - mean, 2));
  const sumSquare = summation(squareDiffs);
  const n = arr.length;
  return Math.sqrt(sumSquare / (n - 1));
};
