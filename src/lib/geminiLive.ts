import { GoogleGenAI, LiveServerMessage, Modality, Tool, Type } from '@google/genai';
import { ConnectionState, DEFAULT_AUDIO_CONFIG } from '@/types/live-types';
import { decodeAudioData, pcmToGeminiBlob } from '@/lib/audioUtils';

type LogCallback = (role: 'user' | 'model' | 'system', text: string) => void;
type StatusCallback = (status: ConnectionState) => void;
type VolumeCallback = (volume: number) => void;

// Define LiveSession type from the return type of connect method
type LiveSession = Awaited<ReturnType<GoogleGenAI['live']['connect']>>;

export class GeminiLiveClient {
  private ai: GoogleGenAI;
  private session: LiveSession | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private inputAnalyser: AnalyserNode | null = null;
  private outputAnalyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;


  private nextStartTime: number = 0;
  private sources: Set<AudioBufferSourceNode> = new Set();
  private logCallback: LogCallback;
  private statusCallback: StatusCallback;
  private volumeCallback: VolumeCallback;
  private volumeAnimationId: number | null = null;

  // Transcription state
  private currentInputTranscription = '';
  private currentOutputTranscription = '';

  constructor(logCallback: LogCallback, statusCallback: StatusCallback, volumeCallback: VolumeCallback) {
    this.logCallback = logCallback;
    this.statusCallback = statusCallback;
    this.volumeCallback = volumeCallback;

    // Initialize GoogleGenAI with NEXT_PUBLIC_ key for client-side use
    this.ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
  }

  async connect(_videoStream: MediaStream | null = null, context: string = '') {
    try {
      this.statusCallback(ConnectionState.CONNECTING);

      // Initialize Audio Contexts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioContext = new AudioContextClass({
        sampleRate: DEFAULT_AUDIO_CONFIG.inputSampleRate
      });
      this.outputAudioContext = new AudioContextClass({
        sampleRate: DEFAULT_AUDIO_CONFIG.outputSampleRate
      });

      // Setup Output Analyser for AI voice visualization
      this.outputAnalyser = this.outputAudioContext.createAnalyser();
      this.outputAnalyser.fftSize = 256;
      this.outputAnalyser.smoothingTimeConstant = 0.1;
      this.outputAnalyser.connect(this.outputAudioContext.destination);

      // Get Audio Stream
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.micStream = audioStream;  // <-- save mic stream for cleanup

      // Define the Tool
      const searchBooksTool: Tool = {
        functionDeclarations: [{
          name: "search_books",
          description: "Searches NIOS text books for relevant information to answer student questions. Use this tool when the user asks an educational question or about specific topics.",
          parameters: {
            type: Type.OBJECT,
            properties: {
              query: {
                type: Type.STRING,
                description: "The search query based on the user's question."
              }
            },
            required: ["query"]
          }
        }]
      };

      let finalSystemInstruction = `You are a helpful, witty, and concise AI NIOS teacher. You can see and hear the student.

CRITICAL INSTRUCTIONS:
1.  **Intent Classification**:
    *   If the user engages in **small talk** (greetings, "how are you"), respond naturally and conversationally.
    *   If the user asks about **previous conversation** context, answer based on your memory of the chat.
    *   If the user asks an **educational question** or a question requiring knowledge of the curriculum/books, you **MUST** use the 'search_books' tool.
2.  **Tool Usage**:
    *   Call 'search_books' with a specific query.
    *   If the tool returns results, use them to answer the question.
    *   If the tool returns **no relevant results** or empty results, politely inform the user that the information is not available in the NIOS books you have access to. **DO NOT HALLUCINATE** an answer if it's not in the books.
3.  **Language Rules**:
    *   If the user speaks English, respond in English.
    *   If the user speaks Hindi, respond in Hindi (Devanagari script).
    *   If the user speaks Hinglish, match the dominant language.
4.  **Tone**: Be encouraging, patient, and like a real teacher.

If the user speaks another language, politely inform them in English and Hindi that you only support these two languages.`;

      if (context) {
        finalSystemInstruction += `\n\nHere is the context of the recent text chat conversation the user was having before calling you. Use this to answer questions about what you were just talking about:\n${context}`;
      }

