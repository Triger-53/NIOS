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
				// 🔍 Debug logs
				console.log("🟡 Username from .env:", process.env.USERNAME)
				console.log("🟡 Password from .env:", process.env.PASSWORD)
				console.log("🟢 Input username:", credentials?.username)
				console.log("🟢 Input password:", credentials?.password)

				const validUsername = process.env.USERNAME
				const validPassword = process.env.PASSWORD

				if (
					credentials?.username === validUsername &&
					credentials?.password === validPassword
				) {
					return { id: "1", name: credentials?.username || "User" }
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
