import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"

const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (
					credentials?.username === "advance" &&
					credentials?.password === "notes123"
				) {
					return { id: "1", name: "Advance User" }
				}

				if (
					credentials?.username === "premium" &&
					credentials?.password === "pass123"
				) {
					return { id: "2", name: "Premium User" }
				}

				return null
			},
		}),
	],
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
}

export default authOptions