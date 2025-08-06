import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import AdSideBanner from "@/components/ui/AdSideBanner"

export const dynamic = "force-dynamic"

type Props = {
	params: {
		slug: string
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const filePath = path.join(
		process.cwd(),
		"content",
		"en",
		`${params.slug}.md`
	)

	if (!fs.existsSync(filePath)) {
		return { title: "Subject Not Found" }
	}

	const fileContent = fs.readFileSync(filePath, "utf8")
	const { data } = matter(fileContent)

	return {
		title: data.title || "Subject Page",
	}
}

export default async function Page({ params }: Props) {
	const filePath = path.join(
		process.cwd(),
		"content",
		"en",
		`${params.slug}.md`
	)

	if (!fs.existsSync(filePath)) {
		return notFound()
	}

	const fileContent = fs.readFileSync(filePath, "utf8")
	const { data, content } = matter(fileContent)
	const processedContent = await remark().use(html).process(content)
	const contentHtml = processedContent.toString()

	return (
		<main className="max-w-3xl mx-auto px-6 py-10">
			<h1 className="text-3xl font-bold mb-6">{data.title}</h1>
			<div
				className="prose prose-lg"
				dangerouslySetInnerHTML={{ __html: contentHtml }}
			/>
			<AdSideBanner />
		</main>
	)
}
