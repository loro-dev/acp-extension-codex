import {describe, expect, it, vi} from "vitest";
import {createCodexMockTestFixture} from "../acp-test-utils";
import {
    THREAD_GOAL_CLEAR_METHOD,
    THREAD_GOAL_GET_METHOD,
    THREAD_GOAL_SET_METHOD,
} from "../../AcpExtensions";
import type {ThreadGoal} from "../../app-server/v2";

describe("Thread goal ext methods", () => {
    const threadId = "thread-id";
    const goal: ThreadGoal = {
        threadId,
        objective: "Ship goal support",
        status: "active",
        tokenBudget: 1000,
        tokensUsed: 42,
        timeUsedSeconds: 12,
        createdAt: 1710000000,
        updatedAt: 1710000012,
    };

    it("gets the thread goal with the app-server response shape", async () => {
        const fixture = createCodexMockTestFixture();
        const threadGoalGet = vi.spyOn(fixture.getCodexAppServerClient(), "threadGoalGet")
            .mockResolvedValue({goal});

        const response = await fixture.getCodexAcpAgent().extMethod(THREAD_GOAL_GET_METHOD, {
            threadId,
        });

        expect(threadGoalGet).toHaveBeenCalledWith({threadId});
        expect(response).toEqual({goal});
    });

    it("sets the thread goal and returns the app-server response", async () => {
        const fixture = createCodexMockTestFixture();
        const threadGoalSet = vi.spyOn(fixture.getCodexAppServerClient(), "threadGoalSet")
            .mockResolvedValue({goal});

        const response = await fixture.getCodexAcpAgent().extMethod(THREAD_GOAL_SET_METHOD, {
            threadId,
            objective: "Ship goal support",
            status: "paused",
            tokenBudget: 1000,
        });

        expect(threadGoalSet).toHaveBeenCalledWith({
            threadId,
            objective: "Ship goal support",
            status: "paused",
            tokenBudget: 1000,
        });
        expect(response).toEqual({goal});
    });

    it("clears the thread goal with the app-server response shape", async () => {
        const fixture = createCodexMockTestFixture();
        const threadGoalClear = vi.spyOn(fixture.getCodexAppServerClient(), "threadGoalClear")
            .mockResolvedValue({cleared: true});

        const response = await fixture.getCodexAcpAgent().extMethod(THREAD_GOAL_CLEAR_METHOD, {
            threadId,
        });

        expect(threadGoalClear).toHaveBeenCalledWith({threadId});
        expect(response).toEqual({cleared: true});
    });

    it("rejects invalid thread goal params", async () => {
        const fixture = createCodexMockTestFixture();

        await expect(fixture.getCodexAcpAgent().extMethod(THREAD_GOAL_SET_METHOD, {
            threadId,
            status: "not-a-status",
        })).rejects.toThrow();
    });
});
