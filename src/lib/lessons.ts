import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

const contentDirectory = path.join(process.cwd(), "Content")

/**
 * Parses a markdown file into its data (front-matter) and content.
 * @param fileContents The string content of the markdown file.
 * @returns An object with front-matter data and the main content string.
 */
function parseMarkdown(fileContents: string) {
	// Use gray-matter to parse the post metadata section
	const matterResult = matter(fileContents)

	return {
		data: matterResult.data,
		content: matterResult.content,
	}
}

/**
 * Gets a list of all lessons for a given subject, sorted by title.
 * @param subject The subject folder (e.g., 'Free/English').
 * @returns An array of lesson metadata.
 */
export function getSortedLessonsData(subject: string) {
	const subjectDirectory = path.join(contentDirectory, subject)
	const fileContents = fs.readFileSync(
		path.join(subjectDirectory, "English.md"),
		"utf8"
	)

	// Split the content by the '---' separator to handle multiple documents in one file
	const lessons = fileContents
		.split("***")
		.map((doc) => doc.trim())
		.filter((doc) => doc)

	const allLessonsData = lessons.map((lessonContent) => {
		const { data } = parseMarkdown(lessonContent)
		return {
			...(data as { title: string; slug: string }),
		}
	})

	// Sort lessons by title
	return allLessonsData.sort((a, b) => {
		if (a.title < b.title) {
			return -1
		} else {
			return 1
		}
	})
}
