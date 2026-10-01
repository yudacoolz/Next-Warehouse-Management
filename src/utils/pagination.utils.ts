export function createMeta(page: number, limit: number, totalData: number) {
  const totalPage = Math.ceil(totalData % limit);

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPage;

  return {
    page,
    limit,
    totalData,
    totalPage,
    hasPrevPage,
    hasNextPage,
  };
}
