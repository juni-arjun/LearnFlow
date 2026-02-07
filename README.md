# 🚀 LearnFlow: Personalized Learning Roadmap

LearnFlow is an intelligent, full-stack application designed to help developers and learners bridge the gap between their current skills and their dream career.

It automatically analyzes a user's current skill set against industry standards for roles like "Web Developer" or "Data Scientist" and generates a dynamic, interactive roadmap to track their progress.

## ✨ Features

- **🎯 Personalized Onboarding:** Tailored roadmaps based on your specific career goal (e.g., Frontend Dev, DevOps) and experience level.
- **📊 Skill Gap Analysis:** Visually distinguishes between skills you *have* (Owned) and skills you *need* (Missing).
- **📈 Progress Tracking:** Real-time progress bars and percentage completion stats.
- **🔐 Secure Authentication:** Password-less email login system powered by Supabase.
- **💾 Cloud Sync:** All data is persisted in a Supabase PostgreSQL database, so you never lose your progress.
- **📱 Responsive Design:** Built with Tailwind CSS to look great on mobile and desktop.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **Backend/Database:** Supabase (PostgreSQL)
- **State Management:** React Hooks

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/learnflow.git](https://github.com/your-username/learnflow.git)
cd learnflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a .env file in the root directory and add your Supabase credentials:
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup (Supabase)
Run the following SQL query in your Supabase SQL Editor to set up the tables:
```bash
-- Create Users Table
create table users (
  id uuid default uuid_generate_v4() primary key,
  email text unique,
  name text not null,
  target_role text not null,
  experience_level text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create User Skills Table
create table user_skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  skill_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create User Progress Table
create table user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references users(id) on delete cascade not null,
  skill_name text not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, skill_name)
);
```

### 5. Run the App
```bash
npm run dev
```

Open http://localhost:5173 in your browser to see the app!


### 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

Made with ❤️ by Arjun