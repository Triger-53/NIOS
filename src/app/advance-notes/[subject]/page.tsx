import { promises as fs } from "fs"
import path from "path"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-server"
import { Profile } from "@/types"
import PurchaseButton from "@/components/PurchaseButton"

type PageProps = {
	params: Promise<{
		subject: string
	}>
}

export default async function SubjectPage({ params }: PageProps) {
	const supabase = createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	const { data: profile } = await supabase
		.from("profiles")
		.select("*")
		.eq("id", user!.id)
		.single<Profile>()

	if (user && profile && profile.plan !== "advanced" && profile.plan !== "premium") {
		return (
			<main className="min-h-screen p-8 flex flex-col items-center justify-center">
				<h1 className="text-3xl font-bold mb-4">Get Access to Advance Notes</h1>
				<p className="mb-8">
					You need to purchase the Advanced Plan to view this content.
				</p>
				<PurchaseButton
					plan="advanced"
					amount={parseInt(process.env.ADVANCE_PLAN_PRICE || "49900")}
					userId={user.id}
				/>
			</main>
		);
	}

	const { subject } = await params
	const subjectName = decodeURIComponent(subject)
	const contentPath = path.join(
		process.cwd(),
		"Content",
		"Advanced",
		subjectName
	)

	const items = await fs.readdir(contentPath)
	const chapters = items.filter(item => item.endsWith(".md"))
	const mindMapPath = `/mind-maps/${subjectName}.png`

	return (
		<main className="min-h-screen p-8">
			<h1 className="text-3xl font-bold mb-4">{subjectName}</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{chapters.map(chapter => (
					<Link
						href={`/advance-notes/${subject}/${encodeURIComponent(chapter)}`}
						key={chapter}
					>
						<Button className="w-full">{chapter.replace(".md", "")}</Button>
					</Link>
				))}
			</div>
			<div className="mt-8">
				<a href={mindMapPath} target="_blank" rel="noopener noreferrer">
					<Button variant="outline">View Mind Map</Button>
				</a>
			</div>
		</main>
	)
}