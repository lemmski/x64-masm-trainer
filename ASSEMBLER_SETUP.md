# x64 MASM Assembler Integration Setup

## Prerequisites

### Required Software
- **Visual Studio 2022** (Community, Professional, or Enterprise) with C++ build tools
- **Windows 10/11** (x64 architecture required)
- **Node.js 18+** and **npm**

### Visual Studio Installation
1. Download and install Visual Studio 2022 from [visualstudio.microsoft.com](https://visualstudio.microsoft.com/)
2. During installation, select the **"Desktop development with C++"** workload
3. Ensure the following components are included:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - C++ ATL for latest v143 build tools
   - Windows 10 SDK (10.0.19041.0) or later

## Setup Instructions

### 1. Verify Installation
After installing Visual Studio, verify that the MASM assembler is available:

```bash
# Check if ML64.exe is in PATH
ml64 /?

# Or check in Visual Studio installation directory
dir "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\*\bin\Hostx64\x64\ml64.exe"
```

### 2. Environment Variables (Optional)
Add Visual Studio build tools to your system PATH:

```bash
# Add to system PATH (run as Administrator)
setx PATH "%PATH%;C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.35.32215\bin\Hostx64\x64"
```

### 3. Install Dependencies
```bash
npm install
cd client && npm install
```

### 4. Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## How It Works

### Compilation Process
1. **Code Validation**: Checks for dangerous instructions and code size limits
2. **Assembly Compilation**: Uses ML64.exe to compile `.asm` files to `.obj` files
3. **Linking**: Uses link.exe to create executable `.exe` files
4. **Execution**: Runs the executable in a sandboxed environment
5. **Cleanup**: Removes temporary files after execution

### Security Features
- **Instruction Filtering**: Blocks privileged instructions (HLT, CLI, STI, etc.)
- **System Call Prevention**: Prevents INT 80h and syscall instructions
- **Control Register Protection**: Blocks access to CR0, CR3, CR4
- **Resource Limits**: 5-second timeout, 100MB memory limit, 50KB code limit
- **Sandboxing**: All execution happens in isolated temporary directories

### Error Handling
- **Compilation Errors**: Syntax errors and assembler warnings
- **Runtime Errors**: Execution failures and crashes
- **Security Violations**: Attempts to use dangerous instructions
- **Resource Limits**: Timeout and memory limit violations

## Testing

Run the test suite to verify assembler integration:

```bash
npm test -- src/tests/assemblerService.test.ts
```

## Troubleshooting

### Common Issues

#### 1. "ML64.exe not found"
**Solution**: Ensure Visual Studio C++ build tools are properly installed and accessible.

#### 2. "Code contains potentially dangerous instructions"
**Solution**: Remove privileged instructions or enable `allowSystemCalls` for advanced users (not recommended for learning).

#### 3. "Program execution timed out"
**Solution**: Check for infinite loops in your assembly code.

#### 4. "Compilation failed"
**Solution**: Check assembly syntax and ensure all required directives are present.

### Debug Mode
Enable detailed logging by setting the environment variable:

```bash
set DEBUG=assembler:*
npm run dev
```

## Architecture

```
src/assembler/
├── assemblerService.ts    # Main assembler service
└── ...

src/server/routes/
└── assembler.ts          # HTTP API endpoints

temp/                     # Temporary build files (auto-cleaned)
└── build_*/             # Isolated build directories
    ├── program.asm      # Source code
    ├── program.obj      # Object file
    └── program.exe      # Executable
```

## API Endpoints

### POST /api/assembler/compile
Compile and execute assembly code.

**Request Body:**
```json
{
  "code": "assembly code here",
  "input": "optional stdin input",
  "timeout": 5000,
  "allowSystemCalls": false
}
```

**Response:**
```json
{
  "success": true,
  "output": "program output",
  "error": null,
  "executionTime": 125,
  "exitCode": 0
}
```

### POST /api/assembler/validate
Validate assembly syntax without execution.

**Request Body:**
```json
{
  "code": "assembly code here"
}
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": []
}
```
