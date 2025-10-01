import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { subjects } from "@/lib/subjectList"

export default function SubjectsPage() {
	return (
		<main className="min-h-screen p-6 md:p-12">
			<div className="max-w-6xl mx-auto">
				<h1 className="text-3xl font-bold mb-8 text-center">All Subjects</h1>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{subjects.map((subj) => (
						<Card key={subj.slug} className="hover:shadow-xl transition">
							<CardContent className="p-6">
								<h2 className="text-xl font-semibold mb-2">{subj.title}</h2>
								<p className="text-sm text-gray-600 mb-4">{subj.description}</p>
								<Link
									className="text-blue-600 hover:underline text-sm"
									href={`/subjects/${subj.slug}`}>
									View Notes →
								</Link>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</main>
	)
}
