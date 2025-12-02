"use client"
import { useState, useEffect, useRef } from "react"
import { Menu } from "@headlessui/react"
import { createClient } from "@/lib/supabase-client"
import { User } from "@supabase/supabase-js"
import StyledMarkdown from "@/components/StyledMarkdown"
import PurchaseButton from "@/components/PurchaseButton"
import {
	Plus,
	MessageSquare,
	MoreVertical,
	Pencil,
	Trash2,
	Menu as MenuIcon,
	Send,
	Sparkles,
	Loader,
	Paperclip,
	File as FileIcon,
	X,
	Radio,
} from "lucide-react" // Radio will be removed
import LiveOverlay from "@/components/live/LiveOverlay"
import LiveIcon from "@/components/LiveIcon"

// --- Type Definitions ---
interface Message {
	role: "user" | "assistant"
	content: string
	sources?: { title: string; page: number }[]
	attachments?: { name: string; content: string }[]
}

interface Conversation {
	id: string
	title: string
}

interface AttachedFile {
	file: File
	status: "processing" | "completed" | "error"
	extractedText?: string
	error?: string
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
	const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
	const [isLiveActive, setIsLiveActive] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const isUploading = attachedFiles.some((f) => f.status === "processing")

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

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFiles = Array.from(e.target.files || [])
		if (attachedFiles.length + selectedFiles.length > 10) {
			alert("You can upload a maximum of 10 files.")
			return
		}

		const newFiles: AttachedFile[] = selectedFiles.map((file) => ({
			file,
			status: "processing",
		}))
		setAttachedFiles((prev) => [...prev, ...newFiles])

		newFiles.forEach(async (newFile, _index) => {
			const { file } = newFile
			// Basic validation
			if (file.size > 100 * 1024 * 1024) {
				setAttachedFiles((prev) =>
					prev.map((f) =>
						f.file === file
							? { ...f, status: "error", error: "File too large" }
							: f
					)
				)
				return
			}
			const allowedTypes = [
				"image/png",
				"image/jpeg",
				"application/pdf",
				"text/plain",
				"audio/mpeg",
				"audio/wav",
				"video/mp4",
				"video/webm",
			]
			if (!allowedTypes.includes(file.type)) {
				setAttachedFiles((prev) =>
					prev.map((f) =>
						f.file === file
							? { ...f, status: "error", error: "Unsupported type" }
							: f
					)
				)
				return
			}

			// Process the file
			try {
				const formData = new FormData()
				formData.append("file", file)
				const response = await fetch("/api/process-media", {
					method: "POST",
					body: formData,
				})

				if (!response.ok) {
					throw new Error("Failed to process file")
				}
				const data = await response.json()
				setAttachedFiles((prev) =>
					prev.map((f) =>
						f.file === file
							? {
								...f,
								status: "completed",
								extractedText: data.text,
							}
							: f
					)
				)
			} catch {
				setAttachedFiles((prev) =>
					prev.map((f) =>
						f.file === file
							? { ...f, status: "error", error: "Processing failed" }
							: f
					)
				)
			}
		})

