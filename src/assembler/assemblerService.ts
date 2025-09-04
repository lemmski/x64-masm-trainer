import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import { AssemblyResult } from '../shared/types';

const execAsync = promisify(exec);

export interface AssemblerOptions {
  timeout?: number;
  memoryLimit?: number;
  allowSystemCalls?: boolean;
  workingDirectory?: string;
}

export class AssemblerService {
  private readonly tempDir: string;
  private ml64Path!: string;
  private linkPath!: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    // Don't initialize paths immediately to avoid startup crashes
  }

  private ensurePaths(): void {
    if (!this.ml64Path) {
      this.ml64Path = this.findML64Path();
    }
    if (!this.linkPath) {
      this.linkPath = this.findLinkPath();
    }
  }

  private getML64Path(): string {
    this.ensurePaths();
    return this.ml64Path;
  }

  private getLinkPath(): string {
    this.ensurePaths();
    return this.linkPath;
  }

  private findML64Path(): string {
    const possiblePaths = [
      'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\VC\\Tools\\MSVC\\14.35.32215\\bin\\Hostx64\\x64\\ml64.exe',
      'C:\\Program Files\\Microsoft Visual Studio\\2022\\Professional\\VC\\Tools\\MSVC\\14.35.32215\\bin\\Hostx64\\x64\\ml64.exe',
      'C:\\Program Files\\Microsoft Visual Studio\\2022\\Enterprise\\VC\\Tools\\MSVC\\14.35.32215\\bin\\Hostx64\\x64\\ml64.exe',
      'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\VC\\Tools\\MSVC\\14.29.30133\\bin\\Hostx64\\x64\\ml64.exe'
    ];

    // First check hardcoded paths
    for (const ml64Path of possiblePaths) {
      if (fs.existsSync(ml64Path)) {
        return ml64Path;
      }
    }

    // If hardcoded paths don't work, try to find it in PATH using 'where' command
    try {
      const { execSync } = require('child_process');
      const whereOutput = execSync('where ml64.exe', { encoding: 'utf8' });
      const ml64Path = whereOutput.trim().split('\n')[0];
      if (ml64Path && fs.existsSync(ml64Path)) {
        return ml64Path;
      }
    } catch (error) {
      // 'where' command failed, ml64.exe not found in PATH
    }

    // As a last resort, try to use ml64.exe directly (assuming it's in PATH)
    try {
      const { execSync } = require('child_process');
      execSync('ml64.exe /?', { stdio: 'pipe' });
      return 'ml64.exe'; // It's in PATH, use it directly
    } catch (error) {
      // ml64.exe not found
    }

    throw new Error('ML64.exe not found. Please install Visual Studio with C++ build tools.');
  }

  private findLinkPath(): string {
    const possiblePaths = [
      'C:\\Program Files\\Microsoft Visual Studio\\2022\\Community\\VC\\Tools\\MSVC\\14.35.32215\\bin\\Hostx64\\x64\\link.exe',
      'C:\\Program Files\\Microsoft Visual Studio\\2022\\Professional\\VC\\Tools\\MSVC\\14.35.32215\\bin\\Hostx64\\x64\\link.exe',
      'C:\\Program Files\\Microsoft Visual Studio\\2022\\Enterprise\\VC\\Tools\\MSVC\\14.35.32215\\bin\\Hostx64\\x64\\link.exe',
      'C:\\Program Files (x86)\\Microsoft Visual Studio\\2019\\Community\\VC\\Tools\\MSVC\\14.29.30133\\bin\\Hostx64\\x64\\link.exe'
    ];

    // First check hardcoded paths
    for (const linkPath of possiblePaths) {
      if (fs.existsSync(linkPath)) {
        return linkPath;
      }
    }

    // If hardcoded paths don't work, try to find it in PATH using 'where' command
    try {
      const { execSync } = require('child_process');
      const whereOutput = execSync('where link.exe', { encoding: 'utf8' });
      const linkPath = whereOutput.trim().split('\n')[0];
      if (linkPath && fs.existsSync(linkPath)) {
        return linkPath;
      }
    } catch (error) {
      // 'where' command failed, link.exe not found in PATH
    }

    // As a last resort, try to use link.exe directly (assuming it's in PATH)
    try {
      const { execSync } = require('child_process');
      execSync('link.exe /?', { stdio: 'pipe' });
      return 'link.exe'; // It's in PATH, use it directly
    } catch (error) {
      // link.exe not found
    }

    throw new Error('LINK.exe not found. Please install Visual Studio with C++ build tools.');
  }

  async compileAndRun(
    code: string,
    input: string = '',
    options: AssemblerOptions = {}
  ): Promise<AssemblyResult> {
    const {
      timeout = 5000,
      memoryLimit = 100 * 1024 * 1024, // 100MB
      allowSystemCalls = false,
      workingDirectory
    } = options;

    const buildId = `build_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const buildDir = path.join(this.tempDir, buildId);

    try {
      // Create temporary build directory
      await fs.ensureDir(buildDir);

      // Security checks
      await this.validateCode(code, allowSystemCalls);

      // Write assembly code to file
      const asmFile = path.join(buildDir, 'program.asm');
      await fs.writeFile(asmFile, code);

      const startTime = Date.now();

      // Compile assembly code
      const objFile = path.join(buildDir, 'program.obj');
      const compileResult = await this.compileAssembly(asmFile, objFile, buildDir);

      if (!compileResult.success) {
        return {
          success: false,
          output: '',
          error: compileResult.error || 'Compilation failed',
          executionTime: Date.now() - startTime,
          exitCode: 1
        };
      }

      // Link object file
      const exeFile = path.join(buildDir, 'program.exe');
      const linkResult = await this.linkObject(objFile, exeFile, buildDir);

      if (!linkResult.success) {
        return {
          success: false,
          output: '',
          error: linkResult.error || 'Linking failed',
          executionTime: Date.now() - startTime,
          exitCode: 1
        };
      }

      // Execute the program
      const runResult = await this.executeProgram(
        exeFile,
        input,
        buildDir,
        timeout,
        memoryLimit
      );

      const executionTime = Date.now() - startTime;

      return {
        success: runResult.success,
        output: runResult.output || '',
        error: runResult.error,
        executionTime,
        exitCode: runResult.exitCode || 0
      };

    } catch (error) {
      return {
        success: false,
        output: '',
        error: `Internal error: ${error}`,
        executionTime: 0,
        exitCode: 1
      };
    } finally {
      // Clean up temporary files
      try {
        await fs.remove(buildDir);
      } catch (cleanupError) {
        console.warn('Failed to clean up build directory:', cleanupError);
      }
    }
  }

  private async validateCode(code: string, allowSystemCalls: boolean): Promise<void> {
    // Check for dangerous instructions
    const dangerousPatterns = [
      /\b(int\s+0x80|int\s+0x2e)\b/i, // System calls
      /\b(syscall|sysenter)\b/i, // System calls
      /\b(hlt|cli|sti|in\s+eax|out\s+eax)\b/i, // Privileged instructions
      /\b(mov\s+cr0|mov\s+cr3|mov\s+cr4)\b/i, // Control register access
      /\b(rdmsr|wrmsr)\b/i, // Model specific registers
      /\b(lgdt|lidt|sgdt|sidt)\b/i, // Descriptor table operations
    ];

    if (!allowSystemCalls) {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          throw new Error('Code contains potentially dangerous instructions that are not allowed in the learning environment.');
        }
      }
    }

    // Check code size
    if (code.length > 50 * 1024) { // 50KB limit
      throw new Error('Code is too large. Please keep your program under 50KB.');
    }
  }

  private async compileAssembly(
    asmFile: string,
    objFile: string,
    workingDir: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const compileCmd = `"${this.getML64Path()}" /c /Fo"${objFile}" "${asmFile}"`;
      const { stdout, stderr } = await execAsync(compileCmd, {
        cwd: workingDir,
        timeout: 10000
      });

      if (stderr && !stdout.includes('assembling')) {
        return { success: false, error: stderr };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async linkObject(
    objFile: string,
    exeFile: string,
    workingDir: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const linkCmd = `"${this.getLinkPath()}" /SUBSYSTEM:CONSOLE /OUT:"${exeFile}" "${objFile}"`;
      const { stdout, stderr } = await execAsync(linkCmd, {
        cwd: workingDir,
        timeout: 10000
      });

      if (stderr) {
        return { success: false, error: stderr };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async executeProgram(
    exeFile: string,
    input: string,
    workingDir: string,
    timeout: number,
    memoryLimit: number
  ): Promise<{ success: boolean; output?: string; error?: string; exitCode?: number }> {
    try {
      const runCmd = `"${exeFile}"`;

      // Use spawn for better input handling
      const { spawn } = require('child_process');
      const child = spawn(runCmd.split(' ')[0], runCmd.split(' ').slice(1), {
        cwd: workingDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }

      const exitCode = await new Promise<number>((resolve) => {
        child.on('close', (code: number) => {
          resolve(code || 0);
        });
      });

      return {
        success: true,
        output: stdout,
        error: stderr,
        exitCode: 0
      };
    } catch (error: any) {
      let errorMessage = error.message;

      if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Program execution timed out. Check for infinite loops.';
      } else if (error.code === 'ENOBUFS') {
        errorMessage = 'Program used too much memory or produced too much output.';
      }

      return {
        success: false,
        error: errorMessage,
        exitCode: error.code || 1
      };
    }
  }

  async validateSyntax(code: string): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const buildId = `syntax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const buildDir = path.join(this.tempDir, buildId);

    try {
      await fs.ensureDir(buildDir);

      const asmFile = path.join(buildDir, 'syntax_check.asm');
      await fs.writeFile(asmFile, code);

      const compileCmd = `"${this.getML64Path()}" /c /Fo"${path.join(buildDir, 'check.obj')}" "${asmFile}"`;
      const { stdout, stderr } = await execAsync(compileCmd, {
        cwd: buildDir,
        timeout: 5000
      });

      const errors: string[] = [];
      const warnings: string[] = [];

      if (stderr) {
        const lines = stderr.split('\n');
        for (const line of lines) {
          if (line.includes('error')) {
            errors.push(line.trim());
          } else if (line.includes('warning')) {
            warnings.push(line.trim());
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings
      };

    } catch (error: any) {
      return {
        valid: false,
        errors: [error.message],
        warnings: []
      };
    } finally {
      try {
        await fs.remove(buildDir);
      } catch (cleanupError) {
        console.warn('Failed to clean up syntax check directory:', cleanupError);
      }
    }
  }
}

export const assemblerService = new AssemblerService();
