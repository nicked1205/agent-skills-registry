# agent-skills-registy

A full-stack web application for uploading, managing, versioning, and sharing **AI agent skill files** written in Markdown.

---

## ✨ Overview

AI agents often rely on **markdown-based skill files** that include:

- **Frontmatter metadata** (name, description, allowed tools)
- **Instructional content** for task execution

The **Agent Skills Registry** provides a centralized place to:

- Upload and manage skill files
- Automatically parse and surface metadata
- Organize skills using tags
- Share skills publicly or keep them private
- Explore, clone, and download public skills from other users

The focus of this project is **clean system design, correctness, and extensibility**, rather than production hardening.

---

## 🧩 Features

- User authentication (username & password)
- Upload Markdown skill files (private by default)
- Automatic parsing of frontmatter metadata
- Edit and delete skills
- Tagging system for organization
- View personal skill library
- View metadata of each skills
- Make skills public or private
- Browse and search public skills by name and tags
- Download public skill files
- Clone public skill files down to private library
- See edit versions
- See differences between different versions choosable from dropdown
- GitHub-style diffchecker line-level and word-level
- Rollback to a chosen version
- Card-based vs Row-based skill display

---

## 🏗️ Architecture

- Single Page Application (SPA)
- RESTful backend API
- Stateless JWT authentication
- Relational SQL database

---

## 🛠️ Tech Stack

### Frontend

- React + TypeScript
- Vite
- Tailwind CSS

### Backend

- C# .NET 8 (LTS)
- ASP.NET Core Web API
- Entity Framework Core

### Database

- SQLite (local, relational, no secrets required)

---

## 🔐 Security

- Passwords hashed using **PBKDF2 with per-user salts**
- No plaintext password storage
- Protected routes secured via JWT authentication
- Thorough brainstorming and testing to prevent DOS attacks

---

## 🚀 Running the Project Locally

### Prerequisites

- Node.js (18+)
- .NET 8 SDK
- Git

---

### 1. Clone the Repository

```bash
git clone https://github.com/nicked1205/agent-skills-registry.git
cd agent-skills-registry
```

### 2. Clone the Repository

```bash
cd server
dotnet restore
dotnet run
```

Backend will be available at port 5151, navigate to '/swagger' for backend UI.

### 3. Clone the Repository

```bash
cd client
npm install
npm run dev
```

Frontend will be available at port 5173

---

## 🧪 Testing & Quality

- API tested through realistic user workflows
- UI tested against edge cases (long names, tag limits, version rollback)
- Any validations are synced between client-side and server-side
- Code structured for maintainability and future extensibility

The project includes a focused testing document describing how input-driven edge cases and UI behavior were validated, including:

- Extreme and malformed user inputs (long names, gibberish text, tag limits)
- Layout and responsiveness under constrained viewports
- Scroll containment and overflow behavior
- Versioning, diff rendering, and download correctness

📄 **Read more:** [TESTING.md](./TESTING.md)

---

## 🔮 Future Improvements

- Bulk deletion
- Skill ratings and comments
- Project folders
- Workspace for team or organizations
- Full-text search across skill content
- Dependency graphs between skills
- Helper chatbot?

---

## 📐 Design Decisions & Justifications

This project includes a detailed design justification document covering:

- Architectural choices (SPA, stateless backend)
- Authentication and JWT design
- Security decisions and trade-offs
- Versioning and data modeling rationale
- API design and DTO usage
- UX and responsiveness constraints
- Framework and dependency selection

📄 **Read the full document:** [DESIGN.md](./DESIGN.md)
