# Local AI for n8n

`Local AI` is an internal n8n language-model subnode for OpenAI-compatible
local inference endpoints. It follows n8n's OpenAI-compatible chat-model
template and always uses Chat Completions, never the Responses API.

In the node picker, search for `LocalAI` or `Local AI`, or add it from an AI
chain's model connector under **AI > Language Models**.

## UMMA production settings

- Credential: existing `LocalAI` OpenAI credential
- Base URL: `http://aimee.bajaj.com:8080/v1`
- Model: `gemma4-aimee`
- Thinking: `None`
- Response format: `JSON Object`
- Sampling temperature: `0.2`
- Maximum output tokens: `1000`
- Maximum retries: `0`
- Timeout: `180000` ms for Triage and `240000` ms for Summarise

`Thinking: None` sends `reasoning_effort: "none"` on each request. It does not
disable thinking in the model configuration, so other clients can still ask
Gemma4 for a different reasoning effort.

The package deliberately reuses n8n's existing `openAiApi` credential type.
That keeps the endpoint and API key in one credential rather than introducing
another independent secret store. This is an internal package and is not
intended for n8n community-node publication.

## Response formats

- `Text` omits `response_format`.
- `JSON Object` sends `{"type":"json_object"}`.
- `JSON Schema` sends the OpenAI Chat Completions schema wrapper.

For LocalAI 4.7.1, prefer flat schemas whose declared properties are all
required. UMMA uses `JSON Object` so its prompts remain the canonical output
contract and identity fields are not accidentally excluded.

## Build and test

```sh
npm install
npm test
npm run build
```

The package is pinned to the AI SDK bundled with n8n 2.29.10:
`@n8n/ai-node-sdk` 0.19.8 and `n8n-workflow` 2.29.3.

The ensō icon is the canonical `bajaj-mark.svg` from
`/Documents/blog/brand` in Nextcloud.
