import React, { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Brain, MessageSquare, Network, Cloud, Save, Upload, Download, Loader2, Zap } from 'lucide-react';
import { HuggingFaceClient } from '../lib/llm/HuggingFaceClient';
import { HolographicProcessor } from '../lib/holographic/HolographicProcessor';
import { P2PNetwork } from '../lib/p2p/P2PNetwork';

interface ChatInterfaceProps {
  isDarkMode: boolean;
}

export function ChatInterface({ isDarkMode }: ChatInterfaceProps) {
  const [processor] = useState(() => new HolographicProcessor());
  const [llmClient] = useState(() => new HuggingFaceClient());
  const [p2pNetwork] = useState(() => new P2PNetwork());
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [networkStatus, setNetworkStatus] = useState('disconnected');
  const [connectedPeers, setConnectedPeers] = useState(0);
  const [processingMetrics, setProcessingMetrics] = useState({
    coherence: 0,
    entanglement: 0,
    efficiency: 0
  });

  useEffect(() => {
    const storedKey = localStorage.getItem('hf_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      llmClient.setToken(storedKey);
    }

    // Set up P2P network listeners
    p2pNetwork.onNetworkStatus((status) => {
      setNetworkStatus(status);
    });

    p2pNetwork.onPeerJoin(() => {
      setConnectedPeers(prev => prev + 1);
    });

    p2pNetwork.onPeerLeave(() => {
      setConnectedPeers(prev => Math.max(0, prev - 1));
    });

    return () => {
      processor.dispose();
      p2pNetwork.disconnect();
    };
  }, [processor, p2pNetwork, llmClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Process input through quantum holographic network
      const result = await processor.processText(input);
      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }
      setProgress(50);

      // Update processing metrics
      setProcessingMetrics({
        coherence: result.data?.coherence || 0,
        entanglement: result.data?.entanglement || 0,
        efficiency: result.data?.efficiency || 0
      });

      // Generate response using LLM if API key is available
      let generatedResponse;
      if (apiKey) {
        generatedResponse = await llmClient.generateText(input, JSON.stringify(result.data));
      } else {
        generatedResponse = processor.generateResponse(input);
      }

      // Distribute through P2P network if connected
      if (networkStatus === 'connected') {
        await p2pNetwork.broadcastMessage({
          type: 'response',
          data: generatedResponse,
          timestamp: Date.now()
        });
      }

      setResponse(generatedResponse);
      setProgress(100);
    } catch (error) {
      console.error('Chat processing error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey) {
      localStorage.setItem('hf_api_key', apiKey);
      llmClient.setToken(apiKey);
      alert('API key saved successfully');
    }
  };

  const handleP2PConnect = async () => {
    try {
      await p2pNetwork.initializeNetwork();
      setNetworkStatus('connected');
    } catch (error) {
      setError('Failed to connect to P2P network');
    }
  };

  const handleSaveState = () => {
    const state = processor.saveState();
    const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum-state.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const state = JSON.parse(e.target?.result as string);
          await processor.loadState(state);
          setError(null);
        } catch (error) {
          setError('Failed to load state file');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className={`h-full flex flex-col ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Quantum Chat Interface
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={networkStatus === 'connected' ? 'default' : 'outline'}
              onClick={handleP2PConnect}
              disabled={networkStatus === 'connected'}
            >
              <Network className="w-4 h-4 mr-2" />
              {networkStatus === 'connected' ? `Connected (${connectedPeers} peers)` : 'Connect P2P'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 overflow-auto">
        {!apiKey && (
          <form onSubmit={handleApiKeySubmit} className="flex gap-2">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter HuggingFace API key..."
              className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}
            />
            <Button type="submit">
              <Cloud className="w-4 h-4 mr-2" />
              Save API Key
            </Button>
          </form>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {response && (
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <p className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Response:
            </p>
            <p>{response}</p>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Quantum Coherence</label>
            <Progress value={processingMetrics.coherence * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Entanglement</label>
            <Progress value={processingMetrics.entanglement * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Network Efficiency</label>
            <Progress value={processingMetrics.efficiency * 100} className="h-2" />
          </div>
        </div>

        {loading && (
          <Progress value={progress} className="w-full" />
        )}
        
        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your message..."
              className={isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}
              disabled={loading}
            />
            <Button 
              type="submit" 
              disabled={loading || !input.trim()}
              className={isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSaveState}>
              <Save className="w-4 h-4 mr-2" />
              Save State
            </Button>
            <Button variant="outline" onClick={() => document.getElementById('load-state')?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Load State
            </Button>
            <input
              id="load-state"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleLoadState}
            />
          </div>
          <Button variant="outline" disabled={!apiKey}>
            <Zap className="w-4 h-4 mr-2" />
            Train Network
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}