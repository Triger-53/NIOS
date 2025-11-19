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

// --- Main POST Handler ---
export async function POST(req: NextRequest) {
	try {
		// 1. Basic checks
		if (!process.env.GEMINI_API_KEY) {
			return NextResponse.json(
				{ error: "Server configuration error: GEMINI_API_KEY is not set." },
				{ status: 500 }
			)
		}

		const formData = await req.formData()
		const file = formData.get("file") as File

		if (!file) {
			return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
		}

		// 2. Initialize Gemini AI Client
		const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
		const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

		// 3. Prepare the file for the model
		const fileBuffer = await streamToBuffer(file.stream())
		const filePart: Part = {
			inlineData: {
				data: fileBuffer.toString("base64"),
				mimeType: file.type,
			},
		}

		// 4. Generate content from the file
		const prompt =
			"Extract the text content from this file. If the file is an image, describe it. If it is a document, transcribe its text. If it is audio, transcribe the speech. Provide only the extracted text."
		const result = await model.generateContent([prompt, filePart])
		const extractedText = result.response.text()

		// 5. Return the extracted text
		return NextResponse.json({ text: extractedText })
	} catch (error) {
		console.error("[/api/process-media] Error:", error)
		return NextResponse.json(
			{ error: "An unexpected error occurred during file processing." },
			{ status: 500 }
		)
	}
}