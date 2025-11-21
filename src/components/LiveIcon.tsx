import React from "react"

const LiveIcon = ({ className }: { className?: string }) => (
	<svg
		viewBox="0 0 130 130"
		xmlns="http://www.w3.org/2000/svg"
		className={className}>
		<defs>
			{/* Glow */}
			<radialGradient id="glow" cx="50%" cy="50%" r="60%">
				<stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.85" />
				<stop offset="70%" stopColor="#6366F1" stopOpacity="0.45" />
				<stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
			</radialGradient>

			{/* Lens gradient */}
			<radialGradient id="lens" cx="50%" cy="50%" r="55%">
				<stop offset="0%" stopColor="#A5D8FF" />
				<stop offset="95%" stopColor="#1E3A8A" />
			</radialGradient>
		</defs>

		{/* Outer bubble */}
		<circle cx="65" cy="65" r="55" fill="url(#glow)" />

		{/* Slash "/" separator */}
		<line
			x1="90"
			y2="35"
			x2="40"
			y1="95"
			stroke="white"
			strokeWidth="6"
			strokeLinecap="round"
			opacity="0.45"
		/>

		{/* CAMERA (bottom-left, fully inside circle) */}
		<g transform="translate(28, 68)">
			<circle cx="22" cy="22" r="20" fill="white" opacity="0.9" />
			<circle cx="22" cy="22" r="10" fill="url(#lens)" />
			<circle cx="22" cy="22" r="4" fill="white" opacity="0.8" />
		</g>

		{/* MIC (top-right, fully inside circle) */}
		<g transform="translate(70, 22)">
			<rect x="8" y="4" width="24" height="32" rx="12" fill="white" opacity="0.9" />
			<line x1="12" y1="14" x2="28" y2="14" stroke="#1E3A8A" strokeWidth="2" opacity="0.7" />
			<line x1="12" y1="21" x2="28" y2="21" stroke="#1E3A8A" strokeWidth="2" opacity="0.7" />
			<line x1="12" y1="28" x2="28" y2="28" stroke="#1E3A8A" strokeWidth="2" opacity="0.7" />
			<rect x="18" y="36" width="8" height="12" rx="3" fill="#1E3A8A" />
		</g>

		{/* LIVE Red Dot (half in, half out) */}
		<circle cx="110" cy="22" r="11" fill="#EF4444">
			<animate attributeName="r" values="10;13;10" dur="1.4s" repeatCount="indefinite" />
		</circle>
	</svg>
)

export default LiveIcon