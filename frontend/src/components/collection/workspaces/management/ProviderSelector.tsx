'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApiKeysStore } from '@/zustand_stores/storeApiKeys';
import { ClassificationService } from '@/client/services';

interface Provider {
  name: string;
  models: string[];
}

interface ProviderSelectorProps {
  showModels?: boolean;
  className?: string;
}

export default function ProviderSelector({ showModels = true, className = '' }: ProviderSelectorProps) {
  const { 
    selectedProvider, 
    selectedModel, 
    setSelectedProvider, 
    setSelectedModel 
  } = useApiKeysStore();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await ClassificationService.getProviders();
        const providerList = response as Provider[];
        setProviders(providerList);
        
        // Set default provider and model if none selected
        if (!selectedProvider && providerList.length > 0) {
          const defaultProvider = providerList[0];
          setSelectedProvider(defaultProvider.name);
          if (defaultProvider.models.length > 0) {
            setSelectedModel(defaultProvider.models[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching providers:', error);
      }
    };

    fetchProviders();
  }, []);

  useEffect(() => {
    // Update available models when provider changes
    const provider = providers.find(p => p.name === selectedProvider);
    setAvailableModels(provider?.models || []);
  }, [selectedProvider, providers]);

  return (
    <div className={`flex flex-col md:flex-row gap-4 ${className}`}>
      <div className={showModels ? 'w-full md:w-1/2' : 'w-full'}>
        <Select value={selectedProvider || undefined} onValueChange={setSelectedProvider}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.name} value={provider.name}>
                {provider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {showModels && (
        <div className="w-full md:w-1/2">
          <Select value={selectedModel || undefined} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {availableModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}