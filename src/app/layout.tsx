import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Navbar from "@/components/ui/Navbar"
import Footer from "@/components/ui/Footer"
import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export const metadata: Metadata = {
	title: "NIOS Class 10 in 1 Day",
	description: "Master your NIOS course with free notes, fast!",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
     <link rel="icon" href="/logo.png" />
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
				<Navbar />
				<main className="flex-1">
					{children}
				</main>
				<Footer />
			</body>
		</html>
	)
}