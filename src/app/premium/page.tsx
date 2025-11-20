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
	Mic,
	StopCircle,
} from "lucide-react"

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
	const [isRecording, setIsRecording] = useState(false)
	const [audioPlayer, setAudioPlayer] = useState<HTMLAudioElement | null>(null)
	const [isLiveChatActive, setIsLiveChatActive] = useState(false)
	const mediaRecorderRef = useRef<MediaRecorder | null>(null)
	const audioChunksRef = useRef<Blob[]>([])
	const fileInputRef = useRef<HTMLInputElement>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)

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

	// Auto-scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
	}, [messages, isLoading])

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
		// Close sidebar on mobile when a chat is selected
		if (window.innerWidth < 768) {
			setSidebarOpen(false)
		}
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
		if (window.innerWidth < 768) {
			setSidebarOpen(false)
		}
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
			} catch (_error) {
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

	// --- Live Audio Chat Handlers ---

	const startRecording = async () => {
		if (audioPlayer) {
			audioPlayer.pause()
			setAudioPlayer(null)
		}
		setIsLiveChatActive(true) // Show AI is thinking/responding
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
			mediaRecorderRef.current = new MediaRecorder(stream)
			audioChunksRef.current = []
			mediaRecorderRef.current.ondataavailable = (event) => {
				audioChunksRef.current.push(event.data)
			}
			mediaRecorderRef.current.onstop = handleAudioSubmit
			mediaRecorderRef.current.start()
			setIsRecording(true)
		} catch (err) {
			console.error("Error accessing microphone:", err)
			alert("Could not access microphone. Please enable it in your browser settings.")
			setIsLiveChatActive(false)
		}
	}

	const stopRecording = () => {
		if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
			mediaRecorderRef.current.stop()
			setIsRecording(false)
		}
	}

	// This effect ensures the microphone stream is stopped after recording finishes.
	useEffect(() => {
		if (!isRecording && mediaRecorderRef.current?.stream) {
			mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
		}
	}, [isRecording])

	const handleAudioSubmit = async () => {
		if (audioChunksRef.current.length === 0) {
			setIsLiveChatActive(false)
			return
		}

		const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
		audioChunksRef.current = []

		const formData = new FormData()
		formData.append("file", audioBlob, "user-audio.webm")
		// Send current history and summary for context
		const historyToSend = summary
			? messages.slice(messages.length - (messages.length % 10))
			: messages
		formData.append("history", JSON.stringify(historyToSend))
		formData.append("summary", summary || "")

		try {
			const response = await fetch("/api/live-chat", {
				method: "POST",
				body: formData,
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(
					errorData.error || "Live chat API request failed"
				)
			}

			// Extract text from headers to update chat history
			const transcribedText = decodeURIComponent(
				response.headers.get("X-Transcribed-Text") || ""
			)
			const textResponse = decodeURIComponent(
				response.headers.get("X-Text-Response") || ""
			)

			if (transcribedText) {
				const userMessage: Message = { role: "user", content: transcribedText }
				const assistantMessage: Message = {
					role: "assistant",
					content: textResponse,
				}
				setMessages((prev) => [...prev, userMessage, assistantMessage])
			}


			const audioBlobResponse = await response.blob()
			const audioUrl = URL.createObjectURL(audioBlobResponse)
			const newAudioPlayer = new Audio(audioUrl)
			setAudioPlayer(newAudioPlayer) // Save player to state to allow interruption
			newAudioPlayer.play()
			newAudioPlayer.onended = () => {
				setIsLiveChatActive(false)
			}
		} catch (error) {
			console.error("Error during live chat:", error)
			const errorMessage: Message = {
				role: "assistant",
				content: "Sorry, I had trouble with that request. Please try again.",
			}
			setMessages((prev) => [...prev, errorMessage])
			setIsLiveChatActive(false)
		}
	}

	// Cleanup effect for audio player
	useEffect(() => {
		return () => {
			if (audioPlayer) {
				audioPlayer.pause()
				URL.revokeObjectURL(audioPlayer.src)
			}
		}
	}, [audioPlayer])


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
			<div className="flex justify-center items-center h-[60vh] bg-gray-50">
				<Loader className="w-8 h-8 animate-spin text-blue-500" />
				<p className="ml-4 text-lg text-gray-600">Loading your experience...</p>
			</div>
		)
	}

	if (!isPremium) {
		return (
			<div className="flex flex-col justify-center items-center h-[80vh] text-center bg-gray-50 p-4">
				<div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
					<Sparkles className="w-16 h-16 mx-auto text-blue-500 mb-4" />
					<h1 className="text-3xl font-bold text-gray-800 mb-2">
						Unlock Your AI Teacher
					</h1>
					<p className="text-gray-600 mb-8">
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
		<div className="flex flex-col md:flex-row w-full h-[calc(100dvh-9rem)] bg-gray-50 relative">
			{/* Mobile Sidebar Overlay */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`
                    fixed inset-y-0 left-0 z-40 w-72 bg-white/90 backdrop-blur-xl border-r border-gray-200
                    transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0 md:w-80 md:inset-auto
                    flex flex-col
                    ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
                `}>
				{/* Sidebar Header */}
				<div className="p-4 border-b border-gray-100 flex justify-between items-center mt-16 md:mt-0">
					<h2 className="text-xl font-bold text-gray-800">Chats</h2>
					<div className="flex gap-2">
						<button
							onClick={handleNewConversation}
							className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all shadow-sm hover:shadow-md"
							title="New Chat">
							<Plus className="w-5 h-5" />
						</button>
						<button
							onClick={() => setSidebarOpen(false)}
							className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full">
							<X className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Conversation List */}
				<div className="flex-1 overflow-y-auto p-3 space-y-2">
					{conversations.length === 0 && (
						<p className="text-center text-gray-400 text-sm mt-10">
							No history yet.
						</p>
					)}
					{conversations.map((convo) => (
						<div
							key={convo.id}
							className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border border-transparent ${
								activeConversationId === convo.id
									? "bg-blue-50 border-blue-100 text-blue-700 shadow-sm"
									: "hover:bg-gray-100 text-gray-700"
							}`}
							onClick={() => fetchConversationMessages(convo.id)}>
							<MessageSquare className={`w-4 h-4 mr-3 flex-shrink-0 ${activeConversationId === convo.id ? 'text-blue-500' : 'text-gray-400'}`} />
							{editingConversationId === convo.id ? (
								<input
									type="text"
									value={editingTitle}
									onChange={(e) => setEditingTitle(e.target.value)}
									onBlur={handleUpdateTitle}
									onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle()}
									className="w-full bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
									autoFocus
									onClick={(e) => e.stopPropagation()}
								/>
							) : (
								<p className="truncate flex-grow text-sm font-medium">{convo.title}</p>
							)}

							<Menu as="div" className="relative inline-block text-left ml-1">
								<Menu.Button
                                    className={`p-1 rounded-full hover:bg-gray-200/50 transition-opacity ${activeConversationId === convo.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
									<MoreVertical className="w-4 h-4" />
								</Menu.Button>
								<Menu.Items className="absolute right-0 mt-1 w-36 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
									<div className="p-1">
										<Menu.Item>
											{({ active }) => (
												<button
													onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRename(convo);
                                                    }}
													className={`group flex w-full items-center rounded-md px-2 py-2 text-xs ${
														active ? "bg-blue-50 text-blue-700" : "text-gray-700"
													}`}>
													<Pencil className="mr-2 h-3 w-3" />
													Rename
												</button>
											)}
										</Menu.Item>
										<Menu.Item>
											{({ active }) => (
												<button
													onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(convo.id);
                                                    }}
													className={`group flex w-full items-center rounded-md px-2 py-2 text-xs ${
														active ? "bg-red-50 text-red-700" : "text-red-600"
													}`}>
													<Trash2 className="mr-2 h-3 w-3" />
													Delete
												</button>
											)}
										</Menu.Item>
									</div>
								</Menu.Items>
							</Menu>
						</div>
					))}
				</div>
			</aside>

			{/* Main Chat Area */}
			<main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white">
				{/* Mobile Header */}
				<div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-10 sticky top-0">
					<button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
						<MenuIcon className="w-6 h-6" />
					</button>
					<span className="font-semibold text-gray-800 truncate max-w-[200px]">
                        {activeConversationId
							? conversations.find((c) => c.id === activeConversationId)?.title
							: "New Chat"}
                    </span>
                    <div className="w-8"></div> {/* Spacer for centering */}
				</div>

				{/* Messages Container */}
				<div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
                    <div className="max-w-4xl mx-auto flex flex-col min-h-full">
                        {messages.length === 0 && !isLoading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500 mt-10 md:mt-0">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                                    <Sparkles className="w-10 h-10 text-blue-500" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                                    How can I help you today?
                                </h2>
                                <p className="max-w-md mx-auto text-gray-500 text-sm md:text-base">
                                    Ask me anything about your subjects, upload notes, or start a voice conversation.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex mb-6 ${
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                }`}>
                                <div
                                    className={`relative px-5 py-3.5 shadow-sm max-w-[90%] md:max-w-2xl text-sm md:text-base leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-blue-600 text-white rounded-[20px] rounded-br-sm"
                                            : "bg-gray-100 text-gray-800 rounded-[20px] rounded-bl-sm border border-gray-200/50"
                                    }`}>
                                    {msg.role === "assistant" ? (
                                        <StyledMarkdown content={msg.content} />
                                    ) : (
                                        <>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {msg.attachments.map((att, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs border border-white/10">
                                                            <FileIcon className="w-3 h-3 mr-2 opacity-70" />
                                                            <span className="truncate max-w-[150px]">{att.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                        </>
                                    )}

                                    {msg.sources && msg.sources.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-gray-300/30">
                                            <p className="text-xs font-semibold mb-1 opacity-70">Sources:</p>
                                            <ul className="text-xs space-y-1 opacity-80">
                                                {msg.sources.map((source, idx) => (
                                                    <li key={idx} className="flex items-center">
                                                        <span className="w-1 h-1 bg-current rounded-full mr-2" />
                                                        {source.title} (Pg. {source.page})
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start mb-6">
                                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-sm border border-gray-200/50">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
				</div>

				{/* Input Area */}
				<div className="p-3 md:p-4 bg-white border-t border-gray-100 relative z-20">
					<div className="max-w-4xl mx-auto">
                        {/* File Attachments Preview */}
						{attachedFiles.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3 px-1">
                                {attachedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center bg-gray-100 border border-gray-200 rounded-lg pl-3 pr-1 py-1.5 text-sm animate-in fade-in slide-in-from-bottom-2">
                                        <FileIcon className="w-3.5 h-3.5 mr-2 text-gray-500" />
                                        <span className="truncate max-w-[100px] md:max-w-xs text-gray-700 font-medium text-xs md:text-sm">{file.file.name}</span>
                                        {file.status === "processing" && (
                                            <Loader className="w-3 h-3 ml-2 animate-spin text-blue-500" />
                                        )}
                                        {file.status === "error" && (
                                            <span className="text-red-500 ml-2 text-xs">Error</span>
                                        )}
                                        <button
                                            onClick={() => removeFile(file.file)}
                                            className="ml-2 p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

						<form
							onSubmit={handleSubmit}
							className="flex items-end gap-2 bg-gray-50 p-1.5 rounded-[26px] border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 transition-all">
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
								className="p-3 text-gray-500 rounded-full hover:bg-white hover:shadow-sm hover:text-blue-500 transition-all disabled:opacity-50 flex-shrink-0 h-[46px] w-[46px] flex items-center justify-center">
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
								placeholder="Ask anything..."
								className="flex-1 py-3 bg-transparent border-none focus:ring-0 text-gray-800 placeholder:text-gray-400 text-base max-h-[100px] overflow-y-auto"
								disabled={isLoading || isUploading}
                                style={{ minHeight: '44px' }}
							/>

                            <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                    type="button"
                                    onMouseDown={startRecording}
                                    onMouseUp={stopRecording}
                                    onTouchStart={startRecording}
                                    onTouchEnd={stopRecording}
                                    className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center h-[46px] w-[46px] ${
                                        isRecording
                                            ? "bg-red-100 text-red-600 animate-pulse"
                                            : isLiveChatActive
                                            ? "bg-amber-100 text-amber-600"
                                            : "text-gray-500 hover:bg-white hover:shadow-sm hover:text-green-600"
                                    }`}
                                    title="Hold to speak"
                                >
                                    {isRecording ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isLoading ||
                                        isUploading ||
                                        !userInput.trim() ||
                                        (attachedFiles.length > 0 &&
                                            attachedFiles.some((f) => f.status !== "completed"))
                                    }
                                    className={`p-3 rounded-full flex items-center justify-center h-[46px] w-[46px] transition-all duration-200 shadow-sm ${
                                        userInput.trim() || attachedFiles.length > 0
                                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}>
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
						</form>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-400">
                                AI can make mistakes. Check important info.
                            </p>
                        </div>
					</div>
				</div>
			</main>
		</div>
	)
}