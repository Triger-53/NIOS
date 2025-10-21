"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"

export default function Register() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [plan, setPlan] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [username, setUsername] = useState("")
	const [status, setStatus] = useState("")
	const [loading, setLoading] = useState(false)
	const supabase = createClient()

	useEffect(() => {
		const planFromParams = searchParams.get("plan")
		if (planFromParams) {
			setPlan(planFromParams)
		}
	}, [searchParams])

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setStatus("")

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					username,
					plan,
				},
			},
		})

		if (error) {
			setStatus(`Failed to register: ${error.message}`)
		} else {
			setStatus("Account created! Please check your email to confirm your account.")
			setTimeout(() => router.push("/login"), 2000)
		}
		setLoading(false)
	}

	return (
		<main className="max-w-md mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">Create Your Account</h1>
			<form onSubmit={handleRegister} className="space-y-4">
				<input
					type="text"
					placeholder="Username"
					required
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					className="w-full border p-2 rounded"
				/>
				<input
					type="email"
					placeholder="Email"
					required
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					className="w-full border p-2 rounded"
				/>
				<input
					type="password"
					placeholder="Password"
					required
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="w-full border p-2 rounded"
				/>
				<Button 
					type="submit" 
					className="w-full"
					disabled={loading}>
					{loading ? "Creating Account..." : "Register"}
				</Button>
				{status && (
					<p className={`text-sm ${status.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
						{status}
					</p>
				)}
			</form>
			<div className="mt-4 text-center">
				<p className="text-sm text-gray-600">
					Already have an account?{" "}
					<a href="/login" className="text-blue-600 hover:underline">
						Sign in
					</a>
				</p>
			</div>
		</main>
	)
}
