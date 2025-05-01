# Task Management App

A task management web application built using React, TypeScript, Firebase, and TailwindCSS. This app allows users to create, manage, and complete tasks, while storing data in Firebase Firestore.

## Features

- **Task List**: View tasks with descriptions, categories, and completion statuses.
- **Create New Task**: Add new tasks with descriptions, categories, and target dates.
- **Task Completion**: Mark tasks as complete or incomplete.
- **Task/Category Deletion**: Delete single tasks or entire categories.
- **Categorization**: Organize tasks into categories.
- **Firebase Authentication**: Secure user authentication for personalized task management.
- **Cloud Storage**: Data is stored securely in Firebase Firestore.
- **Responsive UI**: Optimized for both desktop and mobile with a collapsible sidebar and dynamic layout adjustments.

## Technologies Used

- **Frontend**:

  - **React.js**: JavaScript library for building user interfaces.
  - **TailwindCSS**: Utility-first CSS framework for rapid UI development.
  - **Firebase**: Real-time database, authentication, and cloud storage.
  - **Vitest**: Testing framework.
  - **TypeScript**: Adds static typing to JavaScript for safer, more maintainable code.

- **Backend**:
  - **Firebase Firestore**: Cloud NoSQL database for storing task data.

## Project Setup

### Prerequisites

Before running the project, ensure that you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [Firebase project](https://console.firebase.google.com/)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (for local development with serverless functions)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository_url>
   cd <project_directory>
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set up Firebase Configuration**:

   - Go to the [Firebase Console](https://console.firebase.google.com/), create a new project, and configure Firebase Authentication and Firestore.
   - Add Firebase credentials to `.env`:

   ```bash
   REACT_APP_FIREBASE_API_KEY=<your-api-key>
   REACT_APP_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
   REACT_APP_FIREBASE_PROJECT_ID=<your-project-id>
   REACT_APP_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
   REACT_APP_FIREBASE_APP_ID=<your-app-id>
   ```

4. **Start the Development Server**:

   If you haven't already, install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

   ```bash
   netlify dev
   ```

   This will launch the app with Netlify Functions enabled (including Firebase config fetch) on `http://localhost:8888`.

### Running Tests

To run tests using Vitest, use the following command:

```bash
npm test
```

Feel free to modify any part of this to fit your actual implementation! This README is designed to provide a clear and comprehensive overview of the project for interview purposes.
