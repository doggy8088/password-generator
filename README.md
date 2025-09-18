# 🔐 Password Generator

A secure, modern password generator built with React, TypeScript, and GitHub Spark components. This application generates cryptographically secure passwords locally in your browser without storing or transmitting data to any servers.

## ✨ Features

- **Secure Generation**: Uses `crypto.getRandomValues()` for cryptographically secure randomness
- **Customizable Options**: Control length, character types (uppercase, lowercase, numbers, symbols)
- **Strength Indicator**: Real-time password strength analysis
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Local Processing**: All password generation happens in your browser
- **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Development

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions when changes are pushed to the main branch.

### GitHub Pages Setup
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy on push to main

### Manual Deployment
```bash
# Build the project
npm run build

# The dist/ folder contains the deployable files
```

## 📁 Project Structure

```
src/
  ├── App.tsx              # Main application component
  ├── main.tsx             # Application entry point
  ├── prd.md              # Product requirements document
  └── components/         # Reusable UI components
      └── ui/            # Base UI components
```

## 🔧 Configuration

- **Vite**: Modern build tool with hot reload
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **GitHub Spark**: Enterprise UI components
- **Radix UI**: Accessible component primitives

## 📄 License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.