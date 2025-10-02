import fs from "fs"
import path from "path"

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
	const subjectFiles = ["accountancy.json", "english.json"]

	try {
		const allSubjectsData = subjectFiles.map((fileName) => {
			const slug = fileName.replace(/\.json$/, "")
			const filePath = path.join(subjectsDirectory, fileName)
			const fileContents = fs.readFileSync(filePath, "utf8")
			const data = JSON.parse(fileContents)

			const firstLesson = data.lessons?.[0] || data.accountancy?.[0]
			const description =
				firstLesson?.objectives?.[0] || "Notes and materials for this subject."

			return {
				slug,
				title: toTitleCase(slug.replace(/-/g, " ")),
				description: description,
			}
		})

		return allSubjectsData
	} catch (error) {
		console.error("Error in getAllSubjects:", error)
		return []
	}
}

export function getSubjectData(slug: string): Subject | null {
	const filePath = path.join(subjectsDirectory, `${slug}.json`)

	try {
		const fileContents = fs.readFileSync(filePath, "utf8")
		const data = JSON.parse(fileContents)
		const firstLesson = data.lessons?.[0] || data.accountancy?.[0]
		const description =
			firstLesson?.objectives?.[0] || "Notes and materials for this subject."

		return {
			slug,
			title: toTitleCase(slug.replace(/-/g, " ")),
			description: description,
			content: data,
		}
	} catch (error) {
		console.error(`Error reading or parsing subject data for ${slug}:`, error)
		return null
	}
}