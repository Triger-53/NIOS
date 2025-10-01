"use client"

import { createClient } from "@/lib/supabase-client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

export default function PremiumPage() {
	const [user, setUser] = useState<User | null>(null)
	const [loading, setLoading] = useState(true)
	const supabase = createClient()
	const router = useRouter()

	useEffect(() => {
		const getUser = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			setUser(user)
			setLoading(false)
		}

		getUser()
	}, [supabase.auth])

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
		router.push("/login")
		return null
	}

	return (
		<main className="min-h-screen p-8">
			<h1 className="text-3xl font-bold mb-4">🎉 Premium Content</h1>
			<p className="mb-4">Welcome, {user.email}!</p>
			<ul className="list-disc pl-6 text-lg space-y-2">
				<li>✅ AI-generated sample papers</li>
				<li>✅ Advanced notes</li>
				<li>✅ Early chapter access</li>
			</ul>
		</main>
	)
}
