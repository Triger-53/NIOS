import { notFound } from "next/navigation"
import type { Metadata } from "next"
import AdSideBanner from "@/components/ui/AdSideBanner"
import { subjects } from "@/lib/subjectList"

type Params = {
	slug: string
}

export async function generateMetadata({
	params,
}: {
	params: Promise<Params>
}): Promise<Metadata> {
	const { slug } = await params
	const subject = subjects.find(s => s.slug === slug)
	
	if (!subject) {
		return { title: "Subject Not Found" }
	}

	return {
		title: subject.title,
		description: subject.description,
	}
}

export default async function Page({ params }: { params: Promise<Params> }) {
	const { slug } = await params
	const subject = subjects.find(s => s.slug === slug)

	if (!subject) {
		return notFound()
	}

	return (
		<div className="min-h-screen p-6 md:p-12">
			<div className="max-w-6xl mx-auto flex gap-8">
				<main className="flex-1">
					<h1 className="text-3xl font-bold mb-6">{subject.title}</h1>
					<div className="prose prose-lg max-w-none">
						<p className="text-gray-600 mb-6">{subject.description}</p>
						
						<div className="bg-gray-50 p-6 rounded-lg mb-8">
							<h2 className="text-xl font-semibold mb-4">📚 Chapter-wise Notes</h2>
							<div className="grid gap-4">
								{/* Sample chapters - you can replace with actual content */}
								<div className="border-l-4 border-blue-500 pl-4">
									<h3 className="font-medium">Chapter 1: Introduction</h3>
									<p className="text-sm text-gray-600">Basic concepts and fundamentals</p>
								</div>
								<div className="border-l-4 border-green-500 pl-4">
									<h3 className="font-medium">Chapter 2: Core Topics</h3>
									<p className="text-sm text-gray-600">Main subject content and examples</p>
								</div>
								<div className="border-l-4 border-purple-500 pl-4">
									<h3 className="font-medium">Chapter 3: Advanced Concepts</h3>
									<p className="text-sm text-gray-600">Complex topics and applications</p>
								</div>
							</div>
						</div>

						<div className="bg-blue-50 p-6 rounded-lg">
							<h2 className="text-xl font-semibold mb-4">🎯 Quick Study Tips</h2>
							<ul className="list-disc pl-6 space-y-2">
								<li>Focus on key concepts and formulas</li>
								<li>Practice with sample questions</li>
								<li>Review previous year papers</li>
								<li>Create summary notes for revision</li>
							</ul>
						</div>
					</div>
				</main>
				<AdSideBanner />
			</div>
		</div>
	)
}
