"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
	const router = useRouter()
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const supabase = createClient()

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setLoading(true)
		setError("")

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			setError(error.message)
		} else {
			router.push("/")
		}
		setLoading(false)
	}

	return (
		<main className="max-w-md mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">🔐 Login</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="border p-2 w-full rounded"
						required
					/>
				</div>
				<div>
					<label htmlFor="password">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="border p-2 w-full rounded"
						required
					/>
				</div>
				<Button
					type="submit"
					className="w-full"
					disabled={loading}>
					{loading ? "Signing In..." : "Sign In"}
				</Button>
				{error && <p className="text-red-500">{error}</p>}
			</form>
			<div className="mt-4 text-center">
				<p className="text-sm text-gray-600">
					Don&apos;t have an account?{" "}
					<a href="/register" className="text-blue-600 hover:underline">
						Sign up
					</a>
				</p>
			</div>
		</main>
	)
}
