import { promises as fs } from "fs"
import path from "path"
import Link from "next/link"
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Profile } from "@/types"

const subjectMetadata: { [key: string]: { icon: string; desc: string } } = {
	Accountancy: {
		icon: "💼",
		desc: "Learn the fundamentals of financial and corporate accounting.",
	},
	"Business Studies": {
		icon: "📈",
		desc: "Explore the principles of business, management, and marketing.",
	},
	"Data Entry Oprations": {
		icon: "💻",
		desc: "Master the skills of data entry and computer operations.",
	},
	Economics: {
		icon: "💹",
		desc: "Understand the concepts of micro and macroeconomics.",
	},
	English: {
		icon: "📚",
		desc: "Improve your language skills with grammar and literature.",
	},
	Entrepreneurship: {
		icon: "🚀",
		desc: "Learn how to start and grow your own business.",
	},
}

export const dynamic = "force-dynamic"

export default async function AdvanceNotesPage() {
	const supabase = createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect("/register?plan=advanced")
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", user.id)
		.single<Profile>()

	if (profile && profile.plan !== "advanced" && profile.plan !== "premium") {
		redirect("/")
	}

	const contentPath = path.join(process.cwd(), "Content", "Advanced")
	const items = await fs.readdir(contentPath)
	const subjectPromises = items.map(async item => {
		try {
			const itemPath = path.join(contentPath, item)
			const stats = await fs.stat(itemPath)
			return stats.isDirectory() ? item : null
		} catch {
			return null
		}
	})
	const subjects = (await Promise.all(subjectPromises)).filter(
		(subject): subject is string => subject !== null
	)

	return (
		<main className="min-h-screen p-8">
			<h1 className="text-3xl font-bold mb-4">📘 Advance Notes</h1>
			{user && <p className="mb-8">Welcome, {user.email}!</p>}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{subjects.map(subject => (
					<Link
						href={`/advance-notes/${encodeURIComponent(subject)}`}
						key={subject}
					>
						<Card className="hover:shadow-lg transition-shadow duration-200">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									{subjectMetadata[subject]?.icon || "📄"} {subject}
								</CardTitle>
								<CardDescription>
									{subjectMetadata[subject]?.desc ||
										`In-depth notes for ${subject}`}
								</CardDescription>
							</CardHeader>
						</Card>
					</Link>
				))}
			</div>
		</main>
	)
}
