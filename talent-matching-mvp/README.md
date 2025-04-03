# Talent Matching Platform

A modern web application that matches candidates with companies using AI. Candidates can upload their resumes, which are then matched with companies using advanced AI algorithms.

## Features

- **User Authentication**: Register and login as either a job seeker or a business/employer
- **Profile Management**: View and manage your profile information
- **Resume Upload**: Job seekers can upload their resumes in PDF format
- **AI Matching**: Sophisticated matching between job seekers and businesses

## Technologies Used

### Frontend
- React
- TypeScript
- React Router for navigation
- Chakra UI for modern, responsive design
- Axios for API communication

### Backend
- FastAPI
- Python
- Supabase for database
- PyPDF2 for PDF processing

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)
- Python (version 3.7 or higher)
- FastAPI backend running

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd talent-matching-mvp
```

2. Install frontend dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. The application will be available at http://localhost:3000

## Backend Connection

The frontend is configured to connect to a FastAPI backend at `http://localhost:8000` by default. You can change this by updating the `API_URL` in `src/api/api.ts`.

## Project Structure

```
src/
├── api/              # API services
├── components/       # Reusable components
├── context/          # Context providers (e.g., AuthContext)
├── pages/            # Application pages
├── types/            # TypeScript type definitions
└── ...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
