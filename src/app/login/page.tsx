"use client"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
	const router = useRouter()
	const [error, setError] = useState("")

	const handleSubmit = async (e: any) => {
		e.preventDefault()

		const res = await signIn("credentials", {
			redirect: false,
			username: e.target.username.value,
			password: e.target.password.value,
		})

		if (res?.ok) {
			const username = e.target.username.value
			if (username === "premium") {
				router.push("/premium")
			} else if (username === "advance") {
				router.push("/advance-notes")
			} else {
				router.push("/") // fallback
			}
		} else {
			setError("Invalid credentials")
		}
	}

	return (
		<main className="max-w-md mx-auto p-8">
			<h1 className="text-2xl font-bold mb-4">🔐 Login</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					name="username"
					placeholder="Username"
					className="border p-2 w-full"
				/>
				<input
					name="password"
					type="password"
					placeholder="Password"
					className="border p-2 w-full"
				/>
				<button
					type="submit"
					className="bg-blue-600 text-white px-4 py-2 w-full">
					Sign In
				</button>
				{error && <p className="text-red-500">{error}</p>}
			</form>
		</main>
	)
}
