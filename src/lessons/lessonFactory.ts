import { Lesson, Exercise, TestCase, Difficulty, ExerciseDifficulty } from '../shared/types';
import { lessonService } from './lessonService';
import { v4 as uuidv4 } from 'uuid';

export class LessonFactory {
  /**
   * Create all sample lessons and exercises
   */
  async createSampleLessons(): Promise<void> {
    console.log('🌱 Creating sample lessons...');

    const lessons = [
      await this.createBasicSyntaxLesson(),
      await this.createRegistersLesson(),
      await this.createArithmeticLesson(),
      await this.createMemoryLesson(),
      await this.createControlFlowLesson(),
      await this.createFunctionsLesson()
    ];

    console.log(`✅ Created ${lessons.length} sample lessons`);
  }

  /**
   * Lesson 1: Basic Assembly Syntax
   */
  private async createBasicSyntaxLesson(): Promise<Lesson> {
    const exercises = [
      this.createHelloWorldExercise(),
      this.createCommentsExercise(),
      this.createDirectivesExercise()
    ];

    const lesson: Omit<Lesson, 'id'> = {
      title: 'Basic Assembly Syntax',
      description: 'Learn the fundamental structure and syntax of x64 MASM assembly language',
      difficulty: 'beginner' as Difficulty,
      estimatedTime: 30,
      tags: ['basics', 'syntax', 'structure'],
      prerequisites: [],
      exercises,
      content: {
        sections: [
          {
            id: uuidv4(),
            title: 'Assembly Program Structure',
            content: `
Assembly programs follow a specific structure that helps organize code and data:

**Program Sections:**
- **.data** - Contains variable declarations and initialized data
- **.code** - Contains the actual program instructions
- **main proc/endp** - Defines the main program procedure
- **end** - Marks the end of the program

**Basic Template:**
\`\`\`masm
.data
    ; Variable declarations go here

.code
main proc
    ; Program instructions go here
    ret
main endp
end
\`\`\`
            `,
            codeExamples: [
              {
                title: 'Minimal Assembly Program',
                code: `.data
    ; No data needed for this simple program

.code
main proc
    ; This is a comment
    mov rax, 0    ; Move 0 into RAX register
    ret           ; Return from procedure
main endp
end`,
                explanation: 'This is the simplest possible assembly program that does nothing but return successfully.'
              }
            ]
          },
          {
            id: uuidv4(),
            title: 'Comments and Documentation',
            content: `
Comments are essential for making your code understandable:

**Comment Syntax:**
- **;** - Single line comment (everything after ; is ignored)
- Comments can appear anywhere in the code
- Use comments to explain what each section does

**Best Practices:**
- Comment complex logic
- Explain register usage
- Document function parameters and return values
            `,
            codeExamples: [
              {
                title: 'Well Commented Program',
                code: `.data
    message db "Hello!", 0  ; Null-terminated string

.code
main proc
    ; Display greeting message
    ; (implementation would go here)

    mov rax, 0              ; Set return code to 0 (success)
    ret                     ; Return to calling program
main endp
end`,
                explanation: 'This example shows how to use comments to document your code.'
              }
            ]
          }
        ],
        summary: 'You\'ve learned the basic structure of assembly programs including sections, procedures, and comments.',
        keyConcepts: [
          'Program structure (.data, .code, main proc)',
          'Comments using ;',
          'Basic directives (db, dw, dd, dq)',
          'Program termination (ret, end)'
        ]
      }
    };

    return await lessonService.createLesson(lesson);
  }

  /**
   * Exercise 1.1: Hello World
   */
  private createHelloWorldExercise(): Exercise {
    const testCases: TestCase[] = [
      {
        id: uuidv4(),
        input: '',
        expectedOutput: 'Hello, World!',
        description: 'Program should output "Hello, World!"',
        isHidden: false
      }
    ];

    return {
      id: uuidv4(),
      title: 'Hello World Program',
      description: 'Write a program that displays "Hello, World!" message',
      starterCode: `.data
    msg db "Hello, World!", 0

.code
main proc
    ; TODO: Display the message
    ; Hint: Use appropriate system calls or library functions

    ret
main endp
end`,
      testCases,
      hints: [
        'You need to use a system call to display text',
        'The message is already defined in the .data section as "msg"',
        'Look up the WriteConsole or printf equivalent in assembly'
      ],
      solution: `.data
    msg db "Hello, World!", 0

.code
main proc
    ; Display the message using system call
    mov rax, 1        ; syscall: write
    mov rdi, 1        ; file descriptor: stdout
    lea rsi, msg      ; pointer to message
    mov rdx, 13       ; message length
    syscall

    ret
main endp
end`,
      difficulty: 'easy' as ExerciseDifficulty,
      points: 10
    };
  }

