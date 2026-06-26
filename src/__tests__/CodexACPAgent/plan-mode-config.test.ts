import {describe, expect, it, vi} from "vitest";
import {
    createCodexMockTestFixture,
    createTestModel,
    setupPromptTestSession,
} from "../acp-test-utils";
import {
    createPlanModeConfigOption,
    PLAN_MODE_CONFIG_ID,
    PLAN_MODE_OFF,
    PLAN_MODE_ON,
} from "../../PlanModeConfig";

describe("Plan mode session config", () => {
    async function createSession() {
        const fixture = createCodexMockTestFixture();
        const codexAcpAgent = fixture.getCodexAcpAgent();
        const codexAcpClient = fixture.getCodexAcpClient();
        const model = createTestModel({id: "model-id"});

        vi.spyOn(codexAcpClient, "authRequired").mockResolvedValue(false);
        vi.spyOn(codexAcpClient, "getAccount").mockResolvedValue({account: null, requiresOpenaiAuth: false});
        vi.spyOn(codexAcpClient, "newSession").mockResolvedValue({
            sessionId: "session-id",
            currentModelId: "model-id[medium]",
            models: [model],
            currentServiceTier: null,
            additionalDirectories: [],
        });

        const response = await codexAcpAgent.newSession({cwd: "/test/cwd", mcpServers: []});
        return {codexAcpAgent, response};
    }

    it("returns the Plan mode config option defaulted to Off for new sessions", async () => {
        const {response} = await createSession();

        expect(response.configOptions).toContainEqual(createPlanModeConfigOption(false));
    });

    it("toggles Plan mode through session config options", async () => {
        const {codexAcpAgent} = await createSession();

        const onResponse = await codexAcpAgent.setSessionConfigOption({
            sessionId: "session-id",
            configId: PLAN_MODE_CONFIG_ID,
            value: PLAN_MODE_ON,
        });
        expect(onResponse.configOptions).toContainEqual(createPlanModeConfigOption(true));
        expect(codexAcpAgent.getSessionState("session-id").planModeEnabled).toBe(true);
        expect(codexAcpAgent.getSessionState("session-id").planModeExplicitlySet).toBe(true);

        const offResponse = await codexAcpAgent.setSessionConfigOption({
            sessionId: "session-id",
            configId: PLAN_MODE_CONFIG_ID,
            value: PLAN_MODE_OFF,
        });
        expect(offResponse.configOptions).toContainEqual(createPlanModeConfigOption(false));
        expect(codexAcpAgent.getSessionState("session-id").planModeEnabled).toBe(false);
        expect(codexAcpAgent.getSessionState("session-id").planModeExplicitlySet).toBe(true);
    });

    it("rejects unknown Plan mode values", async () => {
        const {codexAcpAgent} = await createSession();

        await expect(codexAcpAgent.setSessionConfigOption({
            sessionId: "session-id",
            configId: PLAN_MODE_CONFIG_ID,
            value: "maybe",
        })).rejects.toThrow();
    });

    it("does not send collaborationMode before Plan mode is configured", async () => {
        const {mockFixture, turnStartSpy} = setupPromptTestSession({
            sessionId: "session-id",
            currentModelId: "model-id[high]",
        });
        const codexAcpAgent = mockFixture.getCodexAcpAgent();

        await codexAcpAgent.prompt({sessionId: "session-id", prompt: [{type: "text", text: "test"}]});

        const [turnStartParams] = turnStartSpy.mock.calls[0]!;
        expect("collaborationMode" in turnStartParams).toBe(false);
    });

    it("sends Plan collaboration mode with the selected reasoning effort when Plan mode is enabled", async () => {
        const {mockFixture, turnStartSpy} = setupPromptTestSession({
            sessionId: "session-id",
            currentModelId: "model-id[high]",
            planModeEnabled: true,
            planModeExplicitlySet: true,
        });
        const codexAcpAgent = mockFixture.getCodexAcpAgent();

        await codexAcpAgent.prompt({sessionId: "session-id", prompt: [{type: "text", text: "test"}]});

        expect(turnStartSpy).toHaveBeenCalledWith(expect.objectContaining({
            collaborationMode: {
                mode: "plan",
                settings: {
                    model: "model-id",
                    reasoning_effort: "high",
                    developer_instructions: null,
                },
            },
        }));
    });

    it("sends Default collaboration mode after Plan mode is explicitly disabled", async () => {
        const {mockFixture, turnStartSpy} = setupPromptTestSession({
            sessionId: "session-id",
            currentModelId: "model-id[high]",
            planModeEnabled: false,
            planModeExplicitlySet: true,
        });
        const codexAcpAgent = mockFixture.getCodexAcpAgent();

        await codexAcpAgent.prompt({sessionId: "session-id", prompt: [{type: "text", text: "test"}]});

        expect(turnStartSpy).toHaveBeenCalledWith(expect.objectContaining({
            collaborationMode: {
                mode: "default",
                settings: {
                    model: "model-id",
                    reasoning_effort: "high",
                    developer_instructions: null,
                },
            },
        }));
    });
});
