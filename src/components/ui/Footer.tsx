"use client"

import Link from "next/link"

export default function Footer() {
	return (
		<footer className="bg-gray-100 border-t text-sm text-gray-700">
			<div className="container mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center">
				<p className="mb-2 md:mb-0">
					© {new Date().getFullYear()} Triger Studio — All rights reserved.
				</p>
				<div className="flex gap-4">
					<Link href="/" className="hover:underline">
						Home
					</Link>
					<Link href="/about" className="hover:underline">
						About
					</Link>
					<Link href="/contact" className="hover:underline">
						Contact
					</Link>
				</div>
			</div>
		</footer>
	)
}
