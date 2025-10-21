"use client"

import { createClient } from "@/lib/supabase-client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { Profile } from "@/types"

export default function AdvanceNotesPage() {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const [profile, setProfile] = useState<Profile | null>(null)
	const supabase = createClient()
	const router = useRouter()

	useEffect(() => {
		const getData = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			setUser(user)

			if (user) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("*")
					.eq("id", user.id)
					.single()
				setProfile(profile)
			}
			setLoading(false)
		}

		getData()
	}, [supabase.auth, supabase, router])

	if (loading) {
		return (
			<main className="min-h-screen p-8 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p>Loading...</p>
				</div>
			</main>
		)
	}

	if (!user) {
		router.push("/register?plan=advanced")
		return null
	}

	if (profile && profile.plan !== "advanced" && profile.plan !== "premium") {
		router.push("/")
		return null
	}

	return (
		<main className="min-h-screen p-8">
			<h1 className="text-3xl font-bold mb-4">📘 Advance Notes</h1>
			<p className="mb-4">Welcome, {user.email}!</p>
			<ul className="list-disc pl-6 text-lg space-y-2">
				<li>📄 High-level summaries of each chapter</li>
				<li>🧠 Concept-focused notes</li>
				<li>📌 Designed for quick revisions</li>
			</ul>
		</main>
	)
}
