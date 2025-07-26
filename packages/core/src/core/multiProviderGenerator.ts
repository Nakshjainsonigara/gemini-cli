/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CountTokensResponse,
  GenerateContentResponse,
  GenerateContentParameters,
  CountTokensParameters,
  EmbedContentResponse,
  EmbedContentParameters,
} from '@google/genai';
import { ModelProvider } from '../config/model-registry.js';
import { ContentGenerator } from './contentGenerator.js';

/**
 * Configuration for creating multi-provider content generators
 */
export interface MultiProviderConfig {
  provider: ModelProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  proxy?: string;
}

/**
 * Abstract base class for provider-specific content generators
 */
export abstract class ProviderContentGenerator implements ContentGenerator {
  constructor(protected config: MultiProviderConfig) {}

  abstract generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse>;

  abstract generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>>;

  abstract countTokens(
    request: CountTokensParameters,
  ): Promise<CountTokensResponse>;

  abstract embedContent(
    request: EmbedContentParameters,
  ): Promise<EmbedContentResponse>;
}

/**
 * OpenAI provider content generator
 */
export class OpenAIContentGenerator extends ProviderContentGenerator {
  async generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse> {
    // For now, throw an error indicating this is not yet implemented
    // In a real implementation, this would call OpenAI's API
    throw new Error(
      'OpenAI provider is not yet implemented. Please use Gemini provider for now.',
    );
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    // For now, throw an error indicating this is not yet implemented
    throw new Error(
      'OpenAI provider is not yet implemented. Please use Gemini provider for now.',
    );
  }

  async countTokens(
    request: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    // For now, throw an error indicating this is not yet implemented
    throw new Error(
      'OpenAI provider is not yet implemented. Please use Gemini provider for now.',
    );
  }

  async embedContent(
    request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    // For now, throw an error indicating this is not yet implemented
    throw new Error(
      'OpenAI provider is not yet implemented. Please use Gemini provider for now.',
    );
  }
}

/**
 * Anthropic provider content generator
 */
export class AnthropicContentGenerator extends ProviderContentGenerator {
  async generateContent(
    request: GenerateContentParameters,
  ): Promise<GenerateContentResponse> {
    // For now, throw an error indicating this is not yet implemented
    // In a real implementation, this would call Anthropic's API
    throw new Error(
      'Anthropic provider is not yet implemented. Please use Gemini provider for now.',
    );
  }

  async generateContentStream(
    request: GenerateContentParameters,
  ): Promise<AsyncGenerator<GenerateContentResponse>> {
    // For now, throw an error indicating this is not yet implemented
    throw new Error(
      'Anthropic provider is not yet implemented. Please use Gemini provider for now.',
    );
  }

  async countTokens(
    request: CountTokensParameters,
  ): Promise<CountTokensResponse> {
    // For now, throw an error indicating this is not yet implemented
    throw new Error(
      'Anthropic provider is not yet implemented. Please use Gemini provider for now.',
    );
  }

  async embedContent(
    request: EmbedContentParameters,
  ): Promise<EmbedContentResponse> {
    // For now, throw an error indicating this is not yet implemented
    throw new Error(
      'Anthropic provider is not yet implemented. Please use Gemini provider for now.',
    );
  }
}

/**
 * Factory function to create provider-specific content generators
 */
export function createProviderContentGenerator(
  config: MultiProviderConfig,
): ProviderContentGenerator {
  switch (config.provider) {
    case ModelProvider.OPENAI:
      return new OpenAIContentGenerator(config);
    case ModelProvider.ANTHROPIC:
      return new AnthropicContentGenerator(config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}