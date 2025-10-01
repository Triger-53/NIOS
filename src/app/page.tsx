"use client"

import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { subjects } from "@/lib/subjectList"

export default function HomePage() {
	const [user, setUser] = useState<User | null>(null)
	const supabase = createClient()

	useEffect(() => {
		const getUser = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			setUser(user)
		}

		getUser()

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(event, session) => {
				setUser(session?.user ?? null)
			}
		)

		return () => subscription.unsubscribe()
	}, [supabase.auth])

	return (
		<div className="min-h-screen bg-white p-6 md:p-12 text-gray-900">
			<section className="text-center max-w-4xl mx-auto mb-12">
				<h1 className="text-4xl md:text-5xl font-bold mb-4">
					Master NIOS Class 10 in 1 Day (English Medium)
				</h1>
				<p className="text-lg md:text-xl mb-6">
					Free notes, practice papers, and guides for all major subjects —
					powered by students, for students.
				</p>

				{/* ✅ Greet logged-in user */}
				{user && (
					<p className="text-md text-green-700 font-medium mb-4">
						👋 Welcome, {user.email}!
					</p>
				)}

				<div className="flex flex-wrap justify-center gap-4">
					<Button size="lg" asChild>
						<Link href="/subjects">📘 Start Learning</Link>
					</Button>

					{user ? (
						<>
							<Button size="lg" variant="outline" asChild>
								<Link href="/premium">⬆️ Upgrade to Premium</Link>
							</Button>
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

			<section className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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