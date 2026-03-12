const DEFAULT_MAX_SIZE = 4096;
const MAX_VALUE = 0xffff_ffff_ffff_ffffn;

const abs = (n: number | bigint) => (Object.is(n, -0) || n < 0n ? -n : n);

function binarySearch(arr: bigint[], target: bigint) {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const midValue = arr[mid];

    if (midValue === target) {
      return mid;
    } else if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1;
}

function searchLargestFloor(sortedArr: bigint[], target: bigint) {
  if (sortedArr.length === 0) return 0;

  let left = 0;
  let right = sortedArr.length - 1;
  let result = 0;

  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    const midValue = sortedArr[mid];

    const compareResult = midValue < target ? -1 : midValue > target ? 1 : 0;

    if (compareResult === -1) {
      result = mid;
      left = mid + 1;
    } else if (compareResult === 1) {
      right = mid - 1;
    } else {
      right = mid - 1;
    }
  }

  return result;
}

function getHighLowBits(num: bigint) {
  const int32Num = num | 0n;
  const high = int32Num >> 16n;
  const low = int32Num & 0xffffn;

  return [high, low] as const;
}

function clamp(val: bigint, max: bigint, min: bigint) {
  if (val < min) return min;
  if (val > max) return max;
  return val;
}

function brianKernighan(num: bigint) {
  let count = 0;
  let n = num;

  while (n !== 0n && n !== 0n) {
    n = n & (n - 1n);
    count++;
  }

  return count;
}

abstract class Container {
  constructor(public readonly msb: bigint) {}

  /** actual length */
  abstract length: () => number;
  /** occupied memory (bit) */
  abstract size: () => number;
  abstract insert: (num: bigint) => boolean;
  abstract include: (num: bigint) => boolean;
  abstract transform: (newContainer: Container) => Container;
}

class ArrayContainer extends Container {
  shorts: bigint[] = [];

  length = () => this.shorts.length;
  size = () => this.length() * 2;
  include = (num: bigint) => {
    return binarySearch(this.shorts, num) > -1;
  };
  insert = (num: bigint): boolean => {
    if (this.include(num)) return false;
    if (this.length() === 0) {
      this.shorts.push(num);
      return true;
    }

    const index = searchLargestFloor(this.shorts, num) + 1;
    this.shorts.splice(index, 0, num);

    return true;
  };
  transform = (newContainer: Container) => {
    this.shorts.forEach(newContainer.insert);
    return newContainer;
  };
}

class BitmapContainer extends Container {
  bitmap: bigint[] = [];

  constructor(msb: bigint) {
    super(msb);
    this.bitmap = Array.from({ length: 1024 }).map(() => {
      return 0x0n;
    });
  }

  length = () => this.bitmap.reduce((acc, cur) => acc + brianKernighan(cur), 0);
  size = () => 65536;
  include = (num: bigint): boolean => {
    const index = Number(num / 64n);
    const occupied = 2n ** (num % 64n);
    return !!(this.bitmap[index] & occupied);
  };
  insert = (num: bigint) => {
    const index = Number(num / 64n);
    const occupied = 2n ** (num % 64n);
    this.bitmap[index] = this.bitmap[index] | occupied;
    return true;
  };
  transform = (newContainer: Container) => {
    return newContainer;
  };
}

export default function RoaringBitmap() {
  const MSB: bigint[] = [];
  const ptr: Container[] = [];
  const length = () => MSB.length;

  const newBucket = (msb: bigint, Bucket = ArrayContainer) => {
    const index = MSB.length === 0 ? 0 : searchLargestFloor(MSB, msb) + 1;
    MSB.splice(index, 0, msb);
    ptr.splice(index, 0, new Bucket(MSB[index]));

    return index;
  };

  // convert if needed
  const convertIff = (index: number) => {
    if (ptr[index] instanceof ArrayContainer && ptr[index].length() > DEFAULT_MAX_SIZE) {
      ptr[index] = ptr[index].transform(new BitmapContainer(MSB[index]));
    }
  };

  return {
    ptr,
    length,
    size: () => ptr.reduce((acc, cur) => acc + cur.size(), 0),
    include: (num: number) => {
      const clamped = clamp(BigInt(num), MAX_VALUE, 0n);
      const [high, low] = getHighLowBits(clamped);
      const bucket = binarySearch(MSB, high);

      return !!ptr[bucket]?.include(low);
    },
    insert: (num: number) => {
      const clamped = clamp(BigInt(num), MAX_VALUE, 0n);
      const [high, low] = getHighLowBits(clamped);

      const bucket = binarySearch(MSB, high);
      const index = bucket < 0 ? newBucket(high) : bucket;
      ptr[index].insert(low);

      convertIff(index);
    },
  };
}