  /**
   * Exercise 1.2: Comments
   */
  private createCommentsExercise(): Exercise {
    const testCases: TestCase[] = [
      {
        id: uuidv4(),
        input: '',
        expectedOutput: '',
        description: 'Program should compile and run without errors',
        isHidden: false
      }
    ];

    return {
      id: uuidv4(),
      title: 'Using Comments',
      description: 'Add appropriate comments to explain what each instruction does',
      starterCode: `.data
    value db 42

.code
main proc
    mov rax, 0
    mov al, value
    add al, 8
    ret
main endp
end`,
      testCases,
      hints: [
        'Add comments after each instruction explaining its purpose',
        'Explain what registers are being used and why',
        'Document the program\'s overall purpose'
      ],
      solution: `.data
    value db 42          ; Initialize a byte variable with value 42

.code
main proc
    mov rax, 0          ; Clear RAX register (set to 0)
    mov al, value       ; Load the value from memory into AL register
    add al, 8           ; Add 8 to the value in AL register
    ret                 ; Return from the procedure
main endp
end`,
      difficulty: 'easy' as ExerciseDifficulty,
      points: 10
    };
  }

  /**
   * Exercise 1.3: Data Directives
   */
  private createDirectivesExercise(): Exercise {
    const testCases: TestCase[] = [
      {
        id: uuidv4(),
        input: '',
        expectedOutput: '42',
        description: 'Program should output the correct value',
        isHidden: false
      }
    ];

    return {
      id: uuidv4(),
      title: 'Data Directives',
      description: 'Define variables using different data directives (db, dw, dd, dq)',
      starterCode: `.data
    ; Define variables of different sizes
    byteVar db ?
    wordVar dw ?
    dwordVar dd ?
    qwordVar dq ?

.code
main proc
    ; Load values into variables
    ; Display the result
    ret
main endp
end`,
      testCases,
      hints: [
        'Use db for bytes, dw for words (2 bytes), dd for double words (4 bytes), dq for quad words (8 bytes)',
        'Initialize the variables with appropriate values',
        'Use the correct register sizes to work with each variable type'
      ],
      solution: `.data
    byteVar db 42         ; Define a byte variable
    wordVar dw 420        ; Define a word variable
    dwordVar dd 4200      ; Define a double word variable
    qwordVar dq 42000     ; Define a quad word variable

.code
main proc
    ; Load byte value and display it
    mov al, byteVar
    ; (Display logic would go here)

    ret
main endp
end`,
      difficulty: 'medium' as ExerciseDifficulty,
      points: 15
    };
  }

