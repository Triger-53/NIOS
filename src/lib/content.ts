// lib/content.ts
import { cookies as _cookies } from "next/headers"
import { createClient } from "./supabase-server" // Corrected import path
import fs from "fs"
import path from "path"
import matter from "gray-matter" // To parse markdown frontmatter

// Define subscription plans
enum Plan {
	Free = "free",
	Advance = "advance",
	Premium = "premium",
}

/**
 * Fetches the current user's subscription plan from Supabase.
 * @returns The user's plan, or 'free' if not logged in or no subscription.
 */
async function getUserPlan(): Promise<Plan> {
	const supabase = createClient() // Use the createClient from supabase-server.ts
	const {
		data: { session },
	} = await supabase.auth.getSession()

	if (!session) {
		return Plan.Free
	}

	const { data: profile, error } = await supabase
		.from("profiles")
		.select("plan")
		.eq("id", session.user.id)
		.single()

	if (error || !profile) {
		return Plan.Free
	}

	return (profile.plan as Plan) || Plan.Free
}

/**
 * Fetches chapter content if the user has access.
 * @param subject - The subject of the chapter.
 * @param chapterSlug - The slug for the chapter.
 * @returns The chapter content or null if access is denied.
 */
export async function getChapterContent(subject: string, chapterSlug: string) {
	const userPlan = await getUserPlan()
	const freePath = path.join(
		process.cwd(),
		"Content",
		"Free",
		subject,
		`${chapterSlug}.md`
	)
	const advancedPath = path.join(
		process.cwd(),
		"Content",
		"Advanced",
		subject,
		`${chapterSlug}.md`
	)

	let filePath: string | null = null
	let requiredPlan: Plan = Plan.Free

	if (fs.existsSync(advancedPath)) {
		filePath = advancedPath
		requiredPlan = Plan.Advance
	} else if (fs.existsSync(freePath)) {
		filePath = freePath
		requiredPlan = Plan.Free
	}

	if (!filePath) {
		return null // Chapter not found
	}

	// Check if user has access
	const hasAccess =
		requiredPlan === Plan.Free ||
		(requiredPlan === Plan.Advance &&
			(userPlan === Plan.Advance || userPlan === Plan.Premium))
	// Add logic for Premium content (e.g., videos) here

	if (!hasAccess) {
		// Return metadata indicating content is locked
		return {
			locked: true,
			requiredPlan,
			content: "Upgrade your plan to access this content.",
		}
	}

	const fileContents = fs.readFileSync(filePath, "utf8")
	const { data, content } = matter(fileContents)

	return {
		locked: false,
		metadata: data,
		content,
	}
}
