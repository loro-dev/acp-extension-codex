import type {
    ClientContext,
    LoadSessionResponse,
    NewSessionResponse,
    ResumeSessionResponse,
    SessionId,
} from "@agentclientprotocol/sdk";

export const LEGACY_SET_SESSION_MODEL_METHOD = "session/set_model";
export const ACP_EXT_SESSION_USAGE_UPDATE_METHOD = "_acp_ext:session_usage_update";
export const ACP_EXT_SESSION_RATE_LIMITS_METHOD = "_acp_ext:session_rate_limits";
export const ACP_EXT_CODEX_PROPOSED_PLAN_METHOD = "_acp_ext:codex_proposed_plan";

export type LegacySessionModel = {
    modelId: string;
    name: string;
    description?: string | null;
}

export type LegacySessionModelState = {
    availableModels: Array<LegacySessionModel>;
    currentModelId: string;
}

export type SessionUsageExtNotification = {
    usage: {
        inputTokens: number;
        outputTokens: number;
        cacheReadInputTokens: number;
        reasoningOutputTokens: number;
        contextWindow: number | null;
    }
}

export type SessionRateLimitsExtNotification = {
    planName: string | null;
    limitName: string | null;
    limitId: string | null;
    fiveHour: number | null;
    sevenDay: number | null;
    fiveHourResetAt: number | null;
    sevenDayResetAt: number | null;
}

export type CodexProposedPlanExtNotification = {
    schemaVersion: 1;
    sessionId: string;
    turnId: string;
    markdown: string;
    status: "delta" | "completed";
    isLatest: boolean;
}

export type LegacySetSessionModelRequest = {
    sessionId: SessionId;
    modelId: string;
}

export type LegacySetSessionModelResponse = {}

export type LegacyNewSessionResponse = NewSessionResponse & {
    models?: LegacySessionModelState | null;
}

export type LegacyLoadSessionResponse = LoadSessionResponse & {
    models?: LegacySessionModelState | null;
}

export type LegacyResumeSessionResponse = ResumeSessionResponse & {
    models?: LegacySessionModelState | null;
}

export type ExtMethodRequest =
    AuthenticationStatusRequest
    | AuthenticationLogoutRequest
    | LegacySetSessionModelExtRequest

export function isExtMethodRequest(request: { method: string, params: Record<string, unknown> }): request is ExtMethodRequest {
    return request.method === "authentication/status"
        || request.method === "authentication/logout"
        || request.method === LEGACY_SET_SESSION_MODEL_METHOD;
}

export type AuthenticationStatusRequest = { method: "authentication/status", params: {} }
export type AuthenticationStatusResponse = { type: "api-key" } | { type: "chat-gpt", email: string } | { type: "gateway", name: string } | { type: "unauthenticated" }

export type AuthenticationLogoutRequest = { method: "authentication/logout", params: {} }
export type AuthenticationLogoutResponse = {}

export type LegacySetSessionModelExtRequest = {
    method: typeof LEGACY_SET_SESSION_MODEL_METHOD;
    params: LegacySetSessionModelRequest;
}

export async function legacySetSessionModel(
    connection: Pick<ClientContext, "request">,
    params: LegacySetSessionModelRequest,
): Promise<LegacySetSessionModelResponse> {
    return await connection.request<LegacySetSessionModelResponse, LegacySetSessionModelRequest>(LEGACY_SET_SESSION_MODEL_METHOD, params);
}
