import { parse } from "yaml";

export function pipe<R1, R2>(fn1: R1, fn2: (arg: R1) => R2): R2;
export function pipe<R1, R2, R3>(fn1: R1, fn2: (arg: R1) => R2, fn3: (arg: R2) => R3): R3;
export function pipe<R1, R2, R3, R4>(
  fn1: R1,
  fn2: (arg: R1) => R2,
  fn3: (arg: R2) => R3,
  fn4: (arg: R3) => R4
): R4;
export function pipe<R1, R2, R3, R4, R5>(
  fn1: R1,
  fn2: (arg: R1) => R2,
  fn3: (arg: R2) => R3,
  fn4: (arg: R3) => R4,
  fn5: (arg: R4) => R5
): R5;
export function pipe<R1, R2, R3, R4, R5, R6>(
  fn1: R1,
  fn2: (arg: R1) => R2,
  fn3: (arg: R2) => R3,
  fn4: (arg: R3) => R4,
  fn5: (arg: R4) => R5,
  fn6: (arg: R5) => R6
): R6;
export function pipe(fn1: any, ...fns: Array<(arg: any) => any>) {
  return fns.reduce((acc, fn) => fn(acc), fn1);
}

export const fromEntries = <T extends [string, any]>(entries: T[]): Record<string, T[1]> =>
  Object.fromEntries(entries);

export const parseRouter = (filePath: string, mod: any) => {
  const path = filePath.replace(/^\./gi, "").replace(/\/router\.yaml/gi, "");
  const parsed = parse((mod as any).default);
  const routers: { href: string; label: string }[] = [];

  for (const router of parsed) {
    const href = Object.keys(router)[0];
    routers.push({ href: href, label: router[href].label });
  }

  return {
    path,
    routers,
  };
};

export const getUri = (href: string, base = ""): [string, boolean] => {
  if (href.startsWith("/")) {
    return [import.meta.env.BASE_URL + base + href, false];
  } else {
    return [new URL(href).href, true];
  }
};
