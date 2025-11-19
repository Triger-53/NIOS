"use client"
import { useState, useEffect } from "react"
import { Menu } from "@headlessui/react"
import { createClient } from "@/lib/supabase-client"
import { User } from "@supabase/supabase-js"
import StyledMarkdown from "@/components/StyledMarkdown"
import PurchaseButton from "@/components/PurchaseButton"

// --- Type Definitions ---
interface Message {
	role: "user" | "assistant"
	content: string
	sources?: { title: string; page: number }[]
}

interface Conversation {
	id: string
	title: string
}

// --- Main Chat Component ---
export default function PremiumChatPage() {
	// --- State Management ---
	const [_user, setUser] = useState<User | null>(null)
	const [isPremium, setIsPremium] = useState<boolean | null>(null)
	const [conversations, setConversations] = useState<Conversation[]>([])
	const [activeConversationId, setActiveConversationId] = useState<
		string | null
	>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [userInput, setUserInput] = useState("")
	const [isLoading, setIsLoading] = useState(false)
	const [isSidebarOpen, setSidebarOpen] = useState(false) // Default to closed on mobile
	const [editingConversationId, setEditingConversationId] = useState<
		string | null
	>(null)
	const [editingTitle, setEditingTitle] = useState("")
	const [summary, setSummary] = useState<string | null>(null)

	const supabase = createClient()

	// --- Effects ---
	// Fetch user and check premium status
	useEffect(() => {
		const checkUser = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser()
			setUser(user)
			if (user) {
				const { data: profile } = await supabase
					.from("profiles")
					.select("plan")
					.eq("id", user.id)
					.single()
				setIsPremium(profile?.plan === "premium")
			} else {
				setIsPremium(false)
			}
		}
		checkUser()
	}, [supabase])

	// Fetch conversations when user is premium
	useEffect(() => {
		if (isPremium) {
			fetchConversations()
		}
	}, [isPremium])

	// Sidebar visibility based on screen size
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 768) {
				// Tailwind's `md` breakpoint
				setSidebarOpen(true)
			} else {
				setSidebarOpen(false)
			}
		}
		handleResize() // Set initial state
		window.addEventListener("resize", handleResize)
		return () => window.removeEventListener("resize", handleResize)
	}, [])

	// --- Data Fetching ---
	const fetchConversations = async () => {
		try {
			const response = await fetch("/api/chat-history")
			if (response.ok) {
				const data = await response.json()
				setConversations(data)
			}
		} catch (error) {
			console.error("Failed to fetch conversations:", error)
		}
	}

	const fetchConversationMessages = async (conversationId: string) => {
		setActiveConversationId(conversationId)
		try {
			const response = await fetch(`/api/chat-history/${conversationId}`)
			if (response.ok) {
				const data = await response.json()
				setMessages(data.messages || [])
				setSummary(data.summary || null)
			}
		} catch (error) {
			console.error("Failed to fetch messages:", error)
		}
	}

	// --- Event Handlers ---
	const handleNewConversation = () => {
		setActiveConversationId(null)
		setMessages([])
		setUserInput("")
	}

	const handleRename = (convo: Conversation) => {
		setEditingConversationId(convo.id)
		setEditingTitle(convo.title)
	}

	const handleUpdateTitle = async () => {
		if (!editingConversationId || !editingTitle.trim()) return

		try {
			const response = await fetch(
				`/api/chat-history/${editingConversationId}`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ title: editingTitle }),
				}
			)

			if (response.ok) {
				setConversations(
					conversations.map((c) =>
						c.id === editingConversationId ? { ...c, title: editingTitle } : c
					)
				)
			}
		} catch (error) {
			console.error("Failed to update title:", error)
		} finally {
			setEditingConversationId(null)
			setEditingTitle("")
		}
	}

	const handleDelete = async (conversationId: string) => {
		if (window.confirm("Are you sure you want to delete this chat?")) {
			try {
				const response = await fetch(`/api/chat-history/${conversationId}`, {
					method: "DELETE",
				})

				if (response.ok) {
					setConversations(conversations.filter((c) => c.id !== conversationId))
					if (activeConversationId === conversationId) {
						handleNewConversation()
					}
				}
			} catch (error) {
				console.error("Failed to delete conversation:", error)
			}
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!userInput.trim() || isLoading) return

		const newMessages: Message[] = [
			...messages,
			{ role: "user", content: userInput },
		]
		setMessages(newMessages)
		setIsLoading(true)

		try {
			// Send question to AI Teacher API
			const historyToSend = summary ? messages.slice(messages.length - (messages.length % 10)) : messages
			const aiResponse = await fetch("/api/ask-teacher", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					question: userInput,
					history: historyToSend,
					summary: summary,
				}),
			})

			if (!aiResponse.ok) {
				throw new Error("Failed to get response from AI teacher.")
			}

			const aiData = await aiResponse.json()
			const assistantMessage: Message = {
				role: "assistant",
				content: aiData.answer,
				sources: aiData.sources,
			}
			const updatedMessages = [...newMessages, assistantMessage]
			setMessages(updatedMessages)

			// Summarization logic
			let newSummary = summary;
			if (updatedMessages.length > 0 && updatedMessages.length % 10 === 0) {
				const toSummarize = updatedMessages.slice(-10)
				const summarizeResponse = await fetch("/api/summarize", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ messages: toSummarize }),
				})
				const summaryData = await summarizeResponse.json()
				newSummary = (summary ? summary + "\n" : "") + summaryData.summary
				setSummary(newSummary)
			}

			// Save conversation to database
			let conversationIdToSave = activeConversationId
			if (!conversationIdToSave) {
				// Create new conversation
				const firstTitle = userInput.substring(0, 30)
				const saveResponse = await fetch("/api/chat-history", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title: firstTitle,
						messages: updatedMessages,
						summary: newSummary,
					}),
				})
				const savedData = await saveResponse.json()
				conversationIdToSave = savedData.id
				setActiveConversationId(conversationIdToSave)
				fetchConversations() // Refresh list
			} else {
				// Update existing conversation
				await fetch("/api/chat-history", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						conversationId: conversationIdToSave,
						messages: updatedMessages,
						summary: newSummary,
					}),
				})
			}
		} catch (error) {
			console.error("Error during chat submission:", error)
			const errorMessage: Message = {
				role: "assistant",
				content: "Sorry, I encountered an error. Please try again.",
			}
			setMessages((prev) => [...prev.slice(0, -1), errorMessage])
		} finally {
			setIsLoading(false)
			setUserInput("")
		}
	}

	// --- Render Logic ---
	if (isPremium === null) {
		return (
			<div className="flex justify-center items-center h-screen">
				Loading...
			</div>
		)
	}

	if (!isPremium) {
		return (
			<div className="flex flex-col justify-center items-center h-screen text-center">
				<h1 className="text-3xl font-bold mb-4">Access Premium Features</h1>
				<p className="mb-8">
					Upgrade to our Premium Plan to unlock the AI Teacher and other exclusive
					content.
				</p>
				{_user && (
					<PurchaseButton
						plan="premium"
						amount={parseInt(process.env.PREMIUM_PLAN_PRICE || "99900")}
						userId={_user.id}
					/>
				)}
			</div>
		);
	}

	return (
		<div className="flex h-[82.1vh] w-full bg-gray-100 text-gray-800 overflow-hidden">
			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 h-full z-40 bg-gray-300 bg-gradient-to-t from-transparent to-white p-4 flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto ${
					isSidebarOpen ? "translate-x-0" : "-translate-x-full"
				} w-64 md:w-80 pt-[10vh] bg-gradient-to-t from-transparent to-gray-300 flex`}>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold">History</h2>
					<button
						onClick={handleNewConversation}
						className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
						<PlusIcon className="w-5 h-5" />
					</button>
				</div>
				<div className="flex-grow overflow-y-auto -mr-2 pr-2">
					{conversations.map((convo) => (
						<div
							key={convo.id}
							className={`group relative p-3 my-1.5 rounded-lg cursor-pointer transition-colors hover:z-40 ${
								activeConversationId === convo.id
									? "bg-blue-500 text-white"
									: "hover:bg-gray-200"
							}`}
							onClick={() => {
								if (editingConversationId !== convo.id) {
									fetchConversationMessages(convo.id)
								}
							}}>
							{editingConversationId === convo.id ? (
								<input
									type="text"
									value={editingTitle}
									onChange={(e) => setEditingTitle(e.target.value)}
									onBlur={handleUpdateTitle}
									onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
									className="w-full bg-transparent border-b border-blue-300 focus:outline-none"
									autoFocus
								/>
							) : (
								<div className="flex justify-between items-center">
									<p className="truncate pr-2">{convo.title}</p>
									<div
										className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
										onClick={(e) => e.stopPropagation()}>
										<Menu
											as="div"
											className="relative inline-block text-left">
											<Menu.Button className="p-1 rounded-full hover:bg-gray-500/20">
												<DotsVerticalIcon className="w-5 h-5" />
											</Menu.Button>
											<Menu.Items
												anchor="bottom end"
												className="w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
												<div className="px-1 py-1">
													<Menu.Item>
														{({ active }) => (
															<button
																onClick={() => handleRename(convo)}
																className={`group flex rounded-md items-center w-full px-2 py-2 text-sm ${
																	active
																		? "bg-blue-500 text-white"
																		: "text-gray-900"
																}`}>
																<PencilIcon className="w-5 h-5 mr-2" />
																Rename
															</button>
														)}
													</Menu.Item>
													<Menu.Item>
														{({ active }) => (
															<button
																onClick={() => handleDelete(convo.id)}
																className={`group flex rounded-md items-center w-full px-2 py-2 text-sm ${
																	active
																		? "bg-red-500 text-white"
																		: "text-gray-900"
																}`}>
																<TrashIcon className="w-5 h-5 mr-2" />
																Delete
															</button>
														)}
													</Menu.Item>
												</div>
											</Menu.Items>
										</Menu>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</aside>
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm"
					onClick={() => setSidebarOpen(false)}
				/>
			)}
			{/* Main Content */}
			<main className="flex-1 flex flex-col h-[82.1vh] bg-gradient-to-t from-transparent to-white">
				{/* Mobile Header */}
				<header className="md:hidden flex items-center justify-between p-4 bg-white/70 backdrop-blur-lg border-b">
					<button onClick={() => setSidebarOpen(!isSidebarOpen)}>
						<MenuIcon className="w-6 h-6" />
					</button>
					<h1 className="text-lg font-semibold truncate">
						{activeConversationId
							? conversations.find((c) => c.id === activeConversationId)?.title
							: "New Chat"}
					</h1>
					<div className="w-6" /> {/* Spacer */}
				</header>

				{/* Chat Messages */}
				<div className="flex-1 p-6 overflow-y-auto pb-24 [mask-image:linear-gradient(to_bottom,black_calc(100%-6rem),transparent)]">
					<div className="max-w-4xl mx-auto">
						{messages.length === 0 && !isLoading && (
							<div className="flex flex-col items-center justify-center h-full text-gray-500">
								<SparklesIcon className="w-16 h-16 mb-4" />
								<h2 className="text-2xl font-semibold">
									Start a new conversation
								</h2>
								<p>Ask me anything about your subjects!</p>
							</div>
						)}
						{messages.map((msg, index) => (
							<div
								key={index}
								className={`flex my-5 ${
									msg.role === "user" ? "justify-end" : "justify-start"
								}`}>
								<div
									className={`max-w-2xl p-4 rounded-2xl shadow-md ${
										msg.role === "user"
											? "bg-blue-500 text-white rounded-br-none"
											: "bg-white text-gray-800 rounded-bl-none"
									}`}>
									{msg.role === "assistant" ? (
										<StyledMarkdown content={msg.content} />
									) : (
										<p>{msg.content}</p>
									)}
									{msg.sources && msg.sources.length > 0 && (
										<div className="mt-4 pt-3 border-t border-gray-300/50">
											<h4 className="font-semibold text-sm mb-1">Sources:</h4>
											<ul className="text-xs list-disc list-inside space-y-1">
												{msg.sources.map((source, idx) => (
													<li key={idx}>
														Book: {source.title}, Page: {source.page}
													</li>
												))}
											</ul>
										</div>
									)}
								</div>
							</div>
						))}
						{isLoading && (
							<div className="flex justify-start">
								<div className="p-4 rounded-2xl shadow-md bg-white text-gray-800 rounded-bl-none">
									<div className="flex items-center space-x-2">
										<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
										<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75" />
										<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150" />
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* User Input Form */}
				<div className="p-4">
					<div className="max-w-4xl mx-auto">
						<form onSubmit={handleSubmit} className="flex items-center">
							<input
								type="text"
								value={userInput}
								onChange={(e) => setUserInput(e.target.value)}
								placeholder="Ask your AI teacher a question..."
								className="flex-1 p-3 border-2 bg-blue-50 backdrop-blur-lg rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
								disabled={isLoading}
							/>
							<button
								type="submit"
								className="ml-3 p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
								disabled={isLoading || !userInput.trim()}>
								<SendIcon className="w-5 h-5" />
							</button>
						</form>
					</div>
				</div>
			</main>
		</div>
	)
}

// --- SVG Icons ---
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 4v16m8-8H4"
			/>
		</svg>
	)
}

function DotsVerticalIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
			/>
		</svg>
	)
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
			/>
		</svg>
	)
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
			/>
		</svg>
	)
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M4 6h16M4 12h16m-7 6h7"
			/>
		</svg>
	)
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 13l4 4L19 7"
			/>
		</svg>
	)
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor">
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 3v4M3 5h4M19 3v4M17 5h4M12 3v18M3 12h18M5 21v-4M3 19h4M19 21v-4M17 19h4"
			/>
		</svg>
	)
}