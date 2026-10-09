import { ApiError } from "./errors";
import { createDedupedFetch } from "./fetch";
import type {
  BillingConfigResponse,
  BillingStatusResponse,
  CheckoutInput,
  CheckoutResponse,
  CreateCouponInput,
  CreateCouponResponse,
  CreateOrderInput,
  CreateOrderResponse,
  CustomExamSolveData,
  CustomExamTakeData,
  DeleteCouponResponse,
  GetAllCouponsInput,
  GetAllCouponsResponse,
  GetAllOrdersInput,
  GetAllOrdersResponse,
  GetOrderResponse,
  HealthResponse,
  PayOrderInput,
  PayOrderResponse,
  PresignedUploadInput,
  PresignedUrlResponse,
  QBChapterDetailData,
  QBChapterQueryParams,
  QBContainerDetailData,
  QBHubData,
  QBItemDetailData,
  QBQuestion,
  QBTargetDetailData,
  QBTree,
  RevealExplanationResponse,
  SavedWatchLibraryResponse,
  UpdateCouponInput,
  UpdateCouponResponse,
  UpdateOrderStatusInput,
  UpdateOrderStatusResponse,
  UploadResponse,
  ValidateCouponInput,
  ValidateCouponResponse,
  WatchChannelDetailResponse,
  WatchFeedResponse,
  WatchPlaylistDetailResponse,
  WatchVideoDetailResponse,
} from "./types";
import type { CreateCustomExamInput, CreateExamResult, SubmitExamResult } from "./types/qb";
import type { WatchCommentItem } from "./types/watch";

export const API_V1_PREFIX = "/api/v1";
const DEFAULT_FOLDER = "uploads";

export interface ApiClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
}

export function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

