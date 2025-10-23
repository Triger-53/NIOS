import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllSubjects } from "@/lib/loadSubjects"
import { createClient } from "@/lib/supabase-server"
import SignOut from "@/components/SignOut"

export const dynamic = "force-dynamic"

export default async function HomePage() {
	const subjects = getAllSubjects()
	const supabase = createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const { data: profile } = user
		? await supabase.from("profiles").select("*").eq("id", user.id).single()
		: { data: null }

	return (
		<div className="min-h-screen bg-white p-4 md:p-12 text-gray-900">
			<section className="text-center max-w-4xl mx-auto mb-12">
				<h1 className="text-3xl md:text-5xl font-bold mb-4">
					Master NIOS Class 10 in 1 Day (English Medium)
				</h1>
				<p className="text-md md:text-xl mb-6">
					Free notes, practice papers, and guides for all major subjects —
					powered by students, for students.
				</p>

				{profile && (
					<p className="text-md text-green-700 font-medium mb-4">
						👋 Welcome, {profile.username}!
					</p>
				)}

				<div className="flex flex-wrap justify-center gap-4">
					<Button size="lg" asChild>
						<Link href="/subjects">📘 Start Learning</Link>
					</Button>

					{user ? (
						<>
							{profile?.plan === "advanced" && (
								<Button size="lg" variant="outline" asChild>
									<Link href="/advance-notes">📗 My Advance Notes</Link>
								</Button>
							)}
							{profile?.plan === "premium" && (
								<Button size="lg" variant="outline" asChild>
									<Link href="/premium">🪙 My Premium Pass</Link>
								</Button>
							)}
							<SignOut />
						</>
					) : (
						<>
							<Button size="lg" variant="outline" asChild>
								<Link href="/advance-notes">📗 Get Advance Notes</Link>
							</Button>
							<Button size="lg" variant="outline" asChild>
								<Link href="/premium">🪙 Get Premium Pass</Link>
							</Button>
							<Button size="lg" variant="ghost" asChild>
								<Link href="/login">🔐 Login</Link>
							</Button>
						</>
					)}
				</div>
			</section>

			<section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
				{subjects.map((subj) => (
					<Card key={subj.slug} className="hover:shadow-xl transition">
						<CardContent className="p-6">
							<h2 className="text-xl font-semibold mb-2">{subj.title}</h2>
							<p className="text-sm text-gray-600 mb-4">{subj.description}</p>
							<Link
								className="text-blue-600 hover:underline text-sm"
								href={`/subjects/${subj.slug}`}>
								View Notes →
							</Link>
						</CardContent>
					</Card>
				))}
			</section>
		</div>
	)
}