  /**
   * Lesson 2: Working with Registers
   */
  private async createRegistersLesson(): Promise<Lesson> {
    const exercises = [
      this.createRegisterOperationsExercise(),
      this.createDataTransferExercise(),
      this.createRegisterSizeExercise()
    ];

    const lesson: Omit<Lesson, 'id'> = {
      title: 'Working with Registers',
      description: 'Understanding CPU registers and basic data movement instructions',
      difficulty: 'beginner' as Difficulty,
      estimatedTime: 45,
      tags: ['registers', 'mov', 'data'],
      prerequisites: ['basic-syntax-lesson-id'],
      exercises,
      content: {
        sections: [
          {
            id: uuidv4(),
            title: 'x64 Registers Overview',
            content: `
x64 processors have 16 general-purpose registers, each 64 bits wide:

**General Purpose Registers:**
- **RAX** - Accumulator (return values, arithmetic)
- **RBX** - Base register (pointers, data access)
- **RCX** - Counter register (loops, string operations)
- **RDX** - Data register (arithmetic, I/O operations)
- **RSI** - Source Index (string operations)
- **RDI** - Destination Index (string operations)
- **RSP** - Stack Pointer (stack management)
- **RBP** - Base Pointer (stack frames)

**Register Parts:**
- Full 64-bit: RAX, RBX, etc.
- Lower 32-bit: EAX, EBX, etc.
- Lower 16-bit: AX, BX, etc.
- Lower 8-bit: AL, BL, etc. (and AH, BH, etc.)
            `,
            codeExamples: [
              {
                title: 'Register Usage Example',
                code: `.data
    value dq 100

.code
main proc
    mov rax, 50        ; Load immediate value into RAX
    mov rbx, value     ; Load memory value into RBX
    add rax, rbx       ; Add RBX to RAX
    ; Result: RAX = 150

    ret
main endp
end`,
                explanation: 'This example shows how to work with different registers and load values from memory.'
              }
            ]
          },
          {
            id: uuidv4(),
            title: 'MOV Instruction',
            content: `
The MOV instruction copies data between registers, memory, and immediate values:

**MOV Syntax:**
\`\`\`masm
mov destination, source
\`\`\`

**Valid Combinations:**
- Register to register: \`mov rax, rbx\`
- Immediate to register: \`mov rax, 42\`
- Memory to register: \`mov rax, [variable]\`
- Register to memory: \`mov [variable], rax\`

**Important Notes:**
- Cannot move memory directly to memory
- Immediate values cannot be larger than register size
- Always specify operand size when ambiguous
            `,
            codeExamples: [
              {
                title: 'MOV Instruction Examples',
                code: `.data
    source dq 100
    dest dq 0

.code
main proc
    ; Register to register
    mov rax, 42         ; Immediate to register
    mov rbx, rax        ; Register to register

    ; Memory operations
    mov rcx, source     ; Load address into RCX
    mov rdx, [rcx]      ; Load value from memory
    mov dest, rdx       ; Store value to memory

    ret
main endp
end`,
                explanation: 'Demonstrates different ways to use the MOV instruction.'
              }
            ]
          }
        ],
        summary: 'You\'ve learned about x64 registers, their sizes, and how to use the MOV instruction for data transfer.',
        keyConcepts: [
          'General-purpose registers (RAX, RBX, RCX, RDX, etc.)',
          'Register sizes (64-bit, 32-bit, 16-bit, 8-bit)',
          'MOV instruction syntax and usage',
          'Data transfer between registers and memory'
        ]
      }
    };

    return await lessonService.createLesson(lesson);
  }

  /**
   * Exercise 2.1: Register Operations
   */
  private createRegisterOperationsExercise(): Exercise {
    const testCases: TestCase[] = [
      {
        id: uuidv4(),
        input: '',
        expectedOutput: '15',
        description: 'Program should output the result of register operations',
        isHidden: false
      }
    ];

    return {
      id: uuidv4(),
      title: 'Register Operations',
      description: 'Perform arithmetic operations using registers',
      starterCode: `.data
    result dq 0

.code
main proc
    ; Load initial values
    mov rax, 5
    mov rbx, 10

    ; TODO: Add the values and store result

    ret
main endp
end`,
      testCases,
      hints: [
        'Use ADD instruction to add two register values',
        'Store the result in memory or use it for output',
        'Remember to use the correct register sizes'
      ],
      solution: `.data
    result dq 0

.code
main proc
    ; Load initial values
    mov rax, 5
    mov rbx, 10

    ; Add the values
    add rax, rbx       ; RAX = 5 + 10 = 15

    ; Store result
    mov result, rax

    ret
main endp
end`,
      difficulty: 'easy' as ExerciseDifficulty,
      points: 10
    };
  }

  /**
   * Exercise 2.2: Data Transfer
   */
  private createDataTransferExercise(): Exercise {
    const testCases: TestCase[] = [
      {
        id: uuidv4(),
        input: '',
        expectedOutput: 'Data transferred successfully',
        description: 'Program should transfer data between registers and memory',
        isHidden: false
      }
    ];

    return {
      id: uuidv4(),
      title: 'Data Transfer Operations',
      description: 'Move data between different locations using MOV instruction',
      starterCode: `.data
    source dq 42
    destination dq 0
    temp dq 0

.code
main proc
    ; TODO: Transfer data from source to destination using a temporary register

    ret
main endp
end`,
      testCases,
      hints: [
        'Load the value from source memory into a register',
        'Use an intermediate register for the transfer',
        'Store the value into the destination memory location'
      ],
      solution: `.data
    source dq 42
    destination dq 0
    temp dq 0

.code
main proc
    ; Transfer data using registers
    mov rax, source    ; Load address of source
    mov rbx, [rax]     ; Load value from source
    mov temp, rbx      ; Store in temporary location
    mov destination, rbx ; Store in destination

    ret
main endp
end`,
      difficulty: 'medium' as ExerciseDifficulty,
      points: 15
    };
  }

