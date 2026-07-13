// noinspection ES6RedundantAwait

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import type {McpServerStdio} from "@agentclientprotocol/sdk";
import {startCodexConnection} from "../../CodexJsonRpcConnection";
import {createBaseTestFixture, removeDirectoryWithRetry, type TestFixture} from "../acp-test-utils";

describe('MCP config merge across global config and ACP request', { timeout: 40_000 }, () => {

    let codexHome: string;
    let fixture: TestFixture;

    beforeEach(() => {
        vi.clearAllMocks();

        const configToml = `
[mcp_servers.shared-mcp]
url = "https://example.com/mcp"
`;
        codexHome = fs.mkdtempSync(path.join(os.tmpdir(), "codex-acp-mcp-merge-"));
        fs.writeFileSync(path.join(codexHome, "config.toml"), configToml, "utf8");

        const codexConnection = startCodexConnection(undefined, {
            ...process.env,
            CODEX_HOME: codexHome,
        });

        fixture = createBaseTestFixture({
            connection: codexConnection.connection,
            getExitCode: () => codexConnection.process.exitCode,
        });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        removeDirectoryWithRetry(codexHome);
    });

    it('should not filter the conflicting ACP MCP when config filtering is disabled', async () => {
        vi.stubEnv("DISABLE_MCP_CONFIG_FILTERING", "true");
        const codexAcpAgent = fixture.getCodexAcpAgent();
        await codexAcpAgent.initialize({protocolVersion: 1});

        fixture.getCodexAcpClient().authRequired = vi.fn().mockResolvedValue(false);

        const conflictingMcp: McpServerStdio = {
            name: "shared-mcp",
            command: "./node_modules/.bin/mcp-hello-world",
            args: ["example"],
            env: [{name: "example", value: "example"}],
        };

        await expect(codexAcpAgent.newSession({
            cwd: "",
            mcpServers: [conflictingMcp],
        })).rejects.toThrow("url is not supported for stdio");
    });
});
