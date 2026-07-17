import { describe, it, expect, vi, beforeEach } from "vitest";
import type { SessionState } from "../../CodexAcpServer";
import type { ServerNotification } from "../../app-server";
import {
    createCodexMockTestFixture,
    createTestSessionState,
    setupPromptAndSendNotifications,
    type CodexMockTestFixture,
} from "../acp-test-utils";
import { AgentMode } from "../../AgentMode";

describe("CodexEventHandler - warning events", () => {
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

    it("forwards warning and configWarning as structured session_info_update metadata", async () => {
        const skillWarning: ServerNotification = {
            method: "warning",
            params: {
                threadId: sessionId,
                message: "Skill descriptions were shortened to fit the 2% skills context budget.",
            },
        };
        const configWarning: ServerNotification = {
            method: "configWarning",
            params: {
                summary: "Unknown key in config.toml",
                details: "skills.foo",
            },
        };
        const agentMessage: ServerNotification = {
            method: "item/agentMessage/delta",
            params: {
                threadId: sessionId,
                turnId: "turn-1",
                itemId: "message-1",
                delta: "Here is the actual answer.",
            },
        };

        await setupPromptAndSendNotifications(mockFixture, sessionId, sessionState, [
            skillWarning,
            configWarning,
            agentMessage,
        ]);

        const dump = mockFixture.getAcpConnectionDump([]);
        // Warnings travel as structured metadata, never as agent text chunks.
        expect(dump).toContain("session_info_update");
        expect(dump).toContain("Skill descriptions were shortened");
        expect(dump).toContain("Unknown key in config.toml");
        expect(dump).toContain("configWarning");
        expect(dump).toContain("Here is the actual answer.");
        expect(dump).not.toContain("Warning: Skill descriptions");
        expect(dump).not.toContain("Config warning:");
    });
});