  /**
   * Exercise 2.3: Register Sizes
   */
  private createRegisterSizeExercise(): Exercise {
    const testCases: TestCase[] = [
      {
        id: uuidv4(),
        input: '',
        expectedOutput: '255',
        description: 'Program should handle different register sizes correctly',
        isHidden: false
      }
    ];

    return {
      id: uuidv4(),
      title: 'Register Size Operations',
      description: 'Work with different register sizes (byte, word, dword, qword)',
      starterCode: `.data
    byte_val db 255
    word_val dw 65535
    result dq 0

.code
main proc
    ; TODO: Load values of different sizes and combine them

    ret
main endp
end`,
      testCases,
      hints: [
        'Use AL for byte operations, AX for word operations',
        'Be careful about sign extension when mixing sizes',
        'Use appropriate MOV variants (MOVZX, MOVSX) if needed'
      ],
      solution: `.data
    byte_val db 255
    word_val dw 65535
    result dq 0

.code
main proc
    ; Load byte value into AL
    mov al, byte_val

    ; Load word value into BX
    mov bx, word_val

    ; Combine values (example)
    movzx rax, al      ; Zero-extend AL to RAX
    movzx rbx, bx      ; Zero-extend BX to RBX

    ; Store result
    mov result, rax

    ret
main endp
end`,
      difficulty: 'medium' as ExerciseDifficulty,
      points: 15
    };
  }

  /**
   * Lesson 3: Arithmetic Operations
   */
  private async createArithmeticLesson(): Promise<Lesson> {
    const exercises = [
      this.createBasicArithmeticExercise(),
      this.createMultiplicationDivisionExercise(),
      this.createFlagsExercise()
    ];

    const lesson: Omit<Lesson, 'id'> = {
      title: 'Arithmetic Operations',
      description: 'Performing mathematical operations in assembly language',
      difficulty: 'beginner' as Difficulty,
      estimatedTime: 60,
      tags: ['arithmetic', 'math', 'flags'],
      prerequisites: ['registers-lesson-id'],
      exercises,
      content: {
        sections: [
          {
            id: uuidv4(),
            title: 'Basic Arithmetic Instructions',
            content: `
Assembly provides instructions for basic arithmetic operations:

**Addition:**
- \`ADD destination, source\` - Add source to destination
- \`ADC destination, source\` - Add with carry flag

**Subtraction:**
- \`SUB destination, source\` - Subtract source from destination
- \`SBB destination, source\` - Subtract with borrow

**Increment/Decrement:**
- \`INC destination\` - Increment by 1
- \`DEC destination\` - Decrement by 1

**Negation:**
- \`NEG destination\` - Two's complement negation

All arithmetic operations affect the flags register, which can be used for conditional operations.
            `,
            codeExamples: [
              {
                title: 'Basic Arithmetic Example',
                code: `.data
    a dq 10
    b dq 20
    sum dq 0
    diff dq 0

.code
main proc
    ; Addition
    mov rax, a
    mov rbx, b
    add rax, rbx      ; RAX = a + b
    mov sum, rax

    ; Subtraction
    mov rax, b
    mov rbx, a
    sub rax, rbx      ; RAX = b - a
    mov diff, rax

    ret
main endp
end`,
                explanation: 'Demonstrates basic addition and subtraction operations.'
              }
            ]
          },
          {
            id: uuidv4(),
            title: 'Multiplication and Division',
            content: `
Multiplication and division operations are more complex:

**Multiplication:**
- \`MUL source\` - Unsigned multiplication (RAX * source → RDX:RAX)
- \`IMUL source\` - Signed multiplication

**Division:**
- \`DIV source\` - Unsigned division (RDX:RAX ÷ source)
- \`IDIV source\` - Signed division

**Important Notes:**
- MUL/IMUL multiply the accumulator (RAX) by the source
- For byte operations, AL * source → AX
- For word operations, AX * source → DX:AX
- For doubleword operations, EAX * source → EDX:EAX
- For quadword operations, RAX * source → RDX:RAX

Division requires dividend in RDX:RAX (or appropriate register pairs) and produces quotient in RAX and remainder in RDX.
            `,
            codeExamples: [
              {
                title: 'Multiplication Example',
                code: `.data
    factor1 dq 25
    factor2 dq 4
    product dq 0

.code
main proc
    ; Unsigned multiplication
    mov rax, factor1  ; Load first factor
    mov rbx, factor2  ; Load second factor
    mul rbx           ; RAX = RAX * RBX = 25 * 4 = 100
    mov product, rax  ; Store result

    ret
main endp
end`,
                explanation: 'Shows how to perform multiplication using the MUL instruction.'
              },
              {
                title: 'Division Example',
                code: `.data
    dividend dq 100
    divisor dq 7
    quotient dq 0
    remainder dq 0

.code
main proc
    ; Unsigned division
    mov rax, dividend ; Load dividend
    mov rdx, 0        ; Clear upper bits for 64-bit division
    mov rbx, divisor  ; Load divisor
    div rbx           ; Divide RDX:RAX by RBX
                      ; Quotient in RAX, remainder in RDX

    mov quotient, rax
    mov remainder, rdx

    ret
main endp
end`,
                explanation: 'Demonstrates division with quotient and remainder calculation.'
              }
            ]
          }
        ],
        summary: 'You\'ve learned arithmetic operations including addition, subtraction, multiplication, and division.',
        keyConcepts: [
          'ADD, SUB, INC, DEC instructions',
          'MUL, IMUL for multiplication',
          'DIV, IDIV for division',
          'How arithmetic affects flags',
          'Register pairs for multiplication/division'
        ]
      }
    };

    return await lessonService.createLesson(lesson);
  }

