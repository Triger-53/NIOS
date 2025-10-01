"use client"

import Link from "next/link"
import { createClient } from "@/lib/supabase-client"
import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { Button } from "./button"

export default function Navbar() {
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

	const handleSignOut = async () => {
		await supabase.auth.signOut()
	}

	return (
		<header className="bg-white border-b shadow-sm sticky top-0 w-full z-50">
			<nav className="container mx-auto px-4 py-3 flex justify-between items-center">
				<Link href="/" className="text-xl font-bold text-gray-900">
					NIOS Class 10
				</Link>

				<div className="flex gap-6 text-gray-700 text-sm font-medium items-center">
					<Link href="/">Home</Link>
					<Link href="/subjects">Subjects</Link>
					<Link href="/about">About</Link>
					<Link href="/contact">Contact</Link>
					
					{user ? (
						<div className="flex items-center gap-2">
							<span className="text-sm text-gray-600">
								Welcome, {user.email}
							</span>
							<Button variant="outline" size="sm" onClick={handleSignOut}>
								Sign Out
							</Button>
						</div>
					) : (
						<Button asChild size="sm">
							<Link href="/login">Login</Link>
						</Button>
					)}
				</div>
			</nav>
		</header>
	)
}
