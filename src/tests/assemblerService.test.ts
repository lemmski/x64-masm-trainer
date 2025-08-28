import { assemblerService } from '../assembler/assemblerService';

describe('AssemblerService', () => {
  const validAssemblyCode = `
.data
    msg db "Hello, World!", 0

.code
main proc
    ; Simple program that exits cleanly
    mov rax, 0
    ret
main endp
end
  `;

  const invalidAssemblyCode = `
.code
main proc
    mov invalid_instruction
    ret
main endp
end
  `;

  const dangerousCode = `
.code
main proc
    int 80h  ; Dangerous system call
    ret
main endp
end
  `;

  describe('compileAndRun', () => {
    test('should compile and run valid assembly code', async () => {
      const result = await assemblerService.compileAndRun(validAssemblyCode);

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.exitCode).toBe(0);
    }, 10000);

    test('should handle compilation errors for invalid code', async () => {
      const result = await assemblerService.compileAndRun(invalidAssemblyCode);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    }, 10000);

    test('should reject dangerous code by default', async () => {
      await expect(assemblerService.compileAndRun(dangerousCode)).rejects.toThrow(
        'Code contains potentially dangerous instructions'
      );
    });

    test('should allow dangerous code when explicitly permitted', async () => {
      const result = await assemblerService.compileAndRun(dangerousCode, '', {
        allowSystemCalls: true
      });

      // Even with allowSystemCalls, the code might still fail at runtime
      // but it should pass the validation phase
      expect(result.executionTime).toBeGreaterThan(0);
    }, 10000);

    test('should handle timeout correctly', async () => {
      const infiniteLoopCode = `
.code
main proc
infinite_loop:
    jmp infinite_loop
    ret
main endp
end
      `;

      const result = await assemblerService.compileAndRun(infiniteLoopCode, '', {
        timeout: 1000 // Very short timeout
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/timed out|timeout/i);
    }, 15000);

    test('should handle input correctly', async () => {
      const inputOutputCode = `
.data
    buffer db 256 dup(?)

.code
main proc
    ; Read input (simplified example)
    mov rax, 0
    ret
main endp
end
      `;

      const result = await assemblerService.compileAndRun(inputOutputCode, 'test input');

      expect(result.success).toBe(true);
      expect(result.executionTime).toBeGreaterThan(0);
    }, 10000);
  });

  describe('validateSyntax', () => {
    test('should validate correct syntax', async () => {
      const result = await assemblerService.validateSyntax(validAssemblyCode);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    }, 5000);

    test('should detect syntax errors', async () => {
      const result = await assemblerService.validateSyntax(invalidAssemblyCode);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }, 5000);

    test('should handle empty code', async () => {
      const result = await assemblerService.validateSyntax('');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    }, 5000);
  });

  describe('security features', () => {
    test('should prevent execution of privileged instructions', async () => {
      const privilegedCode = `
.code
main proc
    hlt  ; Privileged instruction
    ret
main endp
end
      `;

      await expect(assemblerService.compileAndRun(privilegedCode)).rejects.toThrow(
        'dangerous instructions'
      );
    });

    test('should prevent control register access', async () => {
      const controlRegisterCode = `
.code
main proc
    mov rax, cr0  ; Control register access
    ret
main endp
end
      `;

      await expect(assemblerService.compileAndRun(controlRegisterCode)).rejects.toThrow(
        'dangerous instructions'
      );
    });

    test('should limit code size', async () => {
      const largeCode = '.code\nmain proc\n' + 'nop\n'.repeat(10000) + 'ret\nmain endp\nend';

      await expect(assemblerService.compileAndRun(largeCode)).rejects.toThrow(
        'Code is too large'
      );
    });
  });
});
