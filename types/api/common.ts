// ===== SEARCH REQUEST =====
export interface SearchRequest {
  q?: string;
  query?: string;
  filters?: Record<string, unknown>;
  page?: number;
  limit?: number;
  sortBy?: string;
  isInUse?: boolean;
  sortOrder?: "asc" | "desc" | "ASC" | "DESC";
}

// ===== PAGINATION =====
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ===== API RESPONSE =====
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ===== PAGINATED RESPONSE =====
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
  message?: string;
}

// ===== API ERROR =====
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
  code?: string;
}

// ===== SORT ORDER =====
export type SortOrder = "asc" | "desc" | "ASC" | "DESC";

// ===== API STATUS =====
export type ApiStatus = "idle" | "loading" | "success" | "error";

// ===== ID TYPES =====
export type Id = string;
export type NumericId = number;

// ===== TIMESTAMP =====
export type Timestamp = string;

// ===== META DATA =====
export interface MetaData {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string;
  updatedBy?: string;
}

// ===== LIST OPTIONS =====
export interface ListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

// ===== FILTER OPTIONS =====
export interface FilterOptions<T = Record<string, unknown>> {
  filters?: T;
  searchQuery?: string;
}

// ===== QUERY OPTIONS =====
export interface QueryOptions extends ListOptions, FilterOptions {
  include?: string[];
  exclude?: string[];
}

