/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { modelsCommand } from './modelsCommand.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';
import { ModelProvider, ModelRegistry } from '@google/ai-cli-core';
import { SettingScope } from '../../config/settings.js';

describe('modelsCommand', () => {
  let mockContext: ReturnType<typeof createMockCommandContext>;
  let mockSettingsSetValue: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockContext = createMockCommandContext();
    mockSettingsSetValue = vi.fn();
    mockContext.services.settings.setValue = mockSettingsSetValue;
  });

  describe('list command', () => {
    it('should list all available models and providers', async () => {
      const result = await modelsCommand.action!(mockContext, 'list');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Available AI Models and Providers:'),
      });

      const content = (result as { content: string }).content;
      expect(content).toContain('Google Gemini');
      expect(content).toContain('OpenAI');
      expect(content).toContain('Anthropic Claude');
      expect(content).toContain('gemini-2.5-pro');
    });

    it('should work with empty args (defaults to list)', async () => {
      const result = await modelsCommand.action!(mockContext, '');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Available AI Models and Providers:'),
      });
    });

    it('should work with "ls" alias', async () => {
      const result = await modelsCommand.action!(mockContext, 'ls');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Available AI Models and Providers:'),
      });
    });
  });

  describe('set command', () => {
    it('should switch to a valid model', async () => {
      const result = await modelsCommand.action!(
        mockContext,
        'set openai gpt-4o',
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining(
          'Switched to GPT-4o (gpt-4o) from openai',
        ),
      });

      expect(mockSettingsSetValue).toHaveBeenCalledWith(
        SettingScope.User,
        'modelRegistry',
        expect.objectContaining({
          currentProvider: ModelProvider.OPENAI,
          currentModel: 'gpt-4o',
        }),
      );
    });

    it('should handle provider aliases', async () => {
      const result = await modelsCommand.action!(
        mockContext,
        'set claude claude-3-5-sonnet-20241022',
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Switched to Claude 3.5 Sonnet'),
      });
    });

    it('should show error for unknown provider', async () => {
      const result = await modelsCommand.action!(
        mockContext,
        'set unknown model',
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Unknown provider: unknown'),
      });
    });

    it('should show error for invalid model', async () => {
      const result = await modelsCommand.action!(
        mockContext,
        'set openai invalid-model',
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Invalid model: invalid-model'),
      });
    });

    it('should show usage when missing arguments', async () => {
      const result = await modelsCommand.action!(mockContext, 'set');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Usage: /models set'),
      });
    });

    it('should list models for provider when model is missing', async () => {
      const result = await modelsCommand.action!(mockContext, 'set openai');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining('Available models for openai:'),
      });
    });
  });

  describe('key command', () => {
    it('should set API key for provider', async () => {
      const result = await modelsCommand.action!(
        mockContext,
        'key openai sk-test-key-123',
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'API key configured for openai',
      });

      expect(mockSettingsSetValue).toHaveBeenCalledWith(
        SettingScope.User,
        'modelRegistry',
        expect.objectContaining({
          providers: expect.objectContaining({
            [ModelProvider.OPENAI]: expect.objectContaining({
              apiKey: 'sk-test-key-123',
            }),
          }),
        }),
      );
    });

    it('should handle multi-word API keys', async () => {
      const result = await modelsCommand.action!(
        mockContext,
        'key anthropic sk-ant-key with spaces',
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: 'API key configured for anthropic',
      });
    });

    it('should show error for unknown provider', async () => {
      const result = await modelsCommand.action!(
        mockContext,
        'key unknown sk-key',
      );

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Unknown provider: unknown'),
      });
    });

    it('should show usage when missing arguments', async () => {
      const result = await modelsCommand.action!(mockContext, 'key openai');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Usage: /models key'),
      });
    });
  });

  describe('current command', () => {
    it('should show current model information', async () => {
      const result = await modelsCommand.action!(mockContext, 'current');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining(
          'Current model: Gemini 2.5 Pro (gemini-2.5-pro) from Google Gemini',
        ),
      });
    });
  });

  describe('unknown command', () => {
    it('should show error for unknown subcommand', async () => {
      const result = await modelsCommand.action!(mockContext, 'unknown');

      expect(result).toEqual({
        type: 'message',
        messageType: 'error',
        content: expect.stringContaining('Unknown subcommand: unknown'),
      });
    });
  });

  describe('completion', () => {
    it('should complete subcommands', async () => {
      const completion = await modelsCommand.completion!(mockContext, 'l');
      expect(completion).toContain('list');
    });

    it('should complete providers for set command', async () => {
      const completion = await modelsCommand.completion!(mockContext, 'set o');
      expect(completion).toContain('openai');
    });

    it('should complete models for provider', async () => {
      const completion = await modelsCommand.completion!(
        mockContext,
        'set openai gpt',
      );
      expect(completion).toContain('gpt-4o');
    });

    it('should complete providers for key command', async () => {
      const completion = await modelsCommand.completion!(mockContext, 'key g');
      expect(completion).toContain('gemini');
    });
  });

  describe('with existing model registry', () => {
    beforeEach(() => {
      const existingRegistry = new ModelRegistry({
        currentProvider: ModelProvider.OPENAI,
        currentModel: 'gpt-4o',
      });
      existingRegistry.setProviderApiKey(ModelProvider.OPENAI, 'test-key');

      mockContext.services.settings.merged.modelRegistry =
        existingRegistry.toJSON();
    });

    it('should use existing registry data', async () => {
      const result = await modelsCommand.action!(mockContext, 'current');

      expect(result).toEqual({
        type: 'message',
        messageType: 'info',
        content: expect.stringContaining(
          'Current model: GPT-4o (gpt-4o) from OpenAI',
        ),
      });
    });
  });
});
