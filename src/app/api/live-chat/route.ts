import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI, Part } from "@google/generative-ai"

export const dynamic = "force-dynamic"

// --- Helper Function to convert stream to buffer ---
async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
	const reader = stream.getReader()
	const chunks: Uint8Array[] = []
	while (true) {
		const { done, value } = await reader.read()
		if (done) {
			break
		}
		chunks.push(value)
	}
	return Buffer.concat(chunks)
}

// --- Main POST Handler for Live Chat ---
export async function POST(req: NextRequest) {
	try {
		// 1. Basic checks and setup
		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json(
				{ error: "Server configuration error: GEMINI_API_KEY is not set." },
				{ status: 500 }
			)
		}

		const formData = await req.formData()
		const file = formData.get("file") as File
		const historyStr = formData.get("history") as string | null
		const summary = formData.get("summary") as string | null
		const history = historyStr ? JSON.parse(historyStr) : []

		if (!file) {
			return NextResponse.json({ error: "No audio file uploaded." }, { status: 400 })
		}

		// 2. Transcribe Audio to Text using Gemini
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
		const transcriptionModel = genAI.getGenerativeModel({
			model: "gemini-2.5-flash",
		})

		const audioBuffer = await streamToBuffer(file.stream())
		const audioPart: Part = {
			inlineData: {
				data: audioBuffer.toString("base64"),
				mimeType: file.type,
			},
		}

		const transcriptionPrompt =
			"Transcribe the speech from this audio file. Provide only the text of the transcription."
		const transcriptionResult = await transcriptionModel.generateContent([
			transcriptionPrompt,
			audioPart,
		])
		const transcribedText = transcriptionResult.response.text()

		const junkSubstrings = ["[no speech]", "[Music]", "[electric drill sound]", "[non-speech audio]", "[Non-speech audio]", "[No speech detected]"]
		if (
			!transcribedText.trim() ||
			junkSubstrings.some((sub) => transcribedText.includes(sub))
		) {
			return NextResponse.json(
				{
					error: "No meaningful speech detected. Please try again.",
					transcribedText: transcribedText,
				},
				{ status: 400 }
			)
		}

		// 3. Get Contextual Answer from RAG Pipeline
		const ragResponse = await fetch(
			new URL("/api/ask-teacher", req.nextUrl.origin),
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: req.headers.get("cookie") || "",
				},
				body: JSON.stringify({
					question: transcribedText,
					history: history,
					summary: summary,
				}),
			}
		)

		if (!ragResponse.ok) {
			const errorBody = await ragResponse.text()
			console.error("RAG API call failed:", errorBody)
			return NextResponse.json(
				{ error: "Failed to get an answer from the AI teacher." },
				{ status: 500 }
			)
		}

		const ragData = await ragResponse.json()
		const ragAnswerText = ragData.answer

		// 4. Generate Audio Response using Gemini Audio Dialog Model
		const audioDialogModel = genAI.getGenerativeModel({
			model: "gemini-2.5-flash-native-audio-dialog",
		})

		const result = await audioDialogModel.generateContent(
			`User query: ${transcribedText}\nExpected model response: ${ragAnswerText}`
		)
		const firstPart = result.response.candidates?.[0]?.content?.parts?.[0]
		const audioContent =
			firstPart && "audio" in firstPart ? firstPart.audio : undefined

		if (!audioContent) {
			return NextResponse.json(
				{
					error: "Failed to generate audio response.",
					transcribedText: transcribedText,
					textResponse: ragAnswerText,
				},
				{ status: 500 }
			)
		}

		// 5. Stream the audio response back to the client
		const headers = new Headers()
		headers.set("Content-Type", "audio/mpeg")
		headers.set("X-Transcribed-Text", encodeURIComponent(transcribedText))
		headers.set("X-Text-Response", encodeURIComponent(ragAnswerText))

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return new NextResponse(audioContent as any, { status: 200, headers })
	} catch (error: unknown) {
		console.error("[/api/live-chat] Error:", error)
		const errorMessage =
			error instanceof Error ? error.message : "An unknown error occurred"
		return NextResponse.json(
			{
				error: "An unexpected error occurred during the live chat.",
				details: errorMessage,
			},
			{ status: 500 }
		)
	}
}
