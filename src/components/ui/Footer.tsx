"use client"

import Link from "next/link"

export default function Footer() {
	return (
		<footer className="bg-gray-900/70 backdrop-blur-lg border-t border-gray-700 text-sm text-gray-400">
			<div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
				<p className="mb-2 md:mb-0">
					© {new Date().getFullYear()} Triger Studio — All rights reserved.
				</p>
				<div className="flex gap-4">
					<Link href="/" className="hover:text-white transition-colors">
						Home
					</Link>
					<Link href="/about" className="hover:text-white transition-colors">
						About
					</Link>
					<Link href="/contact" className="hover:text-white transition-colors">
						Contact
					</Link>
				</div>
			</div>
		</footer>
	)
}