  /**
   * Exercise 3.1: Basic Arithmetic
   */
  private createBasicArithmeticExercise(): Exercise {
    const testCases: TestCase[] = [
      {
        id: uuidv4(),
        input: '',
        expectedOutput: '25',
        description: 'Program should calculate and display the result of (10 + 5) * 3',
        isHidden: false
      }
    ];

    return {
      id: uuidv4(),
      title: 'Basic Arithmetic Operations',
      description: 'Calculate the expression: (10 + 5) * 3 using assembly instructions',
      starterCode: `.data
    result dq 0

.code
main proc
    ; TODO: Calculate (10 + 5) * 3
    ; Store the result in the result variable

    ret
main endp
end`,
      testCases,
      hints: [
        'First add 10 and 5, then multiply by 3',
        'Use ADD for addition and MUL for multiplication',
        'Remember to load values into registers before operating'
      ],
      solution: `.data
    result dq 0

.code
main proc
    ; Calculate (10 + 5) * 3
    mov rax, 10       ; Load 10
    add rax, 5        ; Add 5: RAX = 15
    mov rbx, 3        ; Load 3
    mul rbx           ; Multiply: RAX = 15 * 3 = 45
    mov result, rax   ; Store result

    ret
main endp
end`,
      difficulty: 'easy' as ExerciseDifficulty,
      points: 10
    };
  }

  /**
   * Exercise 3.2: Multiplication and Division
   */
  private createMultiplicationDivisionExercise(): Exercise {
    const testCases: TestCase[] = [
      {
        id: uuidv4(),
        input: '',
        expectedOutput: '8',
        description: 'Program should calculate (64 / 4) * 2',
        isHidden: false
      }
    ];

    return {
      id: uuidv4(),
      title: 'Multiplication and Division',
      description: 'Calculate the expression: (64 ÷ 4) × 2',
      starterCode: `.data
    result dq 0

.code
main proc
    ; TODO: Calculate (64 / 4) * 2
    ; Use DIV for division and MUL for multiplication

    ret
main endp
end`,
      testCases,
      hints: [
        'First divide 64 by 4, then multiply the quotient by 2',
        'For division, make sure RDX is cleared for 64-bit operations',
        'Division produces quotient in RAX and remainder in RDX'
      ],
      solution: `.data
    result dq 0

.code
main proc
    ; Calculate (64 / 4) * 2
    mov rax, 64       ; Load dividend
    mov rdx, 0        ; Clear upper bits
    mov rbx, 4        ; Load divisor
    div rbx           ; Divide: RAX = 64 / 4 = 16

    mov rbx, 2        ; Load multiplier
    mul rbx           ; Multiply: RAX = 16 * 2 = 32
    mov result, rax   ; Store result

    ret
main endp
end`,
      difficulty: 'medium' as ExerciseDifficulty,
      points: 15
    };
  }

