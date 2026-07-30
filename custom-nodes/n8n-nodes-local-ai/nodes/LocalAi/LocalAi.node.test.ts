/* eslint-disable @n8n/community-nodes/no-restricted-imports */
import { describe, expect, it, vi } from 'vitest';

import { LmChatLocalAi } from './LmChatLocalAi.node';
import { buildResponseFormat, normalizeBaseUrl } from './utils';

describe('Local AI node', () => {
	it('is discoverable as an AI language-model provider', () => {
		const description = new LmChatLocalAi().description;

		expect(description.codex?.categories).toContain('AI');
		expect(description.codex?.subcategories?.AI).toContain('Language Models');
		expect(description.codex?.alias).toContain('localai');
		expect(description.outputs).toContain('ai_languageModel');
	});

	it('normalizes a configured base URL without changing its hostname', () => {
		expect(normalizeBaseUrl('http://aimee.bajaj.com:8080/v1/')).toBe(
			'http://aimee.bajaj.com:8080/v1',
		);
	});

	it('builds LocalAI JSON Object response_format as an object', () => {
		expect(buildResponseFormat('json_object')).toEqual({
			response_format: {
				type: 'json_object',
			},
		});
	});

	it('builds the Chat Completions JSON Schema wrapper', () => {
		const schema = {
			type: 'object',
			properties: {
				category: {
					type: 'string',
				},
			},
			required: ['category'],
		};

		expect(buildResponseFormat('json_schema', 'triage', true, schema)).toEqual({
			response_format: {
				type: 'json_schema',
				json_schema: {
					name: 'triage',
					strict: true,
					schema,
				},
			},
		});
	});

	it('supplies Chat Completions with request-scoped thinking none', async () => {
		const node = new LmChatLocalAi();
		const getNodeParameter = vi.fn((name: string) => {
			const parameters: Record<string, unknown> = {
				model: 'gemma4-aimee',
				thinking: 'none',
				responseFormat: 'json_object',
				options: {
					maxRetries: 0,
					maxTokens: 1000,
					temperature: 0.2,
					timeout: 240000,
				},
			};

			return parameters[name];
		});
		const context = {
			getCredentials: vi.fn(async () => ({
				apiKey: 'local-ai',
				url: 'http://aimee.bajaj.com:8080/v1',
			})),
			getNodeParameter,
			getNode: vi.fn(() => ({
				id: 'local-ai-test',
				name: 'Local AI',
				type: 'n8n-nodes-local-ai.lmChatLocalAi',
				typeVersion: 1,
				position: [0, 0],
				parameters: {},
			})),
		};

		const supplied = await node.supplyData.call(context as never, 0);
		const model = supplied.response as unknown as {
			invocationParams: () => Record<string, unknown>;
			useResponsesApi?: boolean;
		};
		const invocation = model.invocationParams();

		expect(model.useResponsesApi).toBe(false);
		expect(invocation.reasoning_effort).toBe('none');
		expect(invocation.response_format).toEqual({
			type: 'json_object',
		});
		expect(invocation.max_tokens).toBe(1000);
		expect(invocation.temperature).toBe(0.2);
	});
});
