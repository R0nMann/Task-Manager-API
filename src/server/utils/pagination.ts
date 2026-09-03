export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/** Coerces raw, untrusted values into a safe page/limit pair. */
export const getPagination = (page?: unknown, limit?: unknown): PaginationParams => {
  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  return {
    page: Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_PAGE,
    limit:
      Number.isInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_LIMIT)
        : DEFAULT_LIMIT,
  };
};

/** Translates a page/limit pair into Prisma's offset arguments. */
export const toPrismaPagination = ({ page, limit }: PaginationParams) => ({
  skip: (page - 1) * limit,
  take: limit,
});

export const buildMeta = ({ page, limit }: PaginationParams, totalItems: number,): PaginationMeta => ({
  page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});

/** Wraps a page of rows in the standard response envelope. */
export const paginated = <T>(
  data: T[],
  params: PaginationParams,
  totalItems: number,
) => ({
  success: true as const,
  data,
  meta: buildMeta(params, totalItems),
});
