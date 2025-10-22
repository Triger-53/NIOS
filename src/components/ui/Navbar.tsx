"use client"

import Link from "next/link"
import { Button } from "./button"

export default function Navbar() {
	return (
		<header className="sticky top-0 w-full z-50">
			<nav className="container bg-white/80 backdrop-blur-sm max-w-7xl mx-auto px-6 py-3 mt-4 rounded-full shadow-md border flex justify-between items-center">
				<Link href="/" className="text-xl font-bold text-zinc-900">
					NIOS Class 10
				</Link>

				<div className="flex gap-6 text-zinc-700 text-sm font-semibold items-center">
					<Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
					<Link href="/subjects" className="hover:text-zinc-900 transition-colors">Subjects</Link>
					<Link href="/about" className="hover:text-zinc-900 transition-colors">About</Link>
					<Link href="/contact" className="hover:text-zinc-900 transition-colors">Contact</Link>
					
					<Button asChild size="sm" className="rounded-full">
						<Link href="/login">Login</Link>
					</Button>
				</div>
			</nav>
		</header>
	)
}