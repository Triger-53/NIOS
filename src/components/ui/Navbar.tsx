"use client"

import Link from "next/link"
import { Button } from "./button"
import { useState } from "react"

export default function Navbar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen)
	}

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false)
	}

	return (
		<header className="absolute top-0 left-0 w-full z-50">
			<nav className="container bg-gray-800/70 backdrop-blur-sm max-w-7xl mx-auto px-6 py-3 mt-4 rounded-full shadow-md border border-gray-700 flex justify-between items-center">
				<Link href="/" className="text-xl font-bold text-zinc-100">
					NIOS Class 10
				</Link>

				{/* Desktop Menu */}
				<div className="hidden md:flex gap-6 text-zinc-300 text-sm font-semibold items-center">
					<Link href="/" className="hover:text-zinc-100 transition-colors">Home</Link>
					<Link href="/subjects" className="hover:text-zinc-100 transition-colors">Subjects</Link>
					<Link href="/about" className="hover:text-zinc-100 transition-colors">About</Link>
					<Link href="/contact" className="hover:text-zinc-100 transition-colors">Contact</Link>

					<Button asChild size="sm" className="rounded-full">
						<Link href="/login">Login</Link>
					</Button>
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
						<Link href="/about" className="hover:text-zinc-900 transition-colors" onClick={closeMobileMenu}>About</Link>
						<Link href="/contact" className="hover:text-zinc-900 transition-colors" onClick={closeMobileMenu}>Contact</Link>

						<Button asChild size="sm" className="rounded-full">
							<Link href="/login" onClick={closeMobileMenu}>Login</Link>
						</Button>
					</div>
				</div>
			)}
		</header>
	)
}