		// Clear the file input
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const removeFile = (fileToRemove: File) => {
		setAttachedFiles((prev) => prev.filter((f) => f.file !== fileToRemove))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (
			!userInput.trim() ||
			isLoading ||
			isUploading ||
			(attachedFiles.length > 0 &&
				attachedFiles.some((f) => f.status !== "completed"))
		)
			return

		const attachmentsForHistory = attachedFiles.map((f) => ({
			name: f.file.name,
			content: f.extractedText || "",
		}))

		const userMessage: Message = {
			role: "user",
			content: userInput,
			attachments: attachmentsForHistory,
		}

		const newMessages: Message[] = [...messages, userMessage]
		setMessages(newMessages)
		setIsLoading(true)

		try {
			// Prepend extracted text to the user's question for the RAG
			const mediaContext = attachedFiles
				.map((file) => file.extractedText)
				.join("\n\n---\n\n")

			const questionWithContext = mediaContext
				? `${mediaContext}\n\n---\n\nUser Question: ${userInput}`
				: userInput

			// Send question to AI Teacher API
			const historyToSend = summary
				? messages.slice(messages.length - (messages.length % 10))
				: messages
			const aiResponse = await fetch("/api/ask-teacher", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					question: questionWithContext,
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
			let newSummary = summary
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
			setAttachedFiles([])
		}
	}

	// --- Render Logic ---
	if (isPremium === null) {
		return (
			<div className="flex justify-center items-center h-screen bg-background">
				<Loader className="w-8 h-8 animate-spin text-blue-500" />
				<p className="ml-4 text-lg text-muted-foreground">Loading your experience...</p>
			</div>
		)
	}

	if (!isPremium) {
		return (
			<div className="flex flex-col justify-center items-center h-screen text-center bg-background p-4">
				<div className="max-w-md w-full bg-card p-8 rounded-2xl shadow-lg">
					<Sparkles className="w-16 h-16 mx-auto text-blue-500 mb-4" />
					<h1 className="text-3xl font-bold text-foreground mb-2">
						Unlock Your AI Teacher
					</h1>
					<p className="text-muted-foreground mb-8">
						Upgrade to Premium to get personalized help, ask questions, and get
						deeper insights into your subjects.
					</p>
					{_user && (
						<PurchaseButton
							plan="premium"
							amount={parseInt(process.env.PREMIUM_PLAN_PRICE || "99900")}
							userId={_user.id}
						/>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="flex h-[calc(100dvh-12rem)] md:h-[calc(100dvh-8rem)] w-full bg-background text-foreground overflow-hidden">
			{/* Sidebar */}
			<aside
				className={`fixed top-0 left-0 h-full z-40 bg-background/80 backdrop-blur-md border-r border-border p-4 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
					} w-72 md:w-80 pt-24 md:pt-4 flex`}>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold text-foreground">History</h2>
					<button
						onClick={handleNewConversation}
						className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg">
						<Plus className="w-5 h-5" />
					</button>
				</div>
				<div className="flex-grow overflow-y-auto -mr-2 pr-2 space-y-2">
					{conversations.map((convo) => (
						<div
							key={convo.id}
							className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${activeConversationId === convo.id
								? "bg-blue-500 text-white shadow-md"
								: "hover:bg-muted"
								}`}
							onClick={() => {
								if (editingConversationId !== convo.id) {
									fetchConversationMessages(convo.id)
								}
							}}>
							<MessageSquare className="w-5 h-5 mr-3 flex-shrink-0" />
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
								<p className="truncate pr-2 flex-grow">{convo.title}</p>
							)}
							<div
								className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0"
								onClick={(e) => e.stopPropagation()}>
								<Menu as="div" className="relative inline-block text-left">
									<Menu.Button className="p-1.5 rounded-full hover:bg-gray-500/20">
										<MoreVertical className="w-5 h-5" />
									</Menu.Button>
									<Menu.Items
										anchor="bottom end"
										className="w-40 origin-top-right divide-y divide-border rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
										<div className="px-1 py-1">
											<Menu.Item>
												{({ active }) => (
													<button
														onClick={() => handleRename(convo)}
														className={`group flex rounded-md items-center w-full px-2 py-2 text-sm ${active
															? "bg-blue-500 text-white"
															: "text-foreground"
															}`}>
														<Pencil className="w-4 h-4 mr-2" />
														Rename
													</button>
												)}
											</Menu.Item>
											<Menu.Item>
												{({ active }) => (
													<button
														onClick={() => handleDelete(convo.id)}
														className={`group flex rounded-md items-center w-full px-2 py-2 text-sm ${active
															? "bg-red-500 text-white"
															: "text-red-600"
															}`}>
														<Trash2 className="w-4 h-4 mr-2" />
														Delete
													</button>
												)}
											</Menu.Item>
										</div>
									</Menu.Items>
								</Menu>
							</div>
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
			<main className="flex-1 flex flex-col h-full bg-gradient-to-b from-background to-muted/30">
				{/* Mobile Header */}
				<header className="md:hidden flex items-center justify-between p-4 bg-background/70 backdrop-blur-lg border-b border-border">
					<button onClick={() => setSidebarOpen(!isSidebarOpen)}>
						<MenuIcon className="w-6 h-6 text-muted-foreground" />
					</button>
					<h1 className="text-lg font-semibold truncate text-foreground">
						{activeConversationId
							? conversations.find((c) => c.id === activeConversationId)?.title
							: "New Chat"}
					</h1>
					<div className="w-6" /> {/* Spacer */}
				</header>

				{/* Chat Messages */}
				<div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 [mask-image:linear-gradient(to_bottom,black_calc(100%-6rem),transparent)]">
					<div className="max-w-4xl mx-auto">
						{messages.length === 0 && !isLoading && (
							<div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
								<Sparkles className="w-16 h-16 mb-4 text-blue-400" />
								<h2 className="text-2xl font-semibold text-foreground">
									Start a new conversation
								</h2>
								<p>Ask me anything about your subjects!</p>
							</div>
						)}
						{messages.map((msg, index) => (
							<div
								key={index}
								className={`flex my-5 gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"
									}`}>
								<div
									className={`max-w-2xl p-4 rounded-2xl shadow-md ${msg.role === "user"
										? "bg-blue-500 text-white rounded-br-lg"
										: "bg-card text-card-foreground rounded-bl-lg"
										}`}>
									{msg.role === "assistant" ? (
										<StyledMarkdown content={msg.content} />
									) : (
										<>
											{msg.attachments && msg.attachments.length > 0 && (
												<div className="flex flex-wrap gap-2 mb-2">
													{msg.attachments.map((att, idx) => (
														<div
															key={idx}
															className="flex items-center bg-blue-400/80 rounded-lg px-2 py-1 text-sm">
															<FileIcon className="w-4 h-4 mr-2" />
															<span>{att.name}</span>
														</div>
													))}
												</div>
											)}
											<p>{msg.content}</p>
										</>
									)}
									{msg.sources && msg.sources.length > 0 && (
										<div className="mt-4 pt-3 border-t border-blue-400/50">
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
								<div className="p-4 rounded-2xl shadow-md bg-card text-card-foreground rounded-bl-none">
									<div className="flex items-center space-x-2">
										<div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
										<div
											className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
											style={{ animationDelay: "0.2s" }}
										/>
										<div
											className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
											style={{ animationDelay: "0.4s" }}
										/>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* User Input Form */}
				<div className="p-2 md:p-4 bg-gradient-to-t from-background/50 to-transparent">
					<div className="max-w-4xl mx-auto">
						{/* Attached Files Display */}
						<div className="flex flex-wrap gap-2 mb-2">
							{attachedFiles.map((file, index) => (
								<div
									key={index}
									className="flex items-center bg-muted rounded-lg pl-2 pr-1 py-1 text-sm">
									<FileIcon className="w-4 h-4 mr-2 text-muted-foreground" />
									<span className="truncate max-w-xs">{file.file.name}</span>
									{file.status === "processing" && (
										<Loader className="w-4 h-4 ml-2 animate-spin" />
									)}
									{file.status === "error" && (
										<span className="text-red-500 ml-2 text-xs">
											{file.error}
										</span>
									)}
									<button
										onClick={() => removeFile(file.file)}
										className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/20">
										<X className="w-3 h-3" />
									</button>
								</div>
							))}
						</div>
						<div className="flex flex-col-reverse md:flex-row md:items-center gap-2 md:gap-4">
							<form
								onSubmit={handleSubmit}
								className="flex-1 flex items-center bg-background rounded-full shadow-md border border-border overflow-hidden w-full">
								<input
									type="file"
									ref={fileInputRef}
									multiple
									onChange={handleFileChange}
									className="hidden"
									accept="image/png,image/jpeg,application/pdf,text/plain,audio/mpeg,audio/wav,video/mp4,video/webm"
								/>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									disabled={isUploading}
									className="p-2 md:p-3 text-muted-foreground rounded-full hover:bg-muted disabled:opacity-50 transition-colors duration-200 shrink-0 ml-1.5">
									{isUploading ? (
										<Loader className="w-5 h-5 animate-spin" />
									) : (
										<Paperclip className="w-5 h-5" />
									)}
								</button>
								<input
									type="text"
									value={userInput}
									onChange={(e) => setUserInput(e.target.value)}
									placeholder="Ask your AI teacher..."
									className="flex-1 py-3 px-2 bg-transparent focus:ring-0 focus:outline-none min-w-0 text-sm md:text-base"
									disabled={isLoading || isUploading}
								/>
								<button
									type="submit"
									className="m-1 p-2 md:p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm hover:shadow-md shrink-0"
									disabled={
										isLoading ||
										isUploading ||
										!userInput.trim() ||
										(attachedFiles.length > 0 &&
											attachedFiles.some((f) => f.status !== "completed"))
									}>
									<Send className="w-5 h-5" />
								</button>
							</form>
							<button
								type="button"
								onClick={() => setIsLiveActive(true)}
								className="flex-shrink-0 rounded-full w-12 h-12 md:w-14 md:h-14 transition-all duration-200 active:scale-95 hover:scale-110 shadow-lg hover:shadow-xl self-end md:self-auto"
								title="Start Live Session"
							>
								<LiveIcon className="w-full h-full" />
							</button>
						</div>
					</div>
				</div>
			</main>
			{isLiveActive && (
				<LiveOverlay
					onClose={() => setIsLiveActive(false)}
					context={
						(summary ? `Summary of previous conversation:\n${summary}\n\n` : "") +
						(messages.length > 0
							? `Recent messages:\n${messages
								.slice(-10)
								.map((m) => `${m.role}: ${m.content}`)
								.join("\n")}`
							: "")
					}
				/>
			)}
		</div>
	)
}