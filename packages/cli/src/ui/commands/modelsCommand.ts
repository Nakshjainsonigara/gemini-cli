/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SlashCommand,
  CommandContext,
  SlashCommandActionReturn,
  CommandKind,
  MessageActionReturn,
} from './types.js';
import { ModelRegistry, ModelProvider } from '@google/gemini-cli-core';
import { SettingScope } from '../../config/settings.js';

function formatModelsList(registry: ModelRegistry): string {
  const providers = registry.getProviders();
  const currentProvider = registry.getCurrentProvider();
  const currentModel = registry.getCurrentModel();

  const sections = providers
    .map((provider) => {
      const isCurrentProvider = provider.provider === currentProvider;
      const models = provider.models
        .map((model) => {
          const isCurrent = isCurrentProvider && model.id === currentModel;
          const indicator = isCurrent ? '→ ' : '  ';
          const name = `${indicator}${model.name} (${model.id})`;
          const description = model.description
            ? ` - ${model.description}`
            : '';
          return `${name}${description}`;
        })
        .join('\n');

      const providerHeader = `**${provider.name}**${isCurrentProvider ? ' (current)' : ''}`;
      const hasApiKey = registry.hasValidApiKey(provider.provider);
      const apiKeyStatus = hasApiKey
        ? '✓ API key configured'
        : '⚠ API key required';

      return `${providerHeader}\n${apiKeyStatus}\n${models}`;
    })
    .join('\n\n');

  return sections;
}

