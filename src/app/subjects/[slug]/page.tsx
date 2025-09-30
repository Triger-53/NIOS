import { supabase } from "@/lib/supabaseClient"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import AdSideBanner from "@/components/ui/AdSideBanner"

export const dynamic = "force-dynamic"

type Params = {
	slug: string
}

type BookChunk = {
    id: number;
    subject: string;
    book_title: string;
    chunk_index: number;
    content: any; // jsonb can be any valid JSON
    created_at: string;
}

// Fetches metadata from Supabase
export async function generateMetadata({
	params,
}: {
	params: Promise<Params>
}): Promise<Metadata> {
	const { slug } = await params

    const { data, error } = await supabase
        .from("books")
        .select("book_title")
        .eq("subject", slug)
        .limit(1)
        .single()

	if (error || !data) {
		return { title: "Subject Not Found" }
	}

	return {
		title: data.book_title || "Subject Page",
	}
}

export default async function Page({ params }: { params: Promise<Params> }) {
	const { slug } = await params

    const { data: books, error } = await supabase
        .from("books")
        .select("*")
        .eq("subject", slug)
        .order("chunk_index", { ascending: true })

	if (error || !books || books.length === 0) {
		return notFound()
	}

	const bookTitle = books[0].book_title;

	return (
		<main className="max-w-3xl mx-auto px-6 py-10">
			<h1 className="text-3xl font-bold mb-6">{bookTitle}</h1>
			<div className="space-y-6">
                {(books as BookChunk[]).map((chunk) => (
                    <div key={chunk.id} className="p-4 border border-gray-200 rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold mb-2">Chunk {chunk.chunk_index + 1}</h2>
                        <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
                            {JSON.stringify(chunk.content, null, 2)}
                        </pre>
                    </div>
                ))}
            </div>
			<AdSideBanner />
		</main>
	)
}
