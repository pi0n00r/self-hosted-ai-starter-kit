# Production verification

Template: `n8n-nodes-local-ai` 0.1.1  
Node label: **Local AI**  
Backend: LocalAI at `http://aimee.bajaj.com:8080/v1`  
Model: `gemma4-aimee`

## Certified UMMA settings

- Credential: existing n8n `LocalAI` OpenAI-compatible credential
- Thinking: **None**
- Response format: **JSON Object**
- Temperature: `0.2`
- Maximum output tokens: `1000`
- Retries: `0`
- Triage timeout: `180000` ms
- Summarise timeout: `240000` ms

## Live workflow proof

Production execution: `22949`

- Triage: 133.758 seconds, 14,825 tokens
- Summarise: 41.004 seconds, 9,981 tokens
- Workflow total: 177 seconds
- Gemini fallback was not used
- Carrier delivery completed
- Workflow reached Completed Exit

This proves the custom node can drive the restored UMMA graph directly through LocalAI without bypass nodes.

## Catalog and rebuild proof

Verified in production on 2026-07-30:

- A clean `docker compose build --pull --no-cache n8n` completed from the maintained stack.
- Recreating only the n8n service preserved n8n `2.31.6` and returned `{"status":"ok"}` from `/healthz`.
- The baked package installed as `n8n-nodes-local-ai` `0.1.1`; a subsequent restart did not reinstall it.
- The authenticated live node catalog advertises:
  - category: `AI`
  - aliases: `localai`, `local ai`, `openai-compatible`
  - output: `ai_languageModel`
- Searching `LocalAI` in the live UMMA node picker returns **Local AI**.
- Existing active workflows remained present and published; no workflow was edited during verification.

Stack commit: `e9f633261323a1d9cd58cf83567b71e1fd01bc1c`

Package SHA-256: `e7cf7eb54f12fcc2bbdc562d346942b32e811443208b1b041b894910c4f015f3`