export const modelsCommand: SlashCommand = {
  name: 'models',
  altNames: ['model'],
  description:
    'Manage AI models and providers. Usage: /models [list|set|key]',
  kind: CommandKind.BUILT_IN,

  action: async (
    context: CommandContext,
    args: string,
  ): Promise<SlashCommandActionReturn> => {
    const parts = args.trim().split(/\s+/);
    const subCommand = parts[0]?.toLowerCase() || 'list';

    // Get or create model registry from settings
    const modelRegistryData = context.services.settings.merged.modelRegistry;
    const registry = modelRegistryData
      ? ModelRegistry.fromJSON(modelRegistryData)
      : new ModelRegistry();

    switch (subCommand) {
      case 'list':
      case 'ls': {
        return {
          type: 'message',
          messageType: 'info',
          content: `Available AI Models and Providers:\n\n${formatModelsList(registry)}`,
        } as MessageActionReturn;
      }

      case 'set': {
        if (parts.length < 2) {
          return {
            type: 'message',
            messageType: 'error',
            content:
              'Usage: /models set <provider> <model>\nExample: /models set openai gpt-4o',
          } as MessageActionReturn;
        }

        const providerName = parts[1].toLowerCase();
        const modelId = parts[2];

        let provider: ModelProvider;
        switch (providerName) {
          case 'gemini':
          case 'google': {
            provider = ModelProvider.GEMINI;
            break;
          }
          case 'openai':
          case 'gpt': {
            provider = ModelProvider.OPENAI;
            break;
          }
          case 'anthropic':
          case 'claude': {
            provider = ModelProvider.ANTHROPIC;
            break;
          }
          default: {
            return {
              type: 'message',
              messageType: 'error',
              content: `Unknown provider: ${providerName}\nAvailable providers: gemini, openai, anthropic`,
            } as MessageActionReturn;
          }
        }

        if (!modelId) {
          const models = registry.getModelsForProvider(provider);
          const modelList = models
            .map((m) => `  ${m.id} - ${m.name}`)
            .join('\n');
          return {
            type: 'message',
            messageType: 'info',
            content: `Available models for ${providerName}:\n${modelList}`,
          } as MessageActionReturn;
        }

        const success = registry.setCurrentModel(provider, modelId);
        if (!success) {
          return {
            type: 'message',
            messageType: 'error',
            content: `Invalid model: ${modelId} for provider ${providerName}`,
          } as MessageActionReturn;
        }

        // Save the updated registry to settings
        context.services.settings.setValue(
          SettingScope.User,
          'modelRegistry',
          registry.toJSON(),
        );

        const modelInfo = registry.getCurrentModelInfo();
        return {
          type: 'message',
          messageType: 'info',
          content: `Switched to ${modelInfo?.name} (${modelId}) from ${providerName}`,
        } as MessageActionReturn;
      }

      case 'key':
      case 'apikey': {
        if (parts.length < 3) {
          return {
            type: 'message',
            messageType: 'error',
            content:
              'Usage: /models key <provider> <api-key>\nExample: /models key openai sk-...',
          } as MessageActionReturn;
        }

        const keyProviderName = parts[1].toLowerCase();
        const apiKey = parts.slice(2).join(' ');

        let keyProvider: ModelProvider;
        switch (keyProviderName) {
          case 'gemini':
          case 'google': {
            keyProvider = ModelProvider.GEMINI;
            break;
          }
          case 'openai':
          case 'gpt': {
            keyProvider = ModelProvider.OPENAI;
            break;
          }
          case 'anthropic':
          case 'claude': {
            keyProvider = ModelProvider.ANTHROPIC;
            break;
          }
          default: {
            return {
              type: 'message',
              messageType: 'error',
              content: `Unknown provider: ${keyProviderName}\nAvailable providers: gemini, openai, anthropic`,
            } as MessageActionReturn;
          }
        }

        registry.setProviderApiKey(keyProvider, apiKey);
        context.services.settings.setValue(
          SettingScope.User,
          'modelRegistry',
          registry.toJSON(),
        );

        return {
          type: 'message',
          messageType: 'info',
          content: `API key configured for ${keyProviderName}`,
        } as MessageActionReturn;
      }

      case 'current': {
        const currentModelInfo = registry.getCurrentModelInfo();
        const currentProviderConfig = registry.getProvider(
          registry.getCurrentProvider(),
        );

        return {
          type: 'message',
          messageType: 'info',
          content: `Current model: ${currentModelInfo?.name} (${currentModelInfo?.id}) from ${currentProviderConfig?.name}`,
        } as MessageActionReturn;
      }

      default: {
        return {
          type: 'message',
          messageType: 'error',
          content: `Unknown subcommand: ${subCommand}\nAvailable commands: list, set, key, current`,
        } as MessageActionReturn;
      }
    }
  },

  completion: async (
    context: CommandContext,
    partialArg: string,
  ): Promise<string[]> => {
    const parts = partialArg.trim().split(/\s+/);

    if (parts.length <= 1) {
      return ['list', 'set', 'key', 'current'].filter((cmd) =>
        cmd.startsWith(parts[0] || ''),
      );
    }

    const subCommand = parts[0].toLowerCase();

    if (subCommand === 'set' && parts.length === 2) {
      return ['gemini', 'openai', 'anthropic'].filter((provider) =>
        provider.startsWith(parts[1] || ''),
      );
    }

    if (subCommand === 'set' && parts.length === 3) {
      const providerName = parts[1].toLowerCase();
      const modelRegistryData = context.services.settings.merged.modelRegistry;
      const registry = modelRegistryData
        ? ModelRegistry.fromJSON(modelRegistryData)
        : new ModelRegistry();

      let provider: ModelProvider;
      switch (providerName) {
        case 'gemini':
        case 'google': {
          provider = ModelProvider.GEMINI;
          break;
        }
        case 'openai':
        case 'gpt': {
          provider = ModelProvider.OPENAI;
          break;
        }
        case 'anthropic':
        case 'claude': {
          provider = ModelProvider.ANTHROPIC;
          break;
        }
        default: {
          return [];
        }
      }

      const models = registry.getModelsForProvider(provider);
      return models
        .map((m) => m.id)
        .filter((id) => id.startsWith(parts[2] || ''));
    }

    if (subCommand === 'key' && parts.length === 2) {
      return ['gemini', 'openai', 'anthropic'].filter((provider) =>
        provider.startsWith(parts[1] || ''),
      );
    }

    return [];
  },
};