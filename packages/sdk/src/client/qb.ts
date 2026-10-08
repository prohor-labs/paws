import type {
  QBChapterDetailData,
  QBChapterQueryParams,
  QBHubData,
  QBItemDetailData,
  QBQuestion,
  QBTargetDetailData,
  QBTree,
} from "../types/qb";
import { ApiError } from "./errors";
import type { HcApp, RpcClient } from "./rpc";

export class QuestionBankClient<TAppType extends HcApp = HcApp> {
  // biome-ignore lint/suspicious/noExplicitAny: uses generic RPC client
  private readonly rpcAny: any;

  constructor(rpc: RpcClient<TAppType>) {
    this.rpcAny = rpc;
  }

  /**
   * Retrieves the question bank hub catalog
   */
  async getHub(): Promise<QBHubData> {
    const res = await this.rpcAny.qb.hub.$get();
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch question bank hub");
    }
    const data = await res.json();
    return data.data as QBHubData;
  }

  /**
   * Retrieves full hierarchical tree of targets, subjects, and chapters
   */
  async getTree(): Promise<QBTree> {
    const res = await this.rpcAny.qb.tree.$get();
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch question bank tree");
    }
    const data = await res.json();
    return data.data as QBTree;
  }

  /**
   * Retrieves details for a specific academic/admission target
   */
  async getTarget(slug: string): Promise<QBTargetDetailData> {
    const res = await this.rpcAny.qb.targets[":slug"].$get({ param: { slug } });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch target details");
    }
    const data = await res.json();
    return data.data as QBTargetDetailData;
  }

  /**
   * Retrieves details for a specific container item (e.g. board exam year or varsity group)
   */
  async getContainerItem(
    targetSlug: string,
    containerSlug: string,
    itemSlug: string,
  ): Promise<QBItemDetailData> {
    const res = await this.rpcAny.qb.targets[":targetSlug"].containers[":containerSlug"].items[":itemSlug"].$get({
      param: { targetSlug, containerSlug, itemSlug },
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch container item details");
    }
    const data = await res.json();
    return data.data as QBItemDetailData;
  }

  /**
   * Retrieves questions and topics for a specific subject and chapter
   */
  async getChapterQuestions(
    subjectSlug: string,
    chapterSlug: string,
    params?: QBChapterQueryParams,
  ): Promise<QBChapterDetailData> {
    const query: Record<string, string> = {};
    if (params?.targetSlug) query.targetSlug = params.targetSlug;
    if (params?.topicId) query.topicId = params.topicId;
    if (params?.subjectSlug) query.subjectSlug = params.subjectSlug;
    if (params?.qType) query.qType = params.qType;
    if (params?.limit) query.limit = String(params.limit);
    if (params?.page) query.page = String(params.page);

    const res = await this.rpcAny.qb.subjects[":subjectSlug"].chapters[":chapterSlug"].$get({
      param: { subjectSlug, chapterSlug },
      query,
    });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch chapter questions");
    }
    const data = await res.json();
    return data.data as QBChapterDetailData;
  }

  /**
   * Fetches single question detail by ID
   */
  async getQuestion(id: string): Promise<QBQuestion> {
    const res = await this.rpcAny.qb.questions[":id"].$get({ param: { id } });
    if (!res.ok) {
      throw await ApiError.fromResponse(res, "Failed to fetch question detail");
    }
    const data = await res.json();
    return data.data as QBQuestion;
  }
}
