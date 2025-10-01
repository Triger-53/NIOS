# NIOS Class 10 Learning Platform

A modern web application built with Next.js, TypeScript, Tailwind CSS, and Supabase to help NIOS Class 10 students master their syllabus in just 1 day.

## Features

- 🎓 **Subject-wise Notes**: Comprehensive notes for all major NIOS Class 10 subjects
- 🔐 **User Authentication**: Secure login/register system with Supabase
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🎯 **Quick Learning**: Optimized for fast learning and revision
- 💎 **Premium Content**: Advanced notes and sample papers for premium users
- 📢 **Ad Integration**: Ready for monetization with ad banners

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **UI Components**: Custom components with Radix UI primitives
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nios-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

4. Set up Supabase:
   - Create a new Supabase project
   - Enable authentication
   - Copy your project URL and anon key to the environment variables

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── subjects/          # Subjects listing and individual pages
│   ├── advance-notes/     # Premium advance notes
│   ├── premium/           # Premium content
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # Reusable UI components
│       ├── button.tsx     # Button component
│       ├── card.tsx       # Card component
│       ├── Navbar.tsx     # Navigation bar
│       ├── Footer.tsx     # Footer component
│       ├── AdBanner.tsx   # Ad banner component
│       └── AdSideBanner.tsx # Side ad banner
└── lib/
    ├── supabase.ts        # Supabase client configuration
    ├── supabase-client.ts # Browser client
    ├── supabase-server.ts # Server client
    ├── utils.ts           # Utility functions
    └── subjectList.ts     # Subject data
```

## Features Overview

### Authentication
- User registration and login
- Email verification
- Protected routes for premium content
- Session management

### Content Management
- Subject-wise organization
- Chapter-wise notes structure
- Premium content access control
- Responsive content display

### UI/UX
- Modern, clean design
- Mobile-responsive layout
- Fast loading with Next.js optimization
- Accessible components

## Customization

### Adding New Subjects
Edit `src/lib/subjectList.ts` to add new subjects:

```typescript
export const subjects = [
  {
    slug: "new-subject",
    title: "New Subject (Code)",
    description: "Subject description",
  },
  // ... existing subjects
]
```

### Styling
The app uses Tailwind CSS for styling. Customize the design by:
- Modifying `src/app/globals.css` for global styles
- Updating component styles in individual files
- Using Tailwind's utility classes

### Content
- Add actual subject content in the subject pages
- Implement a CMS or file-based content system
- Add PDF downloads and other resources

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email contact@nios1day.in or create an issue in the repository.

## Roadmap

- [ ] Add actual subject content
- [ ] Implement file uploads for notes
- [ ] Add quiz/test functionality
- [ ] Implement progress tracking
- [ ] Add social features
- [ ] Mobile app development