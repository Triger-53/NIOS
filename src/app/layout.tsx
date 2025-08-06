import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"

export const metadata: Metadata = {
	title: "NIOS Class 10 in 1 Day",
	description: "Master your NIOS course with free notes, fast!",
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<ClientLayout>{children}</ClientLayout>
		</html>
	)
}
