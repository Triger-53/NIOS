import { getServerSession } from "next-auth"
import authOptions from "@/lib/authOptions"
import { redirect } from "next/navigation"

export default async function PremiumPage() {
	const session = await getServerSession(authOptions)

	if (!session || session.user?.name !== "Premium User") {
		redirect("/login")
	}

	return (
		<main className="min-h-screen p-8">
			<h1 className="text-3xl font-bold mb-4">🎉 Premium Content</h1>
			<p className="mb-4">Welcome, {session.user?.name}!</p>
			<ul className="list-disc pl-6 text-lg space-y-2">
				<li>✅ AI-generated sample papers</li>
				<li>✅ Advanced notes</li>
				<li>✅ Early chapter access</li>
			</ul>
		</main>
	)
}
