/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ModelProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: ModelProvider;
  description?: string;
  contextWindow?: number;
  supportsStreaming?: boolean;
}

export interface ProviderConfig {
  name: string;
  provider: ModelProvider;
  apiKey?: string;
  baseUrl?: string;
  models: ModelInfo[];
}

export interface ModelRegistryData {
  currentProvider: ModelProvider;
  currentModel: string;
  providers: Record<ModelProvider, ProviderConfig>;
}

export class ModelRegistry {
  private data: ModelRegistryData;

  constructor(initialData?: Partial<ModelRegistryData>) {
    this.data = {
      currentProvider: ModelProvider.GEMINI,
      currentModel: 'gemini-2.5-pro',
      providers: {
        [ModelProvider.GEMINI]: {
          name: 'Google Gemini',
          provider: ModelProvider.GEMINI,
          models: [
            {
              id: 'gemini-2.5-pro',
              name: 'Gemini 2.5 Pro',
              provider: ModelProvider.GEMINI,
              description: "Google's most capable AI model",
              contextWindow: 1000000,
              supportsStreaming: true,
            },
            {
              id: 'gemini-2.5-flash',
              name: 'Gemini 2.5 Flash',
              provider: ModelProvider.GEMINI,
              description: 'Faster, more efficient Gemini model',
              contextWindow: 1000000,
              supportsStreaming: true,
            },
            {
              id: 'gemini-1.5-pro',
              name: 'Gemini 1.5 Pro',
              provider: ModelProvider.GEMINI,
              description: 'Previous generation Gemini Pro model',
              contextWindow: 2000000,
              supportsStreaming: true,
            },
          ],
        },
        [ModelProvider.OPENAI]: {
          name: 'OpenAI',
          provider: ModelProvider.OPENAI,
          models: [
            {
              id: 'gpt-4o',
              name: 'GPT-4o',
              provider: ModelProvider.OPENAI,
              description: "OpenAI's most advanced multimodal model",
              contextWindow: 128000,
              supportsStreaming: true,
            },
            {
              id: 'gpt-4o-mini',
              name: 'GPT-4o mini',
              provider: ModelProvider.OPENAI,
              description: 'Faster, cost-effective GPT-4o model',
              contextWindow: 128000,
              supportsStreaming: true,
            },
            {
              id: 'gpt-4-turbo',
              name: 'GPT-4 Turbo',
              provider: ModelProvider.OPENAI,
              description: 'Enhanced GPT-4 with improved performance',
              contextWindow: 128000,
              supportsStreaming: true,
            },
          ],
        },
        [ModelProvider.ANTHROPIC]: {
          name: 'Anthropic Claude',
          provider: ModelProvider.ANTHROPIC,
          models: [
            {
              id: 'claude-3-5-sonnet-20241022',
              name: 'Claude 3.5 Sonnet',
              provider: ModelProvider.ANTHROPIC,
              description: "Anthropic's most intelligent model",
              contextWindow: 200000,
              supportsStreaming: true,
            },
            {
              id: 'claude-3-5-haiku-20241022',
              name: 'Claude 3.5 Haiku',
              provider: ModelProvider.ANTHROPIC,
              description: 'Fast and capable Claude model',
              contextWindow: 200000,
              supportsStreaming: true,
            },
            {
              id: 'claude-3-opus-20240229',
              name: 'Claude 3 Opus',
              provider: ModelProvider.ANTHROPIC,
              description: "Anthropic's most powerful model",
              contextWindow: 200000,
              supportsStreaming: true,
            },
          ],
        },
      },
      ...initialData,
    };
  }

  getCurrentProvider(): ModelProvider {
    return this.data.currentProvider;
  }

  getCurrentModel(): string {
    return this.data.currentModel;
  }

  getCurrentModelInfo(): ModelInfo | undefined {
    const provider = this.data.providers[this.data.currentProvider];
    return provider?.models.find((m) => m.id === this.data.currentModel);
  }

  getProviders(): ProviderConfig[] {
    return Object.values(this.data.providers);
  }

  getProvider(provider: ModelProvider): ProviderConfig | undefined {
    return this.data.providers[provider];
  }

  getModelsForProvider(provider: ModelProvider): ModelInfo[] {
    return this.data.providers[provider]?.models || [];
  }

  getAllModels(): ModelInfo[] {
    return Object.values(this.data.providers).flatMap(
      (provider) => provider.models,
    );
  }

  setCurrentModel(provider: ModelProvider, modelId: string): boolean {
    const providerConfig = this.data.providers[provider];
    if (!providerConfig) {
      return false;
    }

    const model = providerConfig.models.find((m) => m.id === modelId);
    if (!model) {
      return false;
    }

    this.data.currentProvider = provider;
    this.data.currentModel = modelId;
    return true;
  }

  setProviderApiKey(provider: ModelProvider, apiKey: string): boolean {
    const providerConfig = this.data.providers[provider];
    if (!providerConfig) {
      return false;
    }

    providerConfig.apiKey = apiKey;
    return true;
  }

  getProviderApiKey(provider: ModelProvider): string | undefined {
    return this.data.providers[provider]?.apiKey;
  }

  hasValidApiKey(provider: ModelProvider): boolean {
    const apiKey = this.getProviderApiKey(provider);
    return !!apiKey && apiKey.trim().length > 0;
  }

  toJSON(): ModelRegistryData {
    return JSON.parse(JSON.stringify(this.data));
  }

  static fromJSON(data: Partial<ModelRegistryData>): ModelRegistry {
    return new ModelRegistry(data);
  }
}