export function getDefaultApiUrl(): string {
  if (typeof window !== "undefined") {
    return normalizeBaseUrl(window.location.origin);
  }

  return (
    process.env.INTERNAL_API_URL ||
    process.env.API_INTERNAL_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  );
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

function buildQuery(query?: QueryParams): string {
  if (!query) {
    return "";
  }
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    params.set(key, String(value));
  }
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

interface RequestOptions {
  query?: QueryParams;
  body?: unknown;
}

class RequestCore {
  constructor(
    private readonly baseUrl: string,
    private readonly fetcher: typeof fetch,
    private readonly headers?: Record<string, string>,
  ) {}

  private async request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${API_V1_PREFIX}${path}${buildQuery(options.query)}`;
    const hasBody = options.body !== undefined;
    const response = await this.fetcher(url, {
      method,
      credentials: "include",
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...this.headers,
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  }

  get<T>(path: string, query?: QueryParams): Promise<T> {
    return this.request<T>("GET", path, { query });
  }

  post<T>(path: string, body?: unknown, query?: QueryParams): Promise<T> {
    return this.request<T>("POST", path, { body, query });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PATCH", path, { body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }
}

interface UploadRequestOptions {
  baseUrl: string;
  fetch: typeof fetch;
  headers?: Record<string, string>;
}

async function parseUploadResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    throw await ApiError.fromResponse(response, fallbackMessage);
  }

  const body = (await response.json()) as { success: boolean; data: T };
  return body.data;
}

export async function uploadFileRequest(
  file: File,
  folder = DEFAULT_FOLDER,
  options: UploadRequestOptions,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await options.fetch(`${options.baseUrl}${API_V1_PREFIX}/upload/direct`, {
    method: "POST",
    body: formData,
    credentials: "include",
    headers: options.headers,
  });

  return parseUploadResponse<UploadResponse>(response, "Upload failed");
}

export async function getPresignedUploadUrlRequest(
  input: PresignedUploadInput,
  options: UploadRequestOptions,
): Promise<PresignedUrlResponse> {
  const response = await options.fetch(`${options.baseUrl}${API_V1_PREFIX}/upload/presigned`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    body: JSON.stringify(input),
  });

  return parseUploadResponse<PresignedUrlResponse>(response, "Presigned URL request failed");
}

export async function uploadViaPresignedUrlRequest(
  file: File,
  folder = DEFAULT_FOLDER,
  options: UploadRequestOptions,
): Promise<UploadResponse> {
  const mimeType = file.type || "application/octet-stream";
  const presigned = await getPresignedUploadUrlRequest(
    { filename: file.name, mimeType, folder },
    options,
  );

  const uploadResponse = await options.fetch(presigned.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new ApiError(`Storage upload failed with status ${uploadResponse.status}`, {
      status: uploadResponse.status,
      code: "STORAGE_UPLOAD_FAILED",
    });
  }

  return {
    url: presigned.downloadUrl,
    key: presigned.key,
    size: file.size,
    mimeType,
  };
}

export interface ApiClient {
  baseUrl: string;
  fetch: typeof fetch;
  billing: {
    getConfig: () => Promise<BillingConfigResponse>;
    validateCoupon: (input: ValidateCouponInput) => Promise<ValidateCouponResponse>;
    getStatus: () => Promise<BillingStatusResponse>;
    createOrder: (input: CreateOrderInput) => Promise<CreateOrderResponse>;
    getOrder: (orderId: string) => Promise<GetOrderResponse>;
    payOrder: (orderId: string, input: PayOrderInput) => Promise<PayOrderResponse>;
    getAllOrders: (query?: GetAllOrdersInput) => Promise<GetAllOrdersResponse>;
    updateOrderStatus: (
      orderId: string,
      input: UpdateOrderStatusInput,
    ) => Promise<UpdateOrderStatusResponse>;
    checkout: (input: CheckoutInput) => Promise<CheckoutResponse>;
    getAllCoupons: (query?: GetAllCouponsInput) => Promise<GetAllCouponsResponse>;
    createCoupon: (input: CreateCouponInput) => Promise<CreateCouponResponse>;
    updateCoupon: (couponId: string, input: UpdateCouponInput) => Promise<UpdateCouponResponse>;
    deleteCoupon: (couponId: string) => Promise<DeleteCouponResponse>;
    revealExplanation: (questionId: string) => Promise<RevealExplanationResponse>;
  };
  exam: {
    create: (input: CreateCustomExamInput) => Promise<CreateExamResult>;
    getTakeSession: (examId: string) => Promise<CustomExamTakeData>;
    submit: (
      examId: string,
      payload: {
        timeSpentSeconds: number;
        answers: Record<string, string>;
        writtenSubmissions?: Array<{
          questionId: string;
          partId?: string;
          pageNumber?: number;
          imageUrl: string;
        }>;
      },
    ) => Promise<SubmitExamResult>;
    getSolution: (examId: string, submissionId?: string) => Promise<CustomExamSolveData>;
  };
  qb: {
    getHub: () => Promise<QBHubData>;
    getTree: () => Promise<QBTree>;
    getTarget: (slug: string) => Promise<QBTargetDetailData>;
    getContainer: (targetSlug: string, containerSlug: string) => Promise<QBContainerDetailData>;
    getContainerItem: (
      targetSlug: string,
      containerSlug: string,
      itemSlug: string,
    ) => Promise<QBItemDetailData>;
    getChapterQuestions: (
      subjectSlug: string,
      chapterSlug: string,
      params?: QBChapterQueryParams,
    ) => Promise<QBChapterDetailData>;
    getQuestion: (id: string) => Promise<QBQuestion>;
  };
  watch: {
    getFeed: (query: {
      category?: string;
      search?: string;
      cursor: number;
      limit: number;
    }) => Promise<WatchFeedResponse>;
    getVideo: (id: string) => Promise<WatchVideoDetailResponse>;
    getChannel: (handle: string) => Promise<WatchChannelDetailResponse>;
    getPlaylist: (slugOrId: string) => Promise<WatchPlaylistDetailResponse>;
    getComments: (id: string) => Promise<{ comments: WatchCommentItem[] }>;
    getSavedLibrary: () => Promise<SavedWatchLibraryResponse>;
    registerView: (id: string) => Promise<{ success: boolean }>;
    syncProgress: (
      id: string,
      progress: { lastPositionSeconds: number; durationSeconds: number; completed?: boolean },
    ) => Promise<{ success: boolean }>;
    toggleInteraction: (
      id: string,
      interaction: { isLiked?: boolean; isSaved?: boolean },
    ) => Promise<{ isLiked: boolean; isSaved: boolean }>;
    postComment: (
      id: string,
      content: string,
      parentId?: string,
    ) => Promise<{ comment: WatchCommentItem }>;
    toggleCommentLike: (commentId: string) => Promise<{ isLiked: boolean }>;
    toggleSubscription: (
      handle: string,
    ) => Promise<{ isSubscribed: boolean; subscribersCount: number }>;
  };
  health: {
    check: () => Promise<HealthResponse>;
  };
  storage: {
    upload: (file: File, folder?: string) => Promise<UploadResponse>;
    getPresignedUrl: (input: PresignedUploadInput) => Promise<PresignedUrlResponse>;
    uploadDirect: (file: File, folder?: string) => Promise<UploadResponse>;
  };
}

export function createApiClient(config: ApiClientConfig = {}): ApiClient {
  const baseUrl = normalizeBaseUrl(config.baseUrl ?? getDefaultApiUrl());
  const fetcher = (config.fetch ?? createDedupedFetch()) as typeof fetch;
  const core = new RequestCore(baseUrl, fetcher, config.headers);
  const uploadOptions: UploadRequestOptions = { baseUrl, fetch: fetcher, headers: config.headers };

  return {
    baseUrl,
    fetch: fetcher,
    billing: {
      getConfig: () => core.get<BillingConfigResponse>("/billing/config"),
      validateCoupon: (input) =>
        core.post<ValidateCouponResponse>("/billing/validate-coupon", input),
      getStatus: () => core.get<BillingStatusResponse>("/billing/status"),
      createOrder: (input) => core.post<CreateOrderResponse>("/billing/order", input),
      getOrder: (orderId) => core.get<GetOrderResponse>(`/billing/order/${orderId}`),
      payOrder: (orderId, input) =>
        core.post<PayOrderResponse>(`/billing/order/${orderId}/pay`, input),
      getAllOrders: (query) =>
        core.get<GetAllOrdersResponse>("/billing/orders", {
          status: query?.status,
          search: query?.search,
          page: query?.page,
          limit: query?.limit,
          offset: query?.offset,
        }),
      updateOrderStatus: (orderId, input) =>
        core.patch<UpdateOrderStatusResponse>(`/billing/order/${orderId}/status`, input),
      checkout: (input) => core.post<CheckoutResponse>("/billing/checkout", input),
      getAllCoupons: (query) =>
        core.get<GetAllCouponsResponse>("/billing/coupons", {
          search: query?.search,
          page: query?.page,
          limit: query?.limit,
        }),
      createCoupon: (input) => core.post<CreateCouponResponse>("/billing/coupons", input),
      updateCoupon: (couponId, input) =>
        core.patch<UpdateCouponResponse>(`/billing/coupon/${couponId}`, input),
      deleteCoupon: (couponId) => core.delete<DeleteCouponResponse>(`/billing/coupon/${couponId}`),
      revealExplanation: (questionId) =>
        core.post<RevealExplanationResponse>(`/billing/reveal-explanation/${questionId}`),
    },
    exam: {
      create: async (input) => {
        const response = await core.post<{
          success: boolean;
          data: {
            id?: string;
            examId?: string;
            title: string;
            totalQuestions?: number;
            questionCount?: number;
            durationMinutes: number;
            negativeMarks: string;
            examType: string;
          };
        }>("/exam/custom", input);
        const examData = response.data;
        const id = examData.id ?? examData.examId ?? "";
        const questionCount = examData.questionCount ?? examData.totalQuestions ?? 0;
        return {
          id,
          examId: examData.examId ?? examData.id ?? id,
          title: examData.title,
          totalQuestions: examData.totalQuestions ?? questionCount,
          questionCount,
          durationMinutes: examData.durationMinutes,
          negativeMarks: examData.negativeMarks,
          examType: examData.examType,
        };
      },
      getTakeSession: async (examId) => {
        const response = await core.get<{ success: boolean; data: CustomExamTakeData }>(
          `/exam/custom/${examId}/take`,
        );
        return response.data;
      },
      submit: async (examId, payload) => {
        const response = await core.post<{
          success: boolean;
          data: {
            id?: string;
            submissionId?: string;
            score: number | string;
            correctCount: number;
            wrongCount: number;
            unansweredCount: number;
            timeSpentSeconds: number;
            status: string;
          };
        }>(`/exam/custom/${examId}/submit`, payload);
        const submission = response.data;
        const id = submission.id ?? submission.submissionId ?? "";
        return {
          id,
          submissionId: submission.submissionId ?? submission.id ?? id,
          score: submission.score,
          correctCount: submission.correctCount,
          wrongCount: submission.wrongCount,
          unansweredCount: submission.unansweredCount,
          timeSpentSeconds: submission.timeSpentSeconds ?? payload.timeSpentSeconds,
          status: submission.status,
        };
      },
      getSolution: async (examId, submissionId) => {
        const response = await core.get<{ success: boolean; data: CustomExamSolveData }>(
          `/exam/custom/${examId}/solve`,
          submissionId ? { submissionId } : undefined,
        );
        return response.data;
      },
    },
    qb: {
      getHub: async () => {
        const response = await core.get<{ success: boolean; data: QBHubData }>("/qb/hub");
        return response.data;
      },
      getTree: async () => {
        const response = await core.get<{ success: boolean; data: QBTree }>("/qb/tree");
        return response.data;
      },
      getTarget: async (slug) => {
        const response = await core.get<{ success: boolean; data: QBTargetDetailData }>(
          `/qb/targets/${slug}`,
        );
        return response.data;
      },
      getContainer: async (targetSlug, containerSlug) => {
        const response = await core.get<{ success: boolean; data: QBContainerDetailData }>(
          `/qb/targets/${targetSlug}/containers/${containerSlug}`,
        );
        return response.data;
      },
      getContainerItem: async (targetSlug, containerSlug, itemSlug) => {
        const response = await core.get<{ success: boolean; data: QBItemDetailData }>(
          `/qb/targets/${targetSlug}/containers/${containerSlug}/items/${itemSlug}`,
        );
        return response.data;
      },
      getChapterQuestions: async (subjectSlug, chapterSlug, params) => {
        const response = await core.get<{ success: boolean; data: QBChapterDetailData }>(
          `/qb/subjects/${subjectSlug}/chapters/${chapterSlug}`,
          {
            page: params?.page,
            limit: params?.limit,
            targetSlug: params?.targetSlug,
            containerSlug: params?.containerSlug,
            itemSlug: params?.itemSlug,
            container: params?.container ?? params?.containerSlug,
            item: params?.item ?? params?.itemSlug,
            source: params?.source,
            sourceId: params?.sourceId,
            sourceSlug: params?.sourceSlug,
            sourceType: params?.sourceType,
            examSheet: params?.examSheet,
            examSheetId: params?.examSheetId,
            examSheetSlug: params?.examSheetSlug,
            subjectSlug: params?.subjectSlug,
            topicId: params?.topicId,
            qType: params?.qType,
          },
        );
        return response.data;
      },
      getQuestion: async (id) => {
        const response = await core.get<{ success: boolean; data: QBQuestion }>(
          `/qb/questions/${id}`,
        );
        return response.data;
      },
    },
    watch: {
      getFeed: (query) =>
        core.get<WatchFeedResponse>("/watch/feed", {
          category: query.category,
          search: query.search,
          cursor: query.cursor,
          limit: query.limit,
        }),
      getVideo: (id) => core.get<WatchVideoDetailResponse>(`/watch/videos/${id}`),
      getChannel: (handle) =>
        core.get<WatchChannelDetailResponse>(`/watch/channels/${encodeURIComponent(handle)}`),
      getPlaylist: (slugOrId) =>
        core.get<WatchPlaylistDetailResponse>(`/watch/playlists/${slugOrId}`),
      getComments: (id) =>
        core.get<{ comments: WatchCommentItem[] }>(`/watch/videos/${id}/comments`),
      getSavedLibrary: () => core.get<SavedWatchLibraryResponse>("/watch/library/saved"),
      registerView: (id) => core.post<{ success: boolean }>(`/watch/videos/${id}/view`),
      syncProgress: (id, progress) =>
        core.post<{ success: boolean }>(`/watch/videos/${id}/progress`, progress),
      toggleInteraction: (id, interaction) =>
        core.post<{ isLiked: boolean; isSaved: boolean }>(
          `/watch/videos/${id}/interact`,
          interaction,
        ),
      postComment: (id, content, parentId) =>
        core.post<{ comment: WatchCommentItem }>(`/watch/videos/${id}/comments`, {
          content,
          parentId,
        }),
      toggleCommentLike: (commentId) =>
        core.post<{ isLiked: boolean }>(`/watch/comments/${commentId}/like`),
      toggleSubscription: (handle) =>
        core.post<{ isSubscribed: boolean; subscribersCount: number }>(
          `/watch/channels/${encodeURIComponent(handle)}/subscribe`,
        ),
    },
    health: {
      check: () => core.get<HealthResponse>("/health"),
    },
    storage: {
      upload: (file, folder) => uploadFileRequest(file, folder, uploadOptions),
      getPresignedUrl: (input) => getPresignedUploadUrlRequest(input, uploadOptions),
      uploadDirect: (file, folder) => uploadViaPresignedUrlRequest(file, folder, uploadOptions),
    },
  };
}
