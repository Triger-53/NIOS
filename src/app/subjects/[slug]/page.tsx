import { getSubjectData, getAllSubjects } from "@/lib/loadSubjects"
import { notFound } from "next/navigation"
import StyledMarkdown from '@/components/StyledMarkdown'

export async function generateStaticParams() {
	const subjects = getAllSubjects()
	return subjects.map((subject) => ({
		slug: subject.slug,
	}))
}

type PageProps = {
	params: { slug: string };
	searchParams: { [key: string]: string | string[] | undefined };
};

export default async function SubjectPage({ params }: PageProps) {
	const { slug } = params;
	const decodedSlug = decodeURIComponent(slug);
	const subject = await getSubjectData(decodedSlug)

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

				<StyledMarkdown content={subject.content} />
			</div>
		</main>
	)
}
