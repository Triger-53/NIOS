import { promises as fs } from "fs"
import path from "path"
import matter from "gray-matter"
import ReactMarkdown from "react-markdown"
import "github-markdown-css/github-markdown.css"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { createClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Profile } from "@/types"

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
			<div className="bg-white p-8 rounded-lg shadow-lg">
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
