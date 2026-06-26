import {describe, expect, it, vi, beforeEach} from "vitest";
import type {SessionState} from "../../CodexAcpServer";
import type {ServerNotification} from "../../app-server";
import {AgentMode} from "../../AgentMode";
import {
    createCodexMockTestFixture,
    createTestSessionState,
    setupPromptAndSendNotifications,
    type CodexMockTestFixture,
} from "../acp-test-utils";
import {ACP_EXT_CODEX_PROPOSED_PLAN_METHOD} from "../../AcpExtensions";

describe("CodexEventHandler - proposed plan events", () => {
    let mockFixture: CodexMockTestFixture;
    const sessionId = "test-session-id";

    beforeEach(() => {
        mockFixture = createCodexMockTestFixture();
        vi.clearAllMocks();
    });

    const sessionState: SessionState = createTestSessionState({
        sessionId,
        currentModelId: "model-id[effort]",
        agentMode: AgentMode.DEFAULT_AGENT_MODE,
    });

    it("should send legacy proposed plan ext notifications for deltas and completion", async () => {
        const notifications: ServerNotification[] = [
            {
                method: "item/plan/delta",
                params: {
                    threadId: sessionId,
                    turnId: "turn-plan",
                    itemId: "item-plan",
                    delta: "- Inspect the parser\n",
                },
            },
            {
                method: "item/plan/delta",
                params: {
                    threadId: sessionId,
                    turnId: "turn-plan",
                    itemId: "item-plan",
                    delta: "- Reuse the existing UI\n",
                },
            },
            {
                method: "turn/completed",
                params: {
                    threadId: sessionId,
                    turn: {
                        id: "turn-plan",
                        items: [],
                        itemsView: "notLoaded",
                        status: "completed",
                        error: null,
                        startedAt: null,
                        completedAt: null,
                        durationMs: null,
                    },
                },
            },
        ];

        await setupPromptAndSendNotifications(mockFixture, sessionId, sessionState, notifications);

        expect(mockFixture.getAcpConnectionEvents([])).toEqual([
            {
                method: "notify",
                args: [
                    ACP_EXT_CODEX_PROPOSED_PLAN_METHOD,
                    {
                        schemaVersion: 1,
                        sessionId,
                        turnId: "turn-plan",
                        markdown: "- Inspect the parser\n",
                        status: "delta",
                        isLatest: true,
                    },
                ],
            },
            {
                method: "notify",
                args: [
                    ACP_EXT_CODEX_PROPOSED_PLAN_METHOD,
                    {
                        schemaVersion: 1,
                        sessionId,
                        turnId: "turn-plan",
                        markdown: "- Inspect the parser\n- Reuse the existing UI\n",
                        status: "delta",
                        isLatest: true,
                    },
                ],
            },
            {
                method: "notify",
                args: [
                    ACP_EXT_CODEX_PROPOSED_PLAN_METHOD,
                    {
                        schemaVersion: 1,
                        sessionId,
                        turnId: "turn-plan",
                        markdown: "- Inspect the parser\n- Reuse the existing UI\n",
                        status: "completed",
                        isLatest: true,
                    },
                ],
            },
        ]);
    });
});
