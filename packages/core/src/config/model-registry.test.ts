/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from 'vitest';
import { ModelRegistry, ModelProvider } from './model-registry.js';

describe('ModelRegistry', () => {
  describe('initialization', () => {
    it('should initialize with default values', () => {
      const registry = new ModelRegistry();
      
      expect(registry.getCurrentProvider()).toBe(ModelProvider.GEMINI);
      expect(registry.getCurrentModel()).toBe('gemini-2.5-pro');
    });

    it('should initialize with custom data', () => {
      const customData = {
        currentProvider: ModelProvider.OPENAI,
        currentModel: 'gpt-4o',
      };
      
      const registry = new ModelRegistry(customData);
      
      expect(registry.getCurrentProvider()).toBe(ModelProvider.OPENAI);
      expect(registry.getCurrentModel()).toBe('gpt-4o');
    });
  });

  describe('provider management', () => {
    it('should return all providers', () => {
      const registry = new ModelRegistry();
      const providers = registry.getProviders();
      
      expect(providers).toHaveLength(3);
      expect(providers.map(p => p.provider)).toEqual([
        ModelProvider.GEMINI,
        ModelProvider.OPENAI,
        ModelProvider.ANTHROPIC,
      ]);
    });

    it('should return specific provider', () => {
      const registry = new ModelRegistry();
      const provider = registry.getProvider(ModelProvider.OPENAI);
      
      expect(provider).toBeDefined();
      expect(provider?.name).toBe('OpenAI');
      expect(provider?.provider).toBe(ModelProvider.OPENAI);
    });

    it('should return undefined for non-existent provider', () => {
      const registry = new ModelRegistry();
      const provider = registry.getProvider('invalid' as ModelProvider);
      
      expect(provider).toBeUndefined();
    });
  });

  describe('model management', () => {
    it('should return models for a specific provider', () => {
      const registry = new ModelRegistry();
      const models = registry.getModelsForProvider(ModelProvider.GEMINI);
      
      expect(models.length).toBeGreaterThan(0);
      expect(models[0].provider).toBe(ModelProvider.GEMINI);
    });

    it('should return all models from all providers', () => {
      const registry = new ModelRegistry();
      const allModels = registry.getAllModels();
      
      expect(allModels.length).toBeGreaterThan(6);
      const providerCount = new Set(allModels.map(m => m.provider)).size;
      expect(providerCount).toBe(3);
    });

    it('should get current model info', () => {
      const registry = new ModelRegistry();
      const modelInfo = registry.getCurrentModelInfo();
      
      expect(modelInfo).toBeDefined();
      expect(modelInfo?.id).toBe('gemini-2.5-pro');
      expect(modelInfo?.provider).toBe(ModelProvider.GEMINI);
    });

    it('should set current model successfully', () => {
      const registry = new ModelRegistry();
      const success = registry.setCurrentModel(ModelProvider.OPENAI, 'gpt-4o');
      
      expect(success).toBe(true);
      expect(registry.getCurrentProvider()).toBe(ModelProvider.OPENAI);
      expect(registry.getCurrentModel()).toBe('gpt-4o');
    });

    it('should fail to set invalid model', () => {
      const registry = new ModelRegistry();
      const success = registry.setCurrentModel(ModelProvider.OPENAI, 'invalid-model');
      
      expect(success).toBe(false);
      expect(registry.getCurrentProvider()).toBe(ModelProvider.GEMINI);
      expect(registry.getCurrentModel()).toBe('gemini-2.5-pro');
    });

    it('should fail to set model for invalid provider', () => {
      const registry = new ModelRegistry();
      const success = registry.setCurrentModel('invalid' as ModelProvider, 'gpt-4o');
      
      expect(success).toBe(false);
    });
  });

  describe('API key management', () => {
    it('should set and get API key for provider', () => {
      const registry = new ModelRegistry();
      const apiKey = 'test-api-key-123';
      
      const success = registry.setProviderApiKey(ModelProvider.OPENAI, apiKey);
      
      expect(success).toBe(true);
      expect(registry.getProviderApiKey(ModelProvider.OPENAI)).toBe(apiKey);
    });

    it('should fail to set API key for invalid provider', () => {
      const registry = new ModelRegistry();
      const success = registry.setProviderApiKey('invalid' as ModelProvider, 'key');
      
      expect(success).toBe(false);
    });

    it('should validate API key presence', () => {
      const registry = new ModelRegistry();
      
      expect(registry.hasValidApiKey(ModelProvider.OPENAI)).toBe(false);
      
      registry.setProviderApiKey(ModelProvider.OPENAI, 'test-key');
      expect(registry.hasValidApiKey(ModelProvider.OPENAI)).toBe(true);
      
      registry.setProviderApiKey(ModelProvider.OPENAI, '   ');
      expect(registry.hasValidApiKey(ModelProvider.OPENAI)).toBe(false);
    });
  });

  describe('serialization', () => {
    it('should serialize to JSON and restore from JSON', () => {
      const registry1 = new ModelRegistry();
      registry1.setCurrentModel(ModelProvider.ANTHROPIC, 'claude-3-5-sonnet-20241022');
      registry1.setProviderApiKey(ModelProvider.ANTHROPIC, 'test-key');
      
      const data = registry1.toJSON();
      const registry2 = ModelRegistry.fromJSON(data);
      
      expect(registry2.getCurrentProvider()).toBe(ModelProvider.ANTHROPIC);
      expect(registry2.getCurrentModel()).toBe('claude-3-5-sonnet-20241022');
      expect(registry2.getProviderApiKey(ModelProvider.ANTHROPIC)).toBe('test-key');
    });
  });
});