import { useState, useRef, useCallback } from "react";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash-live";

type LiveStatus = "disconnected" | "connecting" | "connected" | "error";

interface UseLiveApiReturn {
  status: LiveStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  error: string | null;
}

export function useLiveApi({
  onTextReceived,
  onAudioReceived,
}: {
  onTextReceived?: (text: string, role: "user" | "assistant") => void;
  onAudioReceived?: (base64Audio: string) => void;
} = {}): UseLiveApiReturn {
  const [status, setStatus] = useState<LiveStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const disconnect = useCallback(() => {
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop Audio Context & Stream
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }

    setStatus("disconnected");
    setIsRecording(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleToolCall = async (toolCall: any) => {
    console.log("Tool Call Received:", toolCall);
    const functionCalls = toolCall.functionCalls;
    if (!functionCalls || functionCalls.length === 0) return;

    const responses = [];

    for (const call of functionCalls) {
      if (call.name === "ask_teacher") {
        const { query, history, summary } = call.args;
        try {
          const response = await fetch("/api/ask-teacher", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question: query,
                history: history || [],
                summary: summary || ""
            }),
          });
          const data = await response.json();

          responses.push({
            id: call.id,
            name: call.name,
            response: {
              result: data.answer,
              sources: data.sources
            },
          });

        } catch (err) {
          console.error("RAG Tool Error:", err);
          responses.push({
            id: call.id,
            name: call.name,
            response: { error: "Failed to fetch answer" },
          });
        }
      }
    }

    // Send Tool Response back to Gemini
    const toolResponseMsg = {
      tool_response: {
        function_responses: responses,
      },
    };
    wsRef.current?.send(JSON.stringify(toolResponseMsg));
  };

  // Define processMessage outside of useCallback so it can be used in connect
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processMessage = useCallback((data: any) => {
    // Handle Server Content
    if (data.serverContent) {
        const modelTurn = data.serverContent.modelTurn;
        if (modelTurn?.parts) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const part of modelTurn.parts as any[]) {
                if (part.text && onTextReceived) {
                    onTextReceived(part.text, "assistant");
                }
                if (part.inlineData && part.inlineData.mimeType.startsWith("audio/")) {
                    if (onAudioReceived) {
                        onAudioReceived(part.inlineData.data);
                    }
                }
            }
        }
    }
    // Handle Tool Use
    if (data.toolCall) {
        handleToolCall(data.toolCall);
    }
  }, [onTextReceived, onAudioReceived]);

  const connect = useCallback(async () => {
    if (!GEMINI_API_KEY) {
      setError("Missing NEXT_PUBLIC_GEMINI_API_KEY");
      return;
    }

    if (status === "connected" || status === "connecting") return;

    setStatus("connecting");
    setError(null);

    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket Connected");
        setStatus("connected");

        // Send Setup Message
        const setupMsg = {
          setup: {
            model: `models/${MODEL}`,
            tools: [
              {
                function_declarations: [
                  {
                    name: "ask_teacher",
                    description: "Use this tool to retrieve knowledge from the teacher's database (RAG) when you need to answer a student's question based on their study material.",
                    parameters: {
                      type: "OBJECT",
                      properties: {
                        query: { type: "STRING", description: "The student's question." },
                      },
                      required: ["query"],
                    },
                  },
                ],
              },
            ],
            generation_config: {
                response_modalities: ["AUDIO"]
            }
          },
        };
        ws.send(JSON.stringify(setupMsg));
      };

      ws.onmessage = async (event) => {
        // Handle Blob (Audio) or Text
        if (event.data instanceof Blob) {
            const text = await event.data.text();
            try {
                const data = JSON.parse(text);
                processMessage(data);
            } catch (e) {
                console.error("Failed to parse WS message", e);
            }
        } else {
             try {
                const data = JSON.parse(event.data);
                processMessage(data);
            } catch (e) {
                console.error("Failed to parse WS message", e);
            }
        }
      };

      ws.onerror = (e) => {
        console.error("WebSocket Error:", e);
        setError("Connection error");
        setStatus("error");
      };

      ws.onclose = () => {
        console.log("WebSocket Closed");
        if (status !== "error") setStatus("disconnected");
      };

    } catch (err) {
      console.error("Connection failed:", err);
      setError("Failed to connect");
      setStatus("error");
    }
  }, [status, processMessage]);

  // Audio Recording Logic (PCM 16kHz)
  const startRecording = useCallback(async () => {
    if (!wsRef.current || status !== "connected") {
      setError("Not connected");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const audioContext = new window.AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      inputSourceRef.current = source;

      // Create ScriptProcessor
      // Buffer size 2048 = ~128ms of audio at 16kHz
      const processor = audioContext.createScriptProcessor(2048, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
             // Clamp and scale
             const s = Math.max(-1, Math.min(1, inputData[i]));
             pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Base64 encode
        const buffer = pcmData.buffer;
        const base64 = arrayBufferToBase64(buffer);

        // Send to Gemini
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const msg = {
                realtime_input: {
                    media_chunks: [
                        {
                            mime_type: "audio/pcm",
                            data: base64
                        }
                    ]
                }
            };
            wsRef.current.send(JSON.stringify(msg));
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination); // Necessary for script processor to run

      setIsRecording(true);

    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone access denied");
    }
  }, [status]);

  const stopRecording = useCallback(() => {
    // Only stop the tracks, keep context if needed?
    // User asked to stop tracks to remove red icon.
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current = null;
    }
    if (inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        inputSourceRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setIsRecording(false);
  }, []);


  return {
    status,
    connect,
    disconnect,
    isRecording,
    startRecording,
    stopRecording,
    error
  };
}

// Helper
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
