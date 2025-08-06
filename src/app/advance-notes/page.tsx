import { getServerSession } from "next-auth"
import authOptions from "@/lib/authOptions"
import { redirect } from "next/navigation"

export default async function AdvanceNotesPage() {
	const session = await getServerSession(authOptions)

	if (!session || session.user?.name !== "Advance User") {
		redirect("/login")
	}

	return (
		<main className="min-h-screen p-8">
			<h1 className="text-3xl font-bold mb-4">📘 Advance Notes</h1>
			<p className="mb-4">Welcome, {session.user?.name}!</p>
			<ul className="list-disc pl-6 text-lg space-y-2">
				<li>📄 High-level summaries of each chapter</li>
				<li>🧠 Concept-focused notes</li>
				<li>📌 Designed for quick revisions</li>
			</ul>
		</main>
	)
}
