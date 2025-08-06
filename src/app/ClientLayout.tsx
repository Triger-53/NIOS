"use client"

import { Geist, Geist_Mono } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import Navbar from "@/components/ui/Navbar"
import Footer from "@/components/ui/Footer"
import AdBanner from "@/components/ui/AdBanner"
import "./globals.css"

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
})

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
})

export default function ClientLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<body
			className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
			<Navbar />
			<AdBanner />
			<SessionProvider>{children}</SessionProvider>
			<Footer />
		</body>
	)
}
