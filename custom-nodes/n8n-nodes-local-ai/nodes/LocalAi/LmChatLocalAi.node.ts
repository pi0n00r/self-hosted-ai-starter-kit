import { supplyModel, type OpenAiModel } from '@n8n/ai-node-sdk';
import {
	NodeConnectionTypes,
	NodeOperationError,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
} from 'n8n-workflow';

import {
	buildResponseFormat,
	type LocalAiResponseFormat,
	normalizeBaseUrl,
	parseSchema,
} from './utils';

type ThinkingEffort = NonNullable<NonNullable<OpenAiModel['reasoning']>['effort']>;

type ModelOptions = {
	maxRetries?: number;
	maxTokens?: number;
	temperature?: number;
	timeout?: number;
};

export class LmChatLocalAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Local AI',
		name: 'lmChatLocalAi',
		icon: {
			light: 'file:../../icons/local-ai.svg',
			dark: 'file:../../icons/local-ai.dark.svg',
		},
		group: ['transform'],
		version: [1],
		description: 'Use an OpenAI-compatible local chat model with an AI chain',
		defaults: {
			name: 'Local AI',
		},
		subtitle: '={{$parameter["model"]}}',
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			resources: {
				primaryDocumentation: [],
			},
			alias: ['localai', 'local ai', 'openai-compatible'],
		},
		inputs: [],
		outputs: [NodeConnectionTypes.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				// Internal-only node: one existing LocalAI credential is safer than
				// adding another independent copy of the endpoint and API key.
				// eslint-disable-next-line @n8n/community-nodes/no-credential-reuse
				name: 'openAiApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				default: 'gemma4-aimee',
				required: true,
				description: 'The exact model name exposed by the local endpoint',
			},
			{
				displayName: 'Thinking',
				name: 'thinking',
				type: 'options',
				default: 'none',
				description:
					'Reasoning effort sent on this request. None does not disable thinking model-wide.',
				options: [
					{
						name: 'High',
						value: 'high',
					},
					{
						name: 'Low',
						value: 'low',
					},
					{
						name: 'Medium',
						value: 'medium',
					},
					{
						name: 'Minimal',
						value: 'minimal',
					},
					{
						name: 'None',
						value: 'none',
						description: 'Send reasoning_effort none',
					},
				],
			},
			{
				displayName: 'Response Format',
				name: 'responseFormat',
				type: 'options',
				default: 'text',
				options: [
					{
						name: 'Text',
						value: 'text',
					},
					{
						name: 'JSON Object',
						value: 'json_object',
					},
					{
						name: 'JSON Schema',
						value: 'json_schema',
					},
				],
			},
			{
				displayName: 'Schema Name',
				name: 'schemaName',
				type: 'string',
				default: 'local_ai_result',
				required: true,
				displayOptions: {
					show: {
						responseFormat: ['json_schema'],
					},
				},
			},
			{
				displayName: 'JSON Schema',
				name: 'jsonSchema',
				type: 'json',
				default: '{\n  "type": "object",\n  "properties": {}\n}',
				required: true,
				displayOptions: {
					show: {
						responseFormat: ['json_schema'],
					},
				},
				description:
					'The schema wrapped in response_format.json_schema for Chat Completions',
			},
			{
				displayName: 'Strict',
				name: 'strictSchema',
				type: 'boolean',
				default: true,
				displayOptions: {
					show: {
						responseFormat: ['json_schema'],
					},
				},
				description:
					'Whether the endpoint should enforce the supplied schema when it supports strict mode',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokens',
						type: 'number',
						default: 1000,
						typeOptions: {
							minValue: 1,
							numberStepSize: 1,
						},
						description: 'Maximum number of completion tokens to generate',
					},
					{
						displayName: 'Maximum Retries',
						name: 'maxRetries',
						type: 'number',
						default: 0,
						typeOptions: {
							minValue: 0,
							maxValue: 10,
							numberStepSize: 1,
						},
					},
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						type: 'number',
						default: 0.2,
						typeOptions: {
							minValue: 0,
							maxValue: 2,
							numberPrecision: 2,
						},
						description:
							'Controls randomness. Lower values produce more deterministic completions.',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						type: 'number',
						default: 240000,
						typeOptions: {
							minValue: 1000,
							numberStepSize: 1000,
						},
						description: 'Request timeout in milliseconds',
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number) {
		const credentials = await this.getCredentials('openAiApi');
		const model = this.getNodeParameter('model', itemIndex) as string;
		const thinking = this.getNodeParameter(
			'thinking',
			itemIndex,
			'none',
		) as ThinkingEffort;
		const responseFormat = this.getNodeParameter(
			'responseFormat',
			itemIndex,
			'text',
		) as LocalAiResponseFormat;
		const options = this.getNodeParameter('options', itemIndex, {}) as ModelOptions;

		let baseUrl: string;
		let additionalParams: Record<string, unknown>;

		try {
			baseUrl = normalizeBaseUrl(credentials.url);

			if (responseFormat === 'json_schema') {
				const schemaName = this.getNodeParameter(
					'schemaName',
					itemIndex,
					'local_ai_result',
				) as string;
				const strictSchema = this.getNodeParameter(
					'strictSchema',
					itemIndex,
					true,
				) as boolean;
				const schema = parseSchema(
					this.getNodeParameter('jsonSchema', itemIndex, '{}'),
				);
				additionalParams = {
					reasoning_effort: thinking,
					...buildResponseFormat(
						responseFormat,
						schemaName,
						strictSchema,
						schema,
					),
				};
			} else {
				additionalParams = {
					reasoning_effort: thinking,
					...buildResponseFormat(responseFormat),
				};
			}
		} catch (error) {
			throw new NodeOperationError(this.getNode(), error as Error, {
				functionality: 'configuration-node',
			});
		}

		return supplyModel(this, {
			type: 'openai',
			baseUrl,
			apiKey: credentials.apiKey as string,
			model,
			useResponsesApi: false,
			supportsStrictToolCalling: false,
			temperature: options.temperature,
			maxTokens: options.maxTokens,
			timeout: options.timeout,
			maxRetries: options.maxRetries,
			streaming: false,
			additionalParams,
		});
	}
}
