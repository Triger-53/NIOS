import { promises as fs } from "fs"
import path from "path"
import matter from "gray-matter"
import ReactMarkdown from "react-markdown"
import "github-markdown-css/github-markdown.css"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { createClient } from "@/lib/supabase-server"
import { Profile } from "@/types"
import PurchaseButton from "@/components/PurchaseButton"

type PageProps = {
	params: Promise<{
		subject: string
		chapter: string
	}>
}

export default async function ChapterPage({ params }: PageProps) {
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

	const { subject, chapter } = await params
	const subjectName = decodeURIComponent(subject)
	const chapterName = decodeURIComponent(chapter)
	const filePath = path.join(
		process.cwd(),
		"Content",
		"Advanced",
		subjectName,
		chapterName
	)

	const fileContent = await fs.readFile(filePath, "utf-8")
	const { data, content } = matter(fileContent)

	return (
		<main className="min-h-screen p-8">
			<div className="bg-background p-8 rounded-lg shadow-lg">
				<h1 className="text-3xl font-bold mb-4">
					{data.title || chapterName.replace(".md", "")}
				</h1>
				<article className="prose lg:prose-xl markdown-body">
					<ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
						{content}
					</ReactMarkdown>
				</article>
			</div>
		</main>
	)
}