# x64 MASM Trainer

An interactive, web-based learning platform for x64 assembly programming using Microsoft MASM (Macro Assembler). Master assembly language through structured lessons, hands-on exercises, and comprehensive automated testing.

![x64 MASM Trainer](https://img.shields.io/badge/Assembly-x64--MASM-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

### 🎓 Learning Experience
- **Structured Curriculum** - Progressive lessons from basics to advanced concepts
- **Interactive Code Editor** - Monaco Editor with MASM syntax highlighting
- **Real-time Testing** - Instant feedback with automated test suites
- **Comprehensive Grading** - Detailed assessment with performance analysis
- **Progress Tracking** - Visual progress indicators and achievement system

### 🧪 Testing & Validation
- **Automated Testing** - Run test suites with multiple validation types
- **Performance Benchmarking** - Execution time and efficiency analysis
- **Security Analysis** - Detection of dangerous instructions and vulnerabilities
- **Code Quality Assessment** - Instruction diversity and documentation analysis
- **Custom Test Cases** - Create and validate your own test scenarios

### 🛡️ Safety & Security
- **Sandboxed Execution** - Isolated assembly compilation and execution
- **Resource Limits** - CPU time and memory restrictions
- **Security Validation** - Prevention of dangerous system calls
- **Input Sanitization** - Protection against malicious code patterns

## 📋 Prerequisites

### Required Software
- **Operating System**: Windows 10/11 (x64 architecture)
- **Visual Studio 2022** with C++ build tools
- **Node.js 18+** and npm
- **Git** for version control

### Hardware Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Processor**: x64-compatible CPU

### Visual Studio Setup
1. Download and install [Visual Studio 2022 Community](https://visualstudio.microsoft.com/)
2. During installation, select **"Desktop development with C++"**
3. Ensure these components are included:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - C++ ATL for latest v143 build tools
   - Windows 10 SDK (latest version)

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/lemmski/x64-masm-trainer.git
cd x64-masm-trainer
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Set up Visual Studio Environment
```bash
# Run this command in a new Command Prompt window to set up the environment:
%comspec% /k "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"

# OR use the provided batch file:
start-dev.bat
```

### 4. Verify MASM Installation
```bash
# After setting up the environment, verify ML64.exe is available
ml64 /?

# If not found, it will be located automatically by the application
```

### 4.5 Verify Tailwind CSS Setup
```bash
# Check if Tailwind CSS v4 is properly configured
cd client && npm list tailwindcss
# Should show: tailwindcss@4.1.12

# Check if Vite plugin is installed
cd client && npm list @tailwindcss/vite
# Should show: @tailwindcss/vite@4.1.12
```

### 5. Build the Application
```bash
# Build both server and client
npm run build
```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
# Option 1: Use the provided batch file (recommended)
start-dev.bat

# Option 2: Manual setup - First run this in a separate Command Prompt:
%comspec% /k "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"
# Then in another terminal:
npm run dev
```

This will start:
- **Backend Server**: http://localhost:3001
- **Frontend Client**: http://localhost:5173

### Production Mode
```bash
# Build and start production server
npm run build
npm start
```

The application will be available at: http://localhost:3001

### Manual Startup
```bash
# First, set up Visual Studio environment in a new Command Prompt:
%comspec% /k "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat"

# Terminal 1: Start the backend server (in the VS environment)
npm run dev:server

# Terminal 2: Start the frontend client
cd client && npm run dev
```

## 📖 Usage

### Getting Started
1. **Open your browser** and navigate to the application URL
2. **Select a lesson** from the sidebar to begin learning
3. **Read the lesson content** and understand the concepts
4. **Start an exercise** by clicking on it in the lesson view
5. **Write your code** in the interactive editor
6. **Test your solution** using the Test Runner

### Using the Code Editor
- **Syntax Highlighting**: Automatic MASM syntax highlighting
- **Error Detection**: Real-time compilation error detection
- **Code Completion**: Context-aware suggestions
- **Multiple Views**: Toggle between Code Editor and Test Runner

### Running Tests
1. **Quick Test**: Use the "Quick Test" button for instant validation
2. **Full Test Suite**: Click "Run Full Suite" for comprehensive testing
3. **View Results**: Check the Test Results tab for detailed feedback
4. **Review Grade**: See your performance breakdown in the Grade tab
5. **Get Feedback**: Read personalized recommendations in the Feedback tab

### Understanding Test Results
- **✅ PASS**: Test case passed successfully
- **❌ FAIL**: Test case failed - check expected vs actual output
- **Performance**: Execution time and efficiency metrics
- **Quality**: Code structure and documentation analysis
- **Security**: Detection of potentially dangerous instructions

## 🏗️ Architecture

```
x64-masm-trainer/
├── src/
│   ├── server/           # Backend Node.js/Express server
│   │   ├── routes/       # API endpoints
│   │   ├── database.ts   # SQLite database setup
│   │   └── index.ts      # Server entry point
│   ├── assembler/        # Assembly compilation service
│   │   └── assemblerService.ts
│   ├── lessons/          # Learning content management
│   │   ├── lessonService.ts
│   │   └── lessonFactory.ts
│   ├── tests/            # Testing and grading system
│   │   ├── testingService.ts
│   │   ├── testRunner.ts
│   │   ├── gradingService.ts
│   │   └── testCaseGenerator.ts
│   └── shared/           # Shared types and interfaces
│       └── types.ts
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   └── App.tsx       # Main application component
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── temp/                 # Temporary build files (auto-cleaned)
└── data/                 # SQLite database files
```

### Core Components

#### Backend Services
- **AssemblerService**: Handles compilation and execution of MASM code
- **LessonService**: Manages learning content and progress tracking
- **TestingService**: Executes test suites and validates solutions
- **GradingService**: Provides detailed assessment and feedback

#### Frontend Components
- **App**: Main application container with routing
- **Header**: Navigation and branding
- **Sidebar**: Lesson navigation and progress display
- **CodeEditor**: Interactive coding environment with Monaco Editor
- **TestRunner**: Comprehensive testing interface
- **LessonViewer**: Educational content display

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_PATH=./data/trainer.db

# Assembly Configuration
ML64_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.35.32215\bin\Hostx64\x64\ml64.exe
LINK_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.35.32215\bin\Hostx64\x64\link.exe

# Security Configuration
MAX_EXECUTION_TIME=5000
MAX_MEMORY_USAGE=104857600
ALLOW_SYSTEM_CALLS=false
```

### Database Setup
The application uses SQLite and will automatically:
- Create the database file on first run
- Set up tables for users, lessons, exercises, and progress
- Seed initial lesson and exercise data

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Test Coverage
```bash
# Generate coverage report
npm run test:coverage
```

### Manual Testing
1. **Start the application** in development mode
2. **Navigate through lessons** and complete exercises
3. **Test different scenarios**:
   - Valid assembly code compilation
   - Error handling for invalid code
   - Performance testing with various inputs
   - Security validation with dangerous instructions

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install && cd client && npm install`
4. Make your changes
5. Add tests for new functionality
6. Ensure all tests pass: `npm test`
7. Commit your changes: `git commit -m 'Add amazing feature'`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing code style and naming conventions
- Add JSDoc comments for public APIs
- Write comprehensive unit tests
- Update documentation for new features

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed steps to reproduce
- Include error messages and screenshots
- Specify your environment (OS, Node.js version, etc.)

## 📚 Educational Content

### Lesson Categories
- **Basic Assembly Syntax** - Program structure, comments, directives
- **Working with Registers** - Data movement, register operations
- **Arithmetic Operations** - Addition, subtraction, multiplication, division
- **Memory Operations** - Arrays, pointers, data structures
- **Control Flow** - Conditionals, loops, jumps
- **Functions & Procedures** - Subroutines, stack management

### Exercise Difficulty Levels
- **Easy** (⭐): Basic concepts and simple operations
- **Medium** (⭐⭐): Intermediate techniques and algorithms
- **Hard** (⭐⭐⭐): Advanced concepts and optimizations

### Learning Path
1. Start with Basic Assembly Syntax
2. Master register operations and arithmetic
3. Learn memory management and data structures
4. Understand control flow and program logic
5. Create functions and modular programs
6. Optimize code for performance and efficiency

## 🔒 Security

### Assembly Code Safety
- **Instruction Filtering**: Blocks privileged and dangerous instructions
- **System Call Prevention**: Prevents direct OS API calls
- **Resource Limits**: Restricts execution time and memory usage
- **Input Validation**: Sanitizes all user-provided code and data

### Application Security
- **XSS Protection**: Sanitized user input and output
- **CSRF Protection**: Secure API endpoints
- **Input Validation**: Comprehensive validation of all inputs
- **Error Handling**: Safe error messages without information disclosure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Microsoft MASM** for the assembly compiler
- **Monaco Editor** for the code editing experience
- **React & TypeScript** for the robust frontend framework
- **Express.js** for the scalable backend API
- **Tailwind CSS** for the beautiful UI components

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting Guide](docs/troubleshooting.md)
2. Search existing [GitHub Issues](https://github.com/your-username/x64-masm-trainer/issues)
3. Create a new issue with detailed information
4. Join our [Discord Community](https://discord.gg/x64masm) for discussions

## 🎯 Future Roadmap

### Planned Features
- [ ] **Advanced Lessons** - More complex programming concepts
- [ ] **Collaborative Coding** - Multi-user coding sessions
- [ ] **Code Sharing** - Community code repository
- [ ] **Mobile Support** - Responsive design for mobile devices
- [ ] **Integration APIs** - Connect with external learning platforms
- [ ] **Performance Analytics** - Detailed learning analytics
- [ ] **Custom Lesson Builder** - Create your own learning content
- [ ] **Multi-language Support** - Support for other assembly dialects

### Technical Improvements
- [ ] **WebAssembly Support** - Run assembly code in the browser
- [ ] **Real-time Collaboration** - Live coding with multiple users
- [ ] **AI-Powered Feedback** - Intelligent code review suggestions
- [ ] **Performance Profiling** - Advanced performance analysis tools
- [ ] **Plugin System** - Extensible architecture for custom features

---

**Happy Learning!** 🚀

Master the art of x64 assembly programming with our comprehensive, interactive learning platform. From basic instructions to advanced optimization techniques, we've got everything you need to become an assembly programming expert.
