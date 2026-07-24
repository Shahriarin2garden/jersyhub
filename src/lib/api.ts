import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ data }, { status: init ?? 200 });
}

export function paginated<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number },
) {
  return NextResponse.json({
    data,
    pagination: {
      ...pagination,
      totalPages: Math.max(1, Math.ceil(pagination.total / pagination.limit)),
    },
  });
}

export function fail(error: string, status = 400, details?: Record<string, string>) {
  return NextResponse.json({ error, ...(details && { details }) }, { status });
}

export function fromZod(err: ZodError) {
  const details: Record<string, string> = {};
  for (const issue of err.issues) {
    details[issue.path.join(".") || "_"] = issue.message;
  }
  return fail("Validation failed", 422, details);
}

/** Parse pagination query params with sane defaults. */
export function getPage(searchParams: URLSearchParams, defaultLimit = 12) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}
