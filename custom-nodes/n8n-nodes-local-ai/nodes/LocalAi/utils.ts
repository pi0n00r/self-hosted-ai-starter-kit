export type LocalAiResponseFormat = 'text' | 'json_object' | 'json_schema';

export function normalizeBaseUrl(value: unknown): string {
	const baseUrl = String(value ?? '').trim().replace(/\/+$/, '');

	if (!/^https?:\/\/[^/]+/i.test(baseUrl)) {
		throw new Error('Base URL must be an HTTP or HTTPS URL');
	}

	return baseUrl;
}

export function buildResponseFormat(
	format: LocalAiResponseFormat,
	schemaName?: string,
	strictSchema?: boolean,
	schema?: Record<string, unknown>,
): Record<string, unknown> {
	if (format === 'text') {
		return {};
	}

	if (format === 'json_object') {
		return {
			response_format: {
				type: 'json_object',
			},
		};
	}

	return {
		response_format: {
			type: 'json_schema',
			json_schema: {
				name: schemaName,
				strict: strictSchema,
				schema,
			},
		},
	};
}

export function parseSchema(rawSchema: unknown): Record<string, unknown> {
	const parsed =
		typeof rawSchema === 'string' ? (JSON.parse(rawSchema) as unknown) : rawSchema;

	if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
		throw new Error('JSON Schema must be a JSON object');
	}

	return parsed as Record<string, unknown>;
}
