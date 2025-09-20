type Entity = {
  code: number;
  name: string;
};

type Option<T> = {
  key: number;
  hidden: boolean;
  data: T;
};

export function filterSortOptions<T extends Entity = Entity>(
  data: T[],
  hiddenCodeSets: (Set<number> | undefined)[],
  keyword?: string,
  minKeywordLen = 1
): Option<T>[] {
  const shouldCheckKeyword = keyword && keyword.length >= minKeywordLen;
  const lowerKeyword = keyword?.toLowerCase() || "";

  const options = data.map<Option<T>>((item) => {
    return {
      key: item.code,
      hidden: hiddenCodeSets.some((set) => set && set.has(item.code)),
      data: item,
    };
  });

  if (shouldCheckKeyword) {
    return options.sort((a, b) => {
      const aName = a.data.name.toLowerCase();
      const bName = b.data.name.toLowerCase();

      a.hidden = a.hidden || !aName.includes(lowerKeyword);
      b.hidden = b.hidden || !bName.includes(lowerKeyword);

      if (a.hidden) {
        return b.hidden ? 0 : 1;
      }
      if (b.hidden) {
        return -1;
      }

      const aPoint = aName.startsWith(lowerKeyword) ? 1 : 0;
      const bPoint = bName.startsWith(lowerKeyword) ? 1 : 0;

      return bPoint - aPoint;
    });
  }

  return options;
}
