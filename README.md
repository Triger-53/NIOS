# Vision

Our vision is to become the ultimate online learning platform for NIOS (National Institute of Open Schooling) students, starting with Class 10 and expanding to Class 12. We are dedicated to providing high-quality educational resources in English, with the goal of making learning accessible, engaging, and effective for every student. We aim to empower students to excel in their studies and achieve their academic goals through a combination of free notes, advanced study materials, and a personalized AI-powered learning experience.

## Subscription Plans

We offer three subscription plans to cater to the diverse needs of our students:

### 1. Free Plan

*   **Access to free notes:** Students can read comprehensive notes for all major subjects.
*   **No account required:** Users can start learning immediately without needing to sign up.

### 2. Advance Plan

*   **All features of the Free Plan.**
*   **Access to advance notes:** In-depth and detailed notes for every chapter.
*   **Mind maps:** Visual summaries to help students understand and remember key concepts.
*   **Flashcards:** Interactive flashcards for quick revision of important topics.

### 3. Premium Plan

*   **All features of the Advance Plan.**
*   **Video lectures:** Engaging video lessons from experienced educators.
*   **Quizzes and practice tests:** Interactive quizzes to test knowledge and prepare for exams.
*   **Personalized AI Tutor:** An AI-powered tutor that provides personalized guidance, answers questions, and generates practice problems.

## User Flow

The user journey is designed to be simple and intuitive, allowing students to start learning as quickly as possible.

1.  **First Visit:** When a new user lands on the site, they are greeted with the headline: "Master NIOS Class 10 in 1 Day (English Medium)." Below this, they will find subject cards that lead to free notes.
2.  **Exploring Free Content:** Users can browse and read all free notes without needing an account.
3.  **Upgrading to a Plan:** While exploring, users will encounter opportunities to upgrade to the **Advance** or **Premium** plans for more comprehensive resources.
4.  **Purchase and Sign-up:** To purchase a plan, users will complete the payment process through **Razorpay**. After a successful payment, they will be prompted to sign up for an account using **Supabase** to claim their purchase.
5.  **Authenticated Experience:** Once logged in, the user's dashboard will be personalized:
    *   A welcome message will greet them by name.
    *   The "Log In" button will change to "Sign Out."
    *   The "Get Advance Notes" and "Get Premium Pass" buttons will be replaced with "My Advanced Notes" and "Upgrade to Premium Pass" (for Advance users) or "My Premium Pass" (for Premium users).
6.  **Accessing Paid Content:** Logged-in users can easily navigate to their purchased content, including advanced notes, mind maps, videos, quizzes, and the AI tutor.

## Key Features

*   **Comprehensive Notes:** Detailed and easy-to-understand notes for all major subjects in NIOS Class 10.
*   **AI-Powered Tutor:** A personal AI tutor that can answer questions, generate practice problems, and provide summaries based on the course materials.
*   **Visual Learning Aids:** Mind maps and flashcards to help students visualize complex topics and reinforce their learning.
*   **Interactive Quizzes:** Quizzes and practice tests to help students assess their knowledge and prepare for exams.
*   **Engaging Video Content:** High-quality video lectures from experienced educators to explain difficult concepts.
*   **Tiered Access:** A flexible subscription model that allows students to choose the plan that best suits their needs.
*   **Seamless User Experience:** A clean and intuitive interface that makes it easy for students to find the resources they need.

## Technology Stack

This project will be built using a modern and robust technology stack:

*   **Frontend:** Next.js with TypeScript and Tailwind CSS
*   **Backend:** Node.js
*   **Authentication:** Supabase
*   **Payments:** Razorpay

## Future Goals

We have an exciting roadmap of features and improvements planned for the future:

*   **Expansion to Class 12:** We will be adding a comprehensive curriculum for NIOS Class 12 students.
*   **Additional Subjects:** We will continue to expand our subject offerings for both Class 10 and 12.
*   **Hindi Translation:** To make our content more accessible, we will be providing a Hindi translation of all our resources.
*   **User Feedback System:** We will be implementing a system that allows users to provide reviews and report any mistakes or inaccuracies in the notes.
*   **Student Progress Tracking:** We plan to add a feature that allows students to track their progress and identify areas where they need to improve.
*   **Community Forums:** We will be creating a community forum where students can connect with each other, ask questions, and share their knowledge.

## Content Management

Initially, all educational content, including notes, mind maps, and flashcards, will be managed directly within the source code as Markdown (.md) files. This approach allows for rapid development and easy version control.

As the platform grows, we will explore more scalable solutions, such as a headless CMS, to allow for easier content creation and management without requiring code changes.

## Feedback and Support

We are committed to providing the best possible learning experience for our students. If you have any feedback, suggestions, or would like to report a mistake in the notes, please [provide instructions on how to submit feedback, e.g., "open an issue on our GitHub repository" or "contact us at support@example.com"].