  /**
   * Exercise 3.3: Working with Flags
   */
  private createFlagsExercise(): Exercise {
    const testCases: TestCase[] = [
      {
        id: uuidv4(),
        input: '',
        expectedOutput: 'Comparison complete',
        description: 'Program should perform comparisons and handle flags',
        isHidden: false
      }
    ];

    return {
      id: uuidv4(),
      title: 'Working with Flags',
      description: 'Use CMP instruction and understand how flags affect program flow',
      starterCode: `.data
    a dq 10
    b dq 20
    result dq 0

.code
main proc
    ; TODO: Compare a and b, set result based on comparison

    ret
main endp
end`,
      testCases,
      hints: [
        'Use CMP instruction to compare values',
        'CMP affects ZF (zero), SF (sign), and CF (carry) flags',
        'Use conditional jumps or SETcc instructions based on flags'
      ],
      solution: `.data
    a dq 10
    b dq 20
    result dq 0

.code
main proc
    ; Compare a and b
    mov rax, a
    mov rbx, b
    cmp rax, rbx      ; Compare RAX and RBX

    ; Set result based on comparison
    ; ZF = 1 if equal, ZF = 0 if not equal
    ; CF = 1 if RAX < RBX (unsigned), CF = 0 if RAX >= RBX

    ret
main endp
end`,
      difficulty: 'medium' as ExerciseDifficulty,
      points: 15
    };
  }

  /**
   * Create remaining lessons (Memory, Control Flow, Functions)
   */
  private async createMemoryLesson(): Promise<Lesson> {
    // TODO: Implement memory operations lesson
    const lesson: Omit<Lesson, 'id'> = {
      title: 'Memory Operations',
      description: 'Working with memory addresses, pointers, and data structures',
      difficulty: 'intermediate' as Difficulty,
      estimatedTime: 75,
      tags: ['memory', 'pointers', 'arrays'],
      prerequisites: ['arithmetic-lesson-id'],
      exercises: [],
      content: {
        sections: [
          {
            id: uuidv4(),
            title: 'Memory Addressing',
            content: 'Memory addressing basics will be covered here.',
            codeExamples: []
          }
        ],
        summary: 'Memory operations lesson summary.',
        keyConcepts: ['Memory addressing', 'Pointers', 'Arrays']
      }
    };

    return await lessonService.createLesson(lesson);
  }

  private async createControlFlowLesson(): Promise<Lesson> {
    // TODO: Implement control flow lesson
    const lesson: Omit<Lesson, 'id'> = {
      title: 'Control Flow',
      description: 'Conditional statements, loops, and program control',
      difficulty: 'intermediate' as Difficulty,
      estimatedTime: 90,
      tags: ['control-flow', 'loops', 'conditions'],
      prerequisites: ['memory-lesson-id'],
      exercises: [],
      content: {
        sections: [
          {
            id: uuidv4(),
            title: 'Conditional Operations',
            content: 'Control flow basics will be covered here.',
            codeExamples: []
          }
        ],
        summary: 'Control flow lesson summary.',
        keyConcepts: ['Conditions', 'Loops', 'Jumps']
      }
    };

    return await lessonService.createLesson(lesson);
  }

  private async createFunctionsLesson(): Promise<Lesson> {
    // TODO: Implement functions lesson
    const lesson: Omit<Lesson, 'id'> = {
      title: 'Functions and Procedures',
      description: 'Creating and calling functions, stack management',
      difficulty: 'advanced' as Difficulty,
      estimatedTime: 105,
      tags: ['functions', 'procedures', 'stack'],
      prerequisites: ['control-flow-lesson-id'],
      exercises: [],
      content: {
        sections: [
          {
            id: uuidv4(),
            title: 'Procedure Definition',
            content: 'Functions and procedures will be covered here.',
            codeExamples: []
          }
        ],
        summary: 'Functions lesson summary.',
        keyConcepts: ['Procedures', 'Stack', 'Calling conventions']
      }
    };

    return await lessonService.createLesson(lesson);
  }
}

export const lessonFactory = new LessonFactory();
