export const FILE_EXTENSION = 'json';
export const FILE_ENCODING = 'utf-8';
export const MIN_WORDS = 20;
export const MAX_LENGTH_WORD = 15;
export const MIN_LENGTH_WORD = 2;
export const SCHEMA = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
        },
        description: {
            type: 'string',
        },
        words: {
            type: 'array',
            items: { type: 'string' },
        },
    },
    additionalProperties: false,
    required: ['title', 'description', 'words'],
};
