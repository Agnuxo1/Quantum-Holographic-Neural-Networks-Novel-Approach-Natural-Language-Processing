import { QuantumProcessor } from '../quantum/QuantumProcessor';
import { QuantumEnhancer } from '../quantum/QuantumEnhancer';
import { PhotonicProcessor } from '../optical/PhotonicProcessor';
import { Complex } from '../quantum/QuantumMath';

interface ProcessingResult {
  success: boolean;
  error?: string;
  data?: {
    tokens: number;
    coherence: number;
    entanglement: number;
    efficiency: number;
  };
}

interface ProcessorState {
  quantumState: {
    wavefunction: { real: number; imag: number }[];
    coherence: number;
    entanglement: number;
  };
  photonic: {
    interference: Float32Array;
    hologram: Float32Array;
  };
  metrics: {
    efficiency: number;
    processingPower: number;
  };
}

export class HolographicProcessor {
  private quantumProcessor: QuantumProcessor;
  private quantumEnhancer: QuantumEnhancer;
  private photonicProcessor: PhotonicProcessor;
  private processingQueue: string[];
  private isProcessing: boolean;
  private lastError: Error | null;

  constructor() {
    this.quantumProcessor = new QuantumProcessor();
    this.quantumEnhancer = new QuantumEnhancer();
    this.photonicProcessor = new PhotonicProcessor();
    this.processingQueue = [];
    this.isProcessing = false;
    this.lastError = null;
  }

  public async processText(text: string): Promise<ProcessingResult> {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: Text is required and must be a string');
      }

      // Add to processing queue
      this.processingQueue.push(text);
      
      // Process if not already processing
      if (!this.isProcessing) {
        await this.processQueue();
      }

      const quantumMetrics = this.quantumProcessor.getQuantumMetrics();
      const enhancerMetrics = this.quantumEnhancer.getQuantumMetrics();
      const photonicMetrics = this.photonicProcessor.getPhotonMetrics();

      return {
        success: true,
        data: {
          tokens: text.split(/\s+/).length,
          coherence: quantumMetrics.coherenceLength,
          entanglement: enhancerMetrics.entanglement,
          efficiency: photonicMetrics.hologramFidelity
        }
      };
    } catch (error) {
      this.lastError = error as Error;
      console.error('Processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error occurred'
      };
    }
  }

  public saveState(): ProcessorState {
    try {
      const quantumMetrics = this.quantumProcessor.getQuantumMetrics();
      const photonicMetrics = this.photonicProcessor.getPhotonMetrics();

      return {
        quantumState: {
          wavefunction: this.quantumProcessor.getCurrentWavefunction().map(complex => ({
            real: complex.real,
            imag: complex.imag
          })),
          coherence: quantumMetrics.coherenceLength,
          entanglement: quantumMetrics.entanglementDegree
        },
        photonic: {
          interference: this.photonicProcessor.getInterferencePattern(),
          hologram: this.photonicProcessor.getHologramPlate()
        },
        metrics: {
          efficiency: photonicMetrics.hologramFidelity,
          processingPower: quantumMetrics.processingSpeed
        }
      };
    } catch (error) {
      this.lastError = error as Error;
      throw new Error('Failed to save processor state: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  public async loadState(state: ProcessorState): Promise<void> {
    try {
      // Reconstruct quantum state
      const wavefunction = state.quantumState.wavefunction.map(
        w => new Complex(w.real, w.imag)
      );
      await this.quantumProcessor.setWavefunction(wavefunction);

      // Restore photonic state
      this.photonicProcessor.setInterferencePattern(state.photonic.interference);
      this.photonicProcessor.setHologramPlate(state.photonic.hologram);

      // Update metrics
      this.updateProcessingMetrics(state.metrics);
    } catch (error) {
      this.lastError = error as Error;
      throw new Error('Failed to load processor state: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.processingQueue.length > 0) {
        const text = this.processingQueue[0];
        
        // Convert text to quantum data
        const quantumData = new Float32Array(text.length);
        for (let i = 0; i < text.length; i++) {
          quantumData[i] = text.charCodeAt(i) / 255;
        }

        // Apply quantum processing pipeline
        const processedData = this.quantumProcessor.processQuantumState(quantumData);
        const enhancedData = this.quantumEnhancer.processPhotonic(processedData);
        
        // Update photonic state
        this.photonicProcessor.propagatePhotons(0.01);
        this.photonicProcessor.recordHologram(enhancedData);

        // Remove processed text from queue
        this.processingQueue.shift();

        // Small delay to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      this.lastError = error as Error;
      console.error('Queue processing error:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  public generateResponse(input: string): string {
    try {
      if (this.lastError) {
        return `Error processing input: ${this.lastError.message}`;
      }

      const quantumMetrics = this.quantumProcessor.getQuantumMetrics();
      const enhancerMetrics = this.quantumEnhancer.getQuantumMetrics();
      
      // Generate coherent response based on quantum state
      const words = input.split(/\s+/);
      const response = words.map(word => {
        const processedWord = this.processWord(word, quantumMetrics.coherenceLength);
        return processedWord;
      });

      return response.join(' ');
    } catch (error) {
      this.lastError = error as Error;
      console.error('Response generation error:', error);
      return 'I apologize, but I encountered an error processing your request.';
    }
  }

  private processWord(word: string, coherence: number): string {
    // Apply quantum coherence to word processing
    const processed = word.split('').map(char => {
      const quantum = Math.random() < coherence;
      return quantum ? char : char.toLowerCase();
    }).join('');

    return processed;
  }

  private updateProcessingMetrics(metrics: ProcessorState['metrics']): void {
    // Update internal metrics
    this.quantumProcessor.updateProcessingSpeed(metrics.processingPower);
    this.photonicProcessor.updateHologramFidelity(metrics.efficiency);
  }

  public getLastError(): Error | null {
    return this.lastError;
  }

  public clearError(): void {
    this.lastError = null;
  }

  public dispose(): void {
    this.processingQueue = [];
    this.isProcessing = false;
    this.lastError = null;
  }
}