      // Connect to Gemini Live
      const sessionPromise = this.ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [searchBooksTool],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: finalSystemInstruction,
        },
        callbacks: {
          onopen: () => {
            this.statusCallback(ConnectionState.CONNECTED);
            this.logCallback('system', 'Connected to Live Teacher');

            // Start Audio Streaming and Analysis
            this.startAudioStream(audioStream, sessionPromise);
            this.startVolumeAnalysis();
          },
          onmessage: async (message: LiveServerMessage) => {
            this.handleMessage(message);
          },
          onclose: () => {
            this.statusCallback(ConnectionState.DISCONNECTED);
            this.logCallback('system', 'Session closed');
            this.stopVolumeAnalysis();
          },
          onerror: (error) => {
            console.error('Session error:', error);
            this.statusCallback(ConnectionState.ERROR);
            this.logCallback('system', 'Error encountered. Check console.');
            this.stopVolumeAnalysis();
          },
        },
      });

      this.session = await sessionPromise;

    } catch (error) {
      console.error('Connection failed:', error);
      this.statusCallback(ConnectionState.ERROR);
      this.logCallback('system', `Connection failed: ${error}`);
      this.stopVolumeAnalysis();
    }
  }

  private startAudioStream(stream: MediaStream, sessionPromise: Promise<LiveSession>) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.inputAnalyser = this.inputAudioContext.createAnalyser();
    this.inputAnalyser.fftSize = 256;
    this.inputAnalyser.smoothingTimeConstant = 0.1;

    this.processor = this.inputAudioContext.createScriptProcessor(DEFAULT_AUDIO_CONFIG.bufferSize, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = pcmToGeminiBlob(inputData, DEFAULT_AUDIO_CONFIG.inputSampleRate);
      sessionPromise.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    // Graph: Source -> Analyser -> Processor -> Destination (mute)
    this.inputSource.connect(this.inputAnalyser);
    this.inputAnalyser.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private startVolumeAnalysis() {
    const updateVolume = () => {
      let maxVolume = 0;

      // Check Input Volume
      if (this.inputAnalyser) {
        const dataArray = new Uint8Array(this.inputAnalyser.frequencyBinCount);
        this.inputAnalyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        maxVolume = Math.max(maxVolume, avg / 255);
      }

      // Check Output Volume
      if (this.outputAnalyser) {
        const dataArray = new Uint8Array(this.outputAnalyser.frequencyBinCount);
        this.outputAnalyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        // Boost output volume slightly for visuals as it can be quieter
        maxVolume = Math.max(maxVolume, (avg / 255) * 1.2);
      }

      this.volumeCallback(maxVolume);
      this.volumeAnimationId = requestAnimationFrame(updateVolume);
    };

    updateVolume();
  }

  private stopVolumeAnalysis() {
    if (this.volumeAnimationId !== null) {
      cancelAnimationFrame(this.volumeAnimationId);
      this.volumeAnimationId = null;
    }
    this.volumeCallback(0);
  }

  async sendVideoFrame(base64Image: string) {
    if (this.session) {
      await this.session.sendRealtimeInput({
        media: {
          mimeType: 'image/jpeg',
          data: base64Image
        }
      });
    }
  }

  private async handleMessage(message: LiveServerMessage) {
    if (message.serverContent?.outputTranscription) {
      this.currentOutputTranscription += message.serverContent.outputTranscription.text;
    } else if (message.serverContent?.inputTranscription) {
      this.currentInputTranscription += message.serverContent.inputTranscription.text;
    }

    if (message.serverContent?.turnComplete) {
      if (this.currentInputTranscription.trim()) {
        this.logCallback('user', this.currentInputTranscription);
      }
      if (this.currentOutputTranscription.trim()) {
        this.logCallback('model', this.currentOutputTranscription);
      }
      this.currentInputTranscription = '';
      this.currentOutputTranscription = '';
    }

    // Handle Tool Call
    if (message.toolCall) {
      const functionCalls = message.toolCall.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const responses = [];
        for (const call of functionCalls) {
          if (call.name === 'search_books') {
            const query = call.args ? call.args['query'] : '';
            this.logCallback('system', `Searching books for: ${query}`);
            try {
              const apiResponse = await fetch('/api/tools/search-books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
              });
              const data = await apiResponse.json();
              responses.push({
                name: 'search_books',
                id: call.id,
                response: { result: data.results }
              });
            } catch (e) {
              console.error('Tool execution error:', e);
              responses.push({
                name: 'search_books',
                id: call.id,
                response: { error: 'Failed to search books' }
              });
            }
          }
        }

        // Send tool response back to model
        if (this.session) {
          await this.session.sendToolResponse({ functionResponses: responses });
        }
      }
    }

    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (audioData && this.outputAudioContext) {
      if (this.outputAudioContext.state === 'suspended') {
        await this.outputAudioContext.resume();
      }

      const audioBuffer = await decodeAudioData(
        audioData,
        this.outputAudioContext,
        DEFAULT_AUDIO_CONFIG.outputSampleRate
      );

      this.playAudioBuffer(audioBuffer);
    }

    if (message.serverContent?.interrupted) {
      this.stopAllAudio();
      this.logCallback('system', 'Model interrupted');
    }
  }

  private playAudioBuffer(buffer: AudioBuffer) {
    if (!this.outputAudioContext || !this.outputAnalyser) return;

    const currentTime = this.outputAudioContext.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    const source = this.outputAudioContext.createBufferSource();
    source.buffer = buffer;

    // Route audio through analyser for visualization
    source.connect(this.outputAnalyser);
    // Analyser is already connected to destination in connect()

    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;

    this.sources.add(source);
    source.onended = () => {
      this.sources.delete(source);
    };
  }

  private stopAllAudio() {
    this.sources.forEach(source => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      try { source.stop(); } catch (_e) { }
    });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  disconnect() {
    this.stopVolumeAnalysis();

    if (this.session) {
      // Attempt to close the session if close method exists on the type
      // The current type definition might not expose close directly depending on SDK version
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      try { (this.session as any).close(); } catch (e) { console.warn(e); }
      this.session = null;
    }

    this.stopAllAudio();
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());   // <-- turns off mic
      this.micStream = null;
    }


    if (this.inputSource) this.inputSource.disconnect();
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
    }

    if (this.inputAudioContext) this.inputAudioContext.close();
    if (this.outputAudioContext) this.outputAudioContext.close();

    this.statusCallback(ConnectionState.DISCONNECTED);
    this.logCallback('system', 'Disconnected');
  }
}
