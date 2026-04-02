export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export function parsePagination(searchParams: URLSearchParams): {
  page: number;
  per_page: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const per_page = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("per_page") ?? "20", 10) || 20)
  );
  return { page, per_page, offset: (page - 1) * per_page };
}

export function paginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  per_page: number
) {
  return {
    items,
    pagination: {
      page,
      per_page,
      total,
      total_pages: Math.ceil(total / per_page),
    },
  };
}
