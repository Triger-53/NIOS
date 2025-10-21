import { getSubjectData, getAllSubjects } from "@/lib/loadSubjects"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
	const subjects = getAllSubjects()
	return subjects.map((subject) => ({
		slug: subject.slug,
	}))
}

export default async function SubjectPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const subject = await getSubjectData(slug)

	if (!subject) {
		notFound()
	}

	return (
		<main className="min-h-screen p-6 md-p-12">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold mb-2">{subject.title}</h1>
					<p className="text-lg text-gray-600">{subject.description}</p>
				</div>

				<div
					className="prose lg:prose-xl max-w-none"
					dangerouslySetInnerHTML={{ __html: subject.content }}
				/>
			</div>
		</main>
	)
}
