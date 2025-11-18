"use client"

import { useState } from 'react'

export default function ContactPage() {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [message, setMessage] = useState('')
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submissionStatus, setSubmissionStatus] = useState<
		'success' | 'error' | null
	>(null)

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSubmitting(true)
		setSubmissionStatus(null)

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name, email, message }),
			})

			if (!response.ok) {
				throw new Error('Failed to send message')
			}

			setSubmissionStatus('success')
			setName('')
			setEmail('')
			setMessage('')
		} catch (error) {
			console.error(error)
			setSubmissionStatus('error')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<main className="max-w-3xl mx-auto px-6 py-12 text-gray-900">
			<h1 className="text-3xl font-bold mb-4">Contact Us</h1>
			<p className="mb-4">
				Have feedback, suggestions, or business inquiries (sponsorship, ad
				deals, etc.)?
			</p>
			<p className="mb-4">
				You can email us at:
				<a
					href="mailto:niosinday@gmail.com"
					className="text-blue-600 underline ml-1">
					niosinday@gmail.com
				</a>
			</p>
			<p>We usually reply within 24–48 hours. Thank you for visiting!</p>
			<div className="mt-8 p-6 bg-gray-50 rounded-lg shadow-md">
				<h2 className="text-2xl font-semibold mb-3">
					Send us a message directly!
				</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label
							htmlFor="name"
							className="block text-sm font-medium text-gray-700">
							Your Name
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={name}
							onChange={e => setName(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="John Doe"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700">
							Your Email
						</label>
						<input
							type="email"
							id="email"
							name="email"
							value={email}
							onChange={e => setEmail(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="you@example.com"
							required
						/>
					</div>
					<div>
						<label
							htmlFor="message"
							className="block text-sm font-medium text-gray-700">
							Your Message
						</label>
						<textarea
							id="message"
							name="message"
							rows={5}
							value={message}
							onChange={e => setMessage(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="Tell us what&apos;s on your mind..."
							required></textarea>
					</div>
					<button
						type="submit"
						disabled={isSubmitting}
						className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
						{isSubmitting ? 'Sending...' : 'Send Message'}
					</button>
					{submissionStatus === 'success' && (
						<p className="text-green-600">
							Message sent successfully! We&apos;ll get back to you soon.
						</p>
					)}
					{submissionStatus === 'error' && (
						<p className="text-red-600">
							Failed to send message. Please try again later or email us
							directly.
						</p>
					)}
				</form>
			</div>
		</main>
	)
}