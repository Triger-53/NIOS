"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

export default function SignOut() {
	const supabase = createClient()
	const router = useRouter()

	const handleSignOut = async () => {
		await supabase.auth.signOut()
		router.refresh()
	}

	return (
		<Button size="lg" variant="ghost" onClick={handleSignOut}>
			🔐 Sign Out
		</Button>
	)
}
