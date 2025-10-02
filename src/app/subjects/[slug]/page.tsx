import { getSubjectData, getAllSubjects } from "@/lib/loadSubjects"
import { notFound } from "next/navigation"
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"

export async function generateStaticParams() {
	const subjects = getAllSubjects()
	return subjects.map((subject) => ({
		slug: subject.slug,
	}))
}

export default function SubjectPage({ params }: { params: { slug: string } }) {
	const subject = getSubjectData(params.slug)

	if (!subject) {
		notFound()
	}

	const lessons =
		subject.content.lessons || subject.content[subject.slug] || []

	return (
		<main className="min-h-screen p-6 md:p-12">
			<div className="max-w-4xl mx-auto">
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold mb-2">{subject.title}</h1>
					<p className="text-lg text-gray-600">{subject.description}</p>
				</div>

				<div className="space-y-8">
					{lessons.map((lesson: any) => (
						<Card key={lesson.lesson_number} className="overflow-hidden">
							<CardHeader className="bg-gray-50 dark:bg-gray-800">
								<CardTitle className="flex justify-between items-center">
									<span>
										Lesson {lesson.lesson_number}: {lesson.title}
									</span>
									<Badge variant="secondary">{lesson.module}</Badge>
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6">
								<div className="mb-6">
									<h3 className="font-semibold text-lg mb-2">Objectives</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700">
										{lesson.objectives.map((obj: string, i: number) => (
											<li key={i}>{obj}</li>
										))}
									</ul>
								</div>

								<Accordion type="single" collapsible className="w-full">
									{lesson.sections.map((section: any, i: number) => (
										<AccordionItem
											key={section.section_number}
											value={`item-${i}`}>
											<AccordionTrigger className="text-lg font-medium">
												{section.section_number} {section.title}
											</AccordionTrigger>
											<AccordionContent className="prose max-w-none">
												{section.description && <p>{section.description}</p>}
												{section.definition && <p>{section.definition}</p>}
												{section.concept_detail && (
													<p>{section.concept_detail}</p>
												)}
												{section.features && (
													<ul>
														{section.features.map(
															(feature: string, j: number) => (
																<li key={j}>{feature}</li>
															)
														)}
													</ul>
												)}
												{section.comparison_table && (
													<div className="overflow-x-auto">
														<table className="min-w-full divide-y divide-gray-200">
															<thead className="bg-gray-50">
																<tr>
																	{Object.keys(
																		section.comparison_table[0]
																	).map((key) => (
																		<th
																			key={key}
																			scope="col"
																			className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
																			{key.replace(/_/g, " ")}
																		</th>
																	))}
																</tr>
															</thead>
															<tbody className="bg-white divide-y divide-gray-200">
																{section.comparison_table.map(
																	(row: any, k: number) => (
																		<tr key={k}>
																			{Object.values(row).map(
																				(val: any, l: number) => (
																					<td
																						key={l}
																						className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																						{val}
																					</td>
																				)
																			)}
																		</tr>
																	)
																)}
															</tbody>
														</table>
													</div>
												)}
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</main>
	)
}