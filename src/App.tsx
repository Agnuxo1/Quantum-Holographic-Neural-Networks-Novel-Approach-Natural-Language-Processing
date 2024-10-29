import React, { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { ChatInterface } from './components/ChatInterface';
import { EmergentOpticalScene } from './components/EmergentOpticalScene';
import { DocumentProcessor } from './components/DocumentProcessor';
import { Moon, Sun } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { Separator } from './components/ui/separator';
import { Progress } from './components/ui/progress';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [processingPower, setProcessingPower] = useState(0);
  const [networkEfficiency, setNetworkEfficiency] = useState(0);
  const [quantumCoherence, setQuantumCoherence] = useState(0);

  const handleDocumentProcessed = useCallback(({ tokens, coherence }: { tokens: number; coherence: number }) => {
    setProcessingPower(prev => Math.min(10, prev + tokens / 1000));
    setQuantumCoherence(coherence);
    setNetworkEfficiency(prev => Math.min(1, prev + 0.1));
  }, []);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50"
        onClick={() => setIsDarkMode(!isDarkMode)}
      >
        {isDarkMode ? (
          <Sun className="h-5 w-5 text-yellow-500" />
        ) : (
          <Moon className="h-5 w-5 text-slate-700" />
        )}
      </Button>

      <div className="w-1/2 flex flex-col p-4">
        <ChatInterface isDarkMode={isDarkMode} />
        
        <Card className={`mt-4 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
          <CardContent className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing Power</span>
                  <span>{processingPower.toFixed(1)} TFLOPS</span>
                </div>
                <Progress value={processingPower * 10} className="h-2" />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Network Efficiency</span>
                  <span>{(networkEfficiency * 100).toFixed(1)}%</span>
                </div>
                <Progress value={networkEfficiency * 100} className="h-2" />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Quantum Coherence</span>
                  <span>{(quantumCoherence * 100).toFixed(1)}%</span>
                </div>
                <Progress value={quantumCoherence * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <DocumentProcessor 
          isDarkMode={isDarkMode}
          onProcessComplete={handleDocumentProcessed}
        />
      </div>

      <div className="w-1/2 relative">
        <Canvas>
          <EmergentOpticalScene />
        </Canvas>
      </div>
    </div>
  );
}

export default App;