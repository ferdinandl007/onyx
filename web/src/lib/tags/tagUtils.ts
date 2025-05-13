import { Tag } from "../types";

export interface TagResponseWithPagination {
  tags: Tag[];
  pagination?: {
    total?: number;
    offset: number;
    limit: number;
    has_more: boolean;
  };
}

export async function getValidTags(
  matchPattern: string | null = null,
  sources: string[] | null = null,
  offset: number = 0,
  limit: number = 100
): Promise<TagResponseWithPagination> {
  const params = new URLSearchParams();
  if (matchPattern) params.append("match_pattern", matchPattern);
  if (sources) sources.forEach((source) => params.append("sources", source));
  params.append("allow_prefix", "true"); // Kept for backward compatibility
  params.append("offset", offset.toString());
  params.append("limit", limit.toString());

  const response = await fetch(`/api/query/valid-tags?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch valid tags");
  }

  return await response.json();
}
