# ACP adapter for Codex CLI

[![npm version](https://img.shields.io/npm/v/acp-extension-codex)](https://www.npmjs.com/package/acp-extension-codex)

Use [OpenAI Codex](https://github.com/openai/codex) from [Agent Client Protocol](https://agentclientprotocol.com/) clients.

`acp-extension-codex` is a stdio ACP agent server. It starts the Codex App Server, translates ACP requests into Codex operations, and maps Codex events back into the client.

## Features

- ChatGPT, API key, and client-provided custom gateway authentication.
- Model, reasoning effort, fast mode, approval, and sandbox mode configuration.
- Text prompts, embedded context, images, resource links, and additional workspace directories.
- Shell command, file change, permission request, MCP tool call, terminal output, reasoning, plan, web search, image generation, image view, token usage, and review events.
- Client-provided MCP servers over command-based stdio config and HTTP transport.
- Slash commands: `/status`, `/mcp`, `/skills`, `/review`, `/review-branch`, `/review-commit`, `/compact`, and `/logout`, as well as configured skills.

## Installation

Run the published package directly:

```bash
npx -y acp-extension-codex
```

Or install it globally:

```bash
npm install -g acp-extension-codex
acp-extension-codex --version
```

The npm package includes a compatible `@openai/codex` dependency. Set `CODEX_PATH` only when you want the adapter to run a different Codex binary:

```bash
CODEX_PATH=/path/to/codex npx -y acp-extension-codex
```

## Authentication

The adapter advertises ACP auth methods during initialization. Clients can authenticate with:

- ChatGPT login.
- OpenAI API key.
- A custom OpenAI-compatible gateway, when the client opts in to the gateway auth capability.

## Runtime options

- `CODEX_PATH` - run a specific Codex executable instead of the bundled package dependency.
- `CODEX_CONFIG` - JSON object merged into the Codex session config.
- `MODEL_PROVIDER` - model provider to pass to Codex for new sessions.
- `DEFAULT_AUTH_REQUEST` - ACP auth request JSON used when Codex requires authentication.
- `INITIAL_AGENT_MODE` - initial mode id: `read-only`, `agent`, or `agent-full-access`.
- `APP_SERVER_LOGS` - directory for adapter logs.

## Development

```bash
npm install
npm run start
npm run typecheck
npm test
```

Build standalone binaries in `dist/bin` with:

```bash
npm run bundle:all
```

See [readme-dev.md](readme-dev.md) for local client configuration, binary packaging, and Codex type regeneration.

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.
