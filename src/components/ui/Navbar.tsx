"use client"

import Link from "next/link"
import { Button } from "./button"

export default function Navbar() {
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
					
					<Button asChild size="sm">
						<Link href="/login">Login</Link>
					</Button>
				</div>
			</nav>
		</header>
	)
}