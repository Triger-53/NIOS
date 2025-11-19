
import { NextRequest, NextResponse } from "next/server"
import { TextToSpeechClient } from "@google-cloud/text-to-speech"

export const dynamic = "force-dynamic"

// --- Main POST Handler ---
export async function POST(req: NextRequest) {
	try {
		// 1. Basic checks
		if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
			return NextResponse.json(
				{
					error:
						"Server configuration error: GOOGLE_APPLICATION_CREDENTIALS is not set.",
				},
				{ status: 500 }
			)
		}

		const { text } = await req.json()
		if (!text) {
			return NextResponse.json({ error: "Text is required." }, { status: 400 })
		}

		// 2. Initialize the Text-to-Speech client
		const client = new TextToSpeechClient()

		// 3. Construct the request
		const request = {
			input: { text: text },
			voice: { languageCode: "en-US", ssmlGender: "NEUTRAL" },
			audioConfig: { audioEncoding: "MP3" },
		}

		// 4. Perform the text-to-speech request
		const [response] = await client.synthesizeSpeech(request)
		const audioContent = response.audioContent

		// 5. Return the audio content
		return new NextResponse(audioContent, {
			headers: {
				"Content-Type": "audio/mpeg",
			},
		})
	} catch (error) {
		console.error("[/api/text-to-speech] Error:", error)
		return NextResponse.json(
			{ error: "An unexpected error occurred during audio synthesis." },
			{ status: 500 }
		)
	}
}
