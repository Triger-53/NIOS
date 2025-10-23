import { getSubjectData, getAllSubjects } from "@/lib/loadSubjects"
import { notFound } from "next/navigation"
import StyledMarkdown from '@/components/StyledMarkdown'

export async function generateStaticParams() {
	const subjects = getAllSubjects()
	return subjects.map((subject) => ({
		slug: subject.slug,
	}))
}

export default async function SubjectPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const decodedSlug = decodeURIComponent(slug);
	const subject = await getSubjectData(decodedSlug)

	if (!subject) {
		notFound()
	}

	return (
		<main className="min-h-screen p-4 md:p-12">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8 text-center">
					<h1 className="text-3xl md:text-4xl font-bold mb-2">{subject.title}</h1>
					<p className="text-md md:text-lg text-gray-600">
						{subject.description}
					</p>
				</div>

				<StyledMarkdown content={subject.content} />
			</div>
		</main>
	)
}
