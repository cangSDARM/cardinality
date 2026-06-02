import { parse } from "yaml";
import { pipe, map, keys } from "remeda";

export const parseRouter = (filePath: string, mod: any) => {
  const path = filePath.replace(/^\./gi, "").replace(/\/router\.yaml/gi, "");
  const routers: { href: string; label: string }[] = pipe(
    parse((mod as any).default),
    map(router => {
      const href = keys(router)[0];
      return { href: href, label: router[href].label };
    })
  );

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
