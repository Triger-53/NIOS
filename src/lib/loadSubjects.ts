import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

const subjectsDirectory = process.cwd()

interface Subject {
	slug: string
	title: string
	description: string
	content: any
}

function toTitleCase(str: string) {
	return str.replace(/\w\S*/g, (txt) => {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	})
}

export function getAllSubjects(): Omit<Subject, "content">[] {
	try {
		const allFiles = fs.readdirSync(subjectsDirectory)
		const subjectFiles = allFiles.filter((file) => file.endsWith(".md"))

		const allSubjectsData = subjectFiles.map((fileName) => {
			const slug = fileName.replace(/\.md$/, "")
			const filePath = path.join(subjectsDirectory, fileName)
			const fileContents = fs.readFileSync(filePath, "utf8")
			const { data } = matter(fileContents)

			return {
				slug,
				title: data.title || toTitleCase(slug.replace(/-/g, " ")),
				description: data.description || "Notes and materials for this subject.",
			}
		})

		return allSubjectsData
	} catch (error) {
		console.error("Error in getAllSubjects:", error)
		return []
	}
}

export async function getSubjectData(slug: string): Promise<Subject | null> {
	const filePath = path.join(subjectsDirectory, `${slug}.md`)

	try {
		const fileContents = fs.readFileSync(filePath, "utf8")
		const { data, content } = matter(fileContents)

		const processedContent = await remark().use(html).process(content)
		const contentHtml = processedContent.toString()

		return {
			slug,
			title: data.title || toTitleCase(slug.replace(/-/g, " ")),
			description: data.description || "Notes and materials for this subject.",
			content: contentHtml,
		}
	} catch (error) {
		console.error(`Error reading or parsing subject data for ${slug}:`, error)
		return null
	}
}