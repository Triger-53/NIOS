"use client"

import Link from "next/link"
import { Button } from "./button"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase-client"
import { User } from "@supabase/supabase-js"
import SignOut from "../SignOut"
import { Profile } from "@/types"

export default function Navbar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
	const [user, setUser] = useState<User | null>(null)
	const [profile, setProfile] = useState<Profile | null>(null)
	const supabase = createClient()

	useEffect(() => {
		const fetchUser = async () => {
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
		}

		fetchUser()

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null)
			if (session?.user) {
				fetchUser()
			} else {
				setProfile(null)
			}
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [supabase])

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen)
	}

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false)
	}

	const showAdvanceNotesLink = profile?.plan === "advanced" || profile?.plan === "premium"

	return (
		<header className="sticky top-0 w-full z-50">
			<nav className="container bg-white/80 backdrop-blur-sm max-w-7xl mx-auto px-6 py-3 mt-3 rounded-full shadow-md border flex justify-between items-center">
				<Link href="/" className="text-xl font-bold text-zinc-900">
					NIOS Class 10
				</Link>

				{/* Desktop Menu */}
				<div className="hidden md:flex gap-6 text-zinc-700 text-sm font-semibold items-center">
					<Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
					<Link href="/subjects" className="hover:text-zinc-900 transition-colors">Subjects</Link>
					{showAdvanceNotesLink && (
						<Link href="/advance-notes" className="hover:text-zinc-900 transition-colors">Advance Notes</Link>
					)}
					<Link href="/premium" className="hover:text-zinc-900 transition-colors">Premium</Link>
					<Link href="/about" className="hover:text-zinc-900 transition-colors">About</Link>
					<Link href="/contact" className="hover:text-zinc-900 transition-colors">Contact</Link>
					
					{user ? (
						<SignOut />
					) : (
						<Button asChild size="sm" className="rounded-full">
							<Link href="/login">Login</Link>
						</Button>
					)}
				</div>

				{/* Mobile Menu Button */}
				<div className="md:hidden">
					<Button size="sm" onClick={toggleMobileMenu} className="rounded-full">
						{isMobileMenuOpen ? (
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						) : (
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
							</svg>
						)}
					</Button>
				</div>
			</nav>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden mt-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border p-4">
					<div className="flex flex-col gap-4 text-zinc-700 text-sm font-semibold">
						<Link href="/" className="hover:text-zinc-900 transition-colors" onClick={closeMobileMenu}>Home</Link>
						<Link href="/subjects" className="hover:text-zinc-900 transition-colors" onClick={closeMobileMenu}>Subjects</Link>
						{showAdvanceNotesLink && (
							<Link href="/advance-notes" className="hover:text-zinc-900 transition-colors" onClick={closeMobileMenu}>Advance Notes</Link>
						)}
						<Link href="/premium" className="hover:text-zinc-900 transition-colors" onClick={closeMobileMenu}>Premium</Link>
						<Link href="/about" className="hover:text-zinc-900 transition-colors" onClick={closeMobileMenu}>About</Link>
						<Link href="/contact" className="hover:text-zinc-900 transition-colors" onClick={closeMobileMenu}>Contact</Link>

						{user ? (
							<SignOut />
						) : (
							<Button asChild size="sm" className="rounded-full">
								<Link href="/login" onClick={closeMobileMenu}>Login</Link>
							</Button>
						)}
					</div>
				</div>
			)}
		</header>
	)
}
