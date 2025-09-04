import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  Book,
  Code,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Download,
  Lightbulb,
  Settings,
  FileText,
  Video,
  MessageCircle,
  X
} from 'lucide-react';

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  lastUpdated: Date;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface HelpCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  articles: HelpArticle[];
}

const HelpCenter: React.FC<HelpCenterProps> = ({ isOpen, onClose, initialSection }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialSection || null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([]);

  const categories: HelpCategory[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: Book,
      description: 'Learn the basics and get up and running',
      articles: [
        {
          id: 'introduction',
          title: 'Welcome to x64 MASM Trainer',
          category: 'getting-started',
          content: `# Welcome to x64 MASM Trainer

Welcome to your journey into x64 assembly programming! This platform is designed to teach you assembly language through interactive lessons, hands-on exercises, and comprehensive testing.

## What You'll Learn

- **x64 Assembly Fundamentals** - Basic syntax, registers, and memory operations
- **MASM Syntax** - Microsoft Macro Assembler directives and instructions
- **Low-level Programming** - Understanding how computers work at the hardware level
- **Performance Optimization** - Writing efficient assembly code
- **Debugging Techniques** - Finding and fixing errors in assembly programs

## How to Use This Platform

1. **Start with the Dashboard** - Get an overview of your progress and available lessons
2. **Follow the Learning Path** - Lessons are designed to build upon each other
3. **Practice Regularly** - Complete exercises to reinforce your learning
4. **Use the Test Runner** - Get detailed feedback on your code
5. **Track Your Progress** - Monitor your improvement over time

## Platform Features

- **Interactive Code Editor** with syntax highlighting
- **Real-time Compilation** and execution
- **Comprehensive Testing** with automated grading
- **Progress Tracking** and achievement system
- **Helpful Documentation** and reference materials
- **Community Support** and discussion forums

Happy learning! 🚀`,
          tags: ['introduction', 'basics', 'overview'],
          lastUpdated: new Date('2024-01-15'),
          difficulty: 'beginner'
        },
        {
          id: 'first-program',
          title: 'Writing Your First Assembly Program',
          category: 'getting-started',
          content: `# Your First Assembly Program

Let's create your first assembly program! We'll start with the traditional "Hello, World!" example.

## Basic Program Structure

Every assembly program follows this basic structure:

\`\`\`masm
.data
    ; Data declarations go here
    message db "Hello, World!", 0

.code
main proc
    ; Program instructions go here

    mov rax, 1              ; syscall: write
    mov rdi, 1              ; file descriptor: stdout
    lea rsi, message        ; pointer to message
    mov rdx, 13             ; message length
    syscall

    mov rax, 60             ; syscall: exit
    mov rdi, 0              ; exit code: 0
    syscall
main endp
end
\`\`\`

## Key Concepts

- **.data section** - Contains variable declarations and initialized data
- **.code section** - Contains the actual program instructions
- **main proc/endp** - Defines the main program procedure
- **System calls** - Interface with the operating system
- **Registers** - Fast storage locations inside the CPU

## Running Your Program

1. Write your code in the editor
2. Click the "Run" button to compile and execute
3. View the output in the terminal panel
4. Use the "Test Runner" for automated testing

## Next Steps

Once you're comfortable with basic programs, move on to:
- Working with registers
- Arithmetic operations
- Memory management
- Control flow structures

Remember: Assembly programming requires attention to detail. Take your time and test frequently!`,
          tags: ['first program', 'hello world', 'basic syntax'],
          lastUpdated: new Date('2024-01-14'),
          difficulty: 'beginner'
        }
      ]
    },
    {
      id: 'assembly-reference',
      name: 'Assembly Reference',
      icon: Code,
      description: 'Complete reference for x64 assembly instructions',
      articles: [
        {
          id: 'registers',
          title: 'CPU Registers Reference',
          category: 'assembly-reference',
          content: `# CPU Registers Reference

x64 processors provide 16 general-purpose registers, each 64 bits wide. Understanding registers is fundamental to assembly programming.

## General-Purpose Registers

| Register | Purpose | Size Access |
|----------|---------|-------------|
| \`RAX\` | Accumulator, return values | \`EAX\`, \`AX\`, \`AL\` |
| \`RBX\` | Base register, data storage | \`EBX\`, \`BX\`, \`BL\` |
| \`RCX\` | Counter for loops | \`ECX\`, \`CX\`, \`CL\` |
| \`RDX\` | Data register, arithmetic | \`EDX\`, \`DX\`, \`DL\` |
| \`RSI\` | Source Index (string ops) | \`ESI\`, \`SI\` |
| \`RDI\` | Destination Index (string ops) | \`EDI\`, \`DI\` |
| \`RSP\` | Stack Pointer | \`ESP\`, \`SP\` |
| \`RBP\` | Base Pointer (stack frames) | \`EBP\`, \`BP\` |
| \`R8-R15\` | Extended registers | \`R8D-R15D\`, \`R8W-R15W\`, \`R8B-R15B\` |

## Register Naming Convention

- **Full 64-bit**: \`RAX\`, \`RBX\`, etc.
- **Lower 32-bit**: \`EAX\`, \`EBX\`, etc.
- **Lower 16-bit**: \`AX\`, \`BX\`, etc.
- **Lower 8-bit**: \`AL\`, \`BL\`, etc. (and \`AH\`, \`BH\`, etc.)

## Special Registers

- **RIP**: Instruction Pointer (current instruction address)
- **RFLAGS**: Status flags (carry, zero, sign, overflow, etc.)

## Usage Guidelines

### Volatile Registers
\`RAX\`, \`RCX\`, \`RDX\`, \`R8-R11\` - Can be modified by function calls

### Non-Volatile Registers
\`RBX\`, \`RSI\`, \`RDI\`, \`RBP\`, \`RSP\`, \`R12-R15\` - Must be preserved

### Common Patterns

\`\`\`masm
; Clear a register
xor rax, rax

; Move immediate value
mov rax, 42

; Move between registers
mov rbx, rax

; Load effective address
lea rdi, [array + offset]
\`\`\`

## Best Practices

1. **Choose registers wisely** - Use appropriate sizes for data
2. **Preserve non-volatile registers** - Save/restore when needed
3. **Document register usage** - Comment what each register contains
4. **Minimize register pressure** - Don't overuse registers unnecessarily

## Common Mistakes

- Forgetting to preserve \`RBX\`, \`RBP\`, \`RSP\` in functions
- Using wrong register sizes (e.g., \`mov al, 300\`)
- Not clearing upper bits when mixing sizes
- Overwriting registers without saving values`,
          tags: ['registers', 'CPU', 'reference'],
          lastUpdated: new Date('2024-01-13'),
          difficulty: 'beginner'
        },
        {
          id: 'instructions',
          title: 'Common Instructions Reference',
          category: 'assembly-reference',
          content: `# Common Instructions Reference

Here's a comprehensive guide to the most frequently used x64 assembly instructions.

## Data Movement Instructions

### MOV - Move Data
\`\`\`masm
; Move immediate to register
mov rax, 42

; Move register to register
mov rbx, rax

; Move memory to register
mov rcx, [variable]

; Move register to memory
mov [variable], rdx
\`\`\`

### LEA - Load Effective Address
\`\`\`masm
; Load address of variable
lea rdi, [array]

; Calculate array index
lea rsi, [array + rax*8]

; Complex addressing
lea rdx, [base + offset + index*scale]
\`\`\`

## Arithmetic Instructions

### ADD - Addition
\`\`\`masm
add rax, 10      ; Add immediate
add rbx, rcx     ; Add registers
add [mem], rdx   ; Add to memory
\`\`\`

### SUB - Subtraction
\`\`\`masm
sub rax, 5       ; Subtract immediate
sub rbx, rcx     ; Subtract registers
\`\`\`

### MUL/IMUL - Multiplication
\`\`\`masm
; Unsigned multiplication
mov rax, 10
mov rbx, 20
mul rbx          ; RDX:RAX = RAX * RBX

; Signed multiplication
mov rax, -10
mov rbx, 20
imul rbx         ; RDX:RAX = RAX * RBX
\`\`\`

### DIV/IDIV - Division
\`\`\`masm
; Unsigned division
mov rax, 100     ; Dividend
mov rdx, 0       ; Clear upper bits
mov rbx, 7       ; Divisor
div rbx          ; RAX = quotient, RDX = remainder
\`\`\`

## Control Flow Instructions

### JMP - Unconditional Jump
\`\`\`masm
jmp label        ; Jump to label
\`\`\`

### Conditional Jumps
\`\`\`masm
cmp rax, rbx
je equal_label   ; Jump if equal
jne not_equal    ; Jump if not equal
jg greater       ; Jump if greater (signed)
jl less          ; Jump if less (signed)
ja above         ; Jump if above (unsigned)
jb below         ; Jump if below (unsigned)
\`\`\`

### CALL/RET - Function Calls
\`\`\`masm
; Call a function
call my_function

; Return from function
ret

my_function proc
    ; Function body
    ret
my_function endp
\`\`\`

## Stack Instructions

### PUSH/POP - Stack Operations
\`\`\`masm
push rax         ; Push register onto stack
push 42          ; Push immediate value
pop rbx          ; Pop from stack to register
\`\`\`

## Bit Manipulation

### AND/OR/XOR/NOT - Logical Operations
\`\`\`masm
and rax, 0xFF    ; Clear upper bits
or rbx, 0x80     ; Set bit
xor rcx, rcx     ; Clear register (faster than mov)
not rdx          ; Bitwise NOT
\`\`\`

### SHL/SHR - Shift Operations
\`\`\`masm
shl rax, 1       ; Shift left by 1 (multiply by 2)
shr rbx, 2       ; Shift right by 2 (divide by 4)
\`\`\`

## Data Declaration

### DB/DW/DD/DQ - Data Directives
\`\`\`masm
.data
byte_var db 42           ; 8-bit value
word_var dw 1000         ; 16-bit value
dword_var dd 100000      ; 32-bit value
qword_var dq 1000000000  ; 64-bit value

string_var db "Hello", 0 ; Null-terminated string
array_var dd 1,2,3,4,5   ; Array of double words
\`\`\`

## Best Practices

1. **Use appropriate sizes** - Don't use 64-bit operations for 8-bit data
2. **Preserve registers** - Save non-volatile registers in functions
3. **Check carry flag** - For operations that might overflow
4. **Use LEA for calculations** - More efficient than MUL for simple cases
5. **Document your code** - Comment complex instruction sequences

## Common Instruction Patterns

### Loop Counter
\`\`\`masm
mov rcx, 10      ; Loop 10 times
loop_start:
    ; Loop body
    dec rcx
    jnz loop_start
\`\`\`

### Array Access
\`\`\`masm
lea rsi, [array]          ; Load array base
mov rcx, [rsi + rax*8]   ; Access array[rax]
\`\`\`

### String Length
\`\`\`masm
lea rsi, [string]         ; Point to string
xor rcx, rcx              ; Clear counter
length_loop:
    mov al, [rsi + rcx]   ; Get character
    test al, al            ; Check for null terminator
    jz length_done
    inc rcx                ; Increment counter
    jmp length_loop
length_done:
    ; RCX now contains string length
\`\`\``,
          tags: ['instructions', 'reference', 'common'],
          lastUpdated: new Date('2024-01-12'),
          difficulty: 'intermediate'
        }
      ]
    },
    {
      id: 'troubleshooting',
      name: 'Troubleshooting',
      icon: AlertCircle,
      description: 'Common issues and their solutions',
      articles: [
        {
          id: 'compilation-errors',
          title: 'Compilation Errors',
          category: 'troubleshooting',
          content: `# Compilation Errors

Learn how to identify and fix common compilation errors in assembly programming.

## Syntax Errors

### Invalid Instruction
\`\`\`
Error: invalid instruction operands
\`\`\`

**Common Causes:**
- Wrong operand sizes (e.g., \`mov al, 300\` - 300 is too big for 8 bits)
- Invalid register combinations
- Incorrect instruction syntax

**Solutions:**
\`\`\`masm
; Wrong:
mov al, 300      ; AL is 8-bit, 300 is too big

; Correct:
mov ax, 300      ; AX is 16-bit
mov eax, 300     ; EAX is 32-bit
mov rax, 300     ; RAX is 64-bit
\`\`\`

### Undefined Symbol
\`\`\`
Error: undefined symbol 'variable_name'
\`\`\`

**Causes:**
- Using a variable before declaring it
- Misspelled variable name
- Variable declared in wrong section

**Solutions:**
\`\`\`masm
.data
    my_var dd 42  ; Declare variable first

.code
main proc
    mov eax, my_var  ; Now it works
    ret
main endp
end
\`\`\`

## Linker Errors

### Unresolved External Symbol
\`\`\`
Error: unresolved external symbol '_main'
\`\`\`

**Causes:**
- Missing main procedure
- Wrong procedure name
- Case sensitivity issues

**Solutions:**
\`\`\`masm
.code
main proc          ; Must be lowercase 'main'
    ; Your code here
    ret
main endp
end
\`\`\`

## Runtime Errors

### Segmentation Fault
**Causes:**
- Accessing invalid memory addresses
- Null pointer dereference
- Stack overflow

**Debugging Steps:**
1. Check array bounds
2. Verify pointer values
3. Ensure proper stack usage
4. Use smaller test cases

### Division by Zero
**Causes:**
- Dividing by a register that contains zero
- Not validating divisor before division

**Prevention:**
\`\`\`masm
; Check before division
test rbx, rbx     ; Test if RBX is zero
jz division_by_zero_handler

mov rax, 100
xor rdx, rdx      ; Clear upper bits
div rbx           ; Safe division

division_by_zero_handler:
    ; Handle error
\`\`\`

## Memory Issues

### Stack Overflow
**Causes:**
- Infinite recursion
- Large local variables
- Excessive stack usage

**Solutions:**
- Use heap allocation for large data
- Implement iterative solutions instead of recursive
- Monitor stack usage

### Memory Leaks
**Causes:**
- Forgetting to free allocated memory
- Losing pointers to allocated memory

**Prevention:**
- Track all memory allocations
- Free memory when no longer needed
- Use consistent allocation/deallocation patterns

## Best Practices for Error Prevention

### 1. Validate Inputs
\`\`\`masm
; Always validate function parameters
my_function proc
    cmp rcx, 0          ; Check if parameter is valid
    jle invalid_param

    ; Function body
    ret

invalid_param:
    mov rax, -1         ; Return error code
    ret
my_function endp
\`\`\`

### 2. Use Assertions
\`\`\`masm
; Debug build assertions
ASSERT MACRO condition, message
    IF condition EQ 0
        .ERR message
    ENDIF
ENDM

my_function proc
    ASSERT rcx GT 0, <Parameter must be positive>
    ; Function body
    ret
my_function endp
\`\`\`

### 3. Handle Edge Cases
\`\`\`masm
; Handle empty arrays, null pointers, etc.
process_array proc
    test rcx, rcx        ; Check if array is empty
    jz empty_array

    test rdx, rdx        ; Check if pointer is null
    jz null_pointer

    ; Process array
    ret

empty_array:
    ; Handle empty array case
    ret

null_pointer:
    ; Handle null pointer case
    ret
process_array endp
\`\`\`

### 4. Use Meaningful Error Codes
\`\`\`masm
; Define error codes
ERROR_SUCCESS        EQU 0
ERROR_INVALID_PARAM  EQU 1
ERROR_OUT_OF_MEMORY  EQU 2
ERROR_FILE_NOT_FOUND EQU 3

my_function proc
    ; Function logic
    jnc success

    mov rax, ERROR_INVALID_PARAM
    ret

success:
    mov rax, ERROR_SUCCESS
    ret
my_function endp
\`\`\`

## Debugging Tools

### Using the Test Runner
1. **Quick Validation** - Test basic functionality
2. **Full Test Suite** - Comprehensive testing
3. **Performance Analysis** - Identify bottlenecks
4. **Security Testing** - Check for vulnerabilities

### Manual Debugging Techniques
1. **Simplify the Problem** - Use smaller test cases
2. **Add Debug Output** - Print intermediate values
3. **Step Through Code** - Execute one instruction at a time
4. **Check Registers** - Verify register contents
5. **Validate Memory** - Check memory contents

### Common Debug Patterns
\`\`\`masm
; Debug print macro
DEBUG_PRINT MACRO value, message
    ; Implementation depends on your environment
ENDM

debug_function proc
    mov rax, [input_value]
    DEBUG_PRINT rax, <Input value>

    ; Your code here

    mov rbx, [result]
    DEBUG_PRINT rbx, <Result value>

    ret
debug_function endp
\`\`\`

Remember: The most important debugging tool is systematic thinking. Break down complex problems into smaller, testable parts, and verify each step along the way.`,
          tags: ['compilation', 'errors', 'debugging', 'troubleshooting'],
          lastUpdated: new Date('2024-01-11'),
          difficulty: 'beginner'
        },
        {
          id: 'performance-issues',
          title: 'Performance Issues',
          category: 'troubleshooting',
          content: `# Performance Issues

Learn how to identify and resolve performance bottlenecks in your assembly programs.

## Common Performance Problems

### Inefficient Algorithms
**Symptoms:**
- Programs taking longer than expected
- High CPU usage for simple operations
- Poor scalability with input size

**Solutions:**
\`\`\`masm
; Inefficient: O(n²) bubble sort
bubble_sort_slow proc
    mov rcx, length
outer_loop:
    mov rdx, rcx
    mov rsi, offset array
inner_loop:
    mov eax, [rsi]
    mov ebx, [rsi + 4]
    cmp eax, ebx
    jle no_swap
    ; Swap elements (slow)
    mov [rsi], ebx
    mov [rsi + 4], eax
no_swap:
    add rsi, 4
    dec rdx
    jnz inner_loop
    dec rcx
    jnz outer_loop
    ret
bubble_sort_slow endp

; Efficient: Use registers for temporary storage
bubble_sort_fast proc
    mov rcx, length
outer_loop:
    mov rdx, rcx
    mov rsi, offset array
inner_loop:
    mov eax, [rsi]        ; Load to registers
    mov ebx, [rsi + 4]    ; Load to registers
    cmp eax, ebx
    jle no_swap
    ; Swap using registers
    mov [rsi], ebx
    mov [rsi + 4], eax
no_swap:
    add rsi, 4
    dec rdx
    jnz inner_loop
    dec rcx
    jnz outer_loop
    ret
bubble_sort_fast endp
\`\`\`

### Memory Access Patterns
**Problem:** Random memory access is slower than sequential access

**Solution:**
\`\`\`masm
; Inefficient: Random access
mov rsi, offset array
mov rcx, count
random_access:
    mov rax, [random_indices + rcx*8]  ; Random index
    mov ebx, [rsi + rax*4]             ; Random access
    ; Process data
    dec rcx
    jnz random_access

; Efficient: Sequential access
mov rsi, offset array
mov rcx, count
sequential_access:
    mov eax, [rsi]                     ; Sequential access
    ; Process data
    add rsi, 4
    dec rcx
    jnz sequential_access
\`\`\`

## Optimization Techniques

### 1. Register Usage Optimization
\`\`\`masm
; Bad: Frequent memory access
mov eax, [counter]
inc eax
mov [counter], eax

; Good: Keep in registers
mov ebx, [counter]    ; Load once
inc ebx              ; Modify in register
mov [counter], ebx   ; Store once
\`\`\`

### 2. Loop Unrolling
\`\`\`masm
; Original loop
mov rcx, 100
mov rsi, offset array
sum_loop:
    add eax, [rsi]
    add rsi, 4
    dec rcx
    jnz sum_loop

; Unrolled loop (4x)
mov rcx, 25          ; 100 / 4
mov rsi, offset array
sum_loop:
    add eax, [rsi]
    add eax, [rsi + 4]
    add eax, [rsi + 8]
    add eax, [rsi + 12]
    add rsi, 16
    dec rcx
    jnz sum_loop
\`\`\`

### 3. Conditional Move Instructions
\`\`\`masm
; Traditional approach
cmp eax, ebx
jge use_eax
mov ecx, ebx
jmp done
use_eax:
mov ecx, eax
done:

; Using conditional move (faster)
cmp eax, ebx
cmovge ecx, eax    ; Move if greater or equal
cmovl ecx, ebx     ; Move if less
\`\`\`

## Memory Optimization

### Cache-Friendly Access Patterns
\`\`\`masm
; Good: Sequential access follows cache lines
mov rsi, offset matrix
mov rcx, rows
row_loop:
    mov rdx, cols
    col_loop:
        mov eax, [rsi]      ; Access sequential memory
        ; Process element
        add rsi, 4
        dec rdx
        jnz col_loop
    dec rcx
    jnz row_loop

; Bad: Random access causes cache misses
mov rsi, offset matrix
mov rcx, count
random_loop:
    mov rax, [random_indices + rcx*8]
    mov ebx, [rsi + rax*4]  ; Random access = cache miss
    dec rcx
    jnz random_loop
\`\`\`

### Stack Frame Optimization
\`\`\`masm
; Inefficient: Large stack frame
my_function proc
    sub rsp, 128       ; Large stack allocation
    mov [rsp + 0], rax
    mov [rsp + 8], rbx
    ; ... many local variables
    add rsp, 128
    ret
my_function endp

; Efficient: Minimize stack usage
my_function proc
    ; Use registers for temporary storage
    mov rbx, rax       ; Save in non-volatile register
    ; Function body using registers
    mov rax, rbx       ; Restore
    ret
my_function endp
\`\`\`

## Profiling Your Code

### Using the Test Runner for Performance
1. **Run Performance Benchmarks** - Compare execution times
2. **Analyze Memory Usage** - Check for excessive allocations
3. **Identify Hotspots** - Find the slowest parts of your code
4. **Compare Algorithms** - Test different approaches

### Manual Performance Measurement
\`\`\`masm
; High-precision timing (Windows)
GetPerformanceCounter proc
    rdtsc                   ; Read timestamp counter
    shl rdx, 32
    or rdx, rax
    mov [counter], rdx
    ret
GetPerformanceCounter endp

measure_performance proc
    call GetPerformanceCounter
    mov [start_time], rdx

    ; Your code to measure here

    call GetPerformanceCounter
    mov [end_time], rdx

    ; Calculate elapsed time
    mov rax, [end_time]
    sub rax, [start_time]
    mov [elapsed], rax

    ret
measure_performance endp
\`\`\`

## Performance Checklist

- [ ] **Algorithm Complexity**: Is your algorithm O(n) or O(n²)?
- [ ] **Memory Access**: Are you accessing memory sequentially?
- [ ] **Register Usage**: Are you minimizing memory reads/writes?
- [ ] **Loop Optimization**: Can loops be unrolled or optimized?
- [ ] **Branch Prediction**: Are conditional branches predictable?
- [ ] **Cache Alignment**: Is your data properly aligned?
- [ ] **Function Calls**: Are there excessive function call overhead?

## Common Performance Anti-Patterns

### 1. Excessive Memory Access
\`\`\`masm
; Anti-pattern: Reading memory in a loop
mov rcx, 1000
loop_start:
    mov eax, [global_var]  ; Memory read every iteration
    inc eax
    mov [global_var], eax
    dec rcx
    jnz loop_start

; Better: Read once, modify in register
mov eax, [global_var]
mov rcx, 1000
loop_start:
    inc eax                ; Register operation
    dec rcx
    jnz loop_start
mov [global_var], eax
\`\`\`

### 2. Unnecessary Operations
\`\`\`masm
; Anti-pattern: Redundant calculations
calculate_total proc
    mov rax, [price]
    mov rbx, [quantity]
    mul rbx                 ; Calculate total
    mov [total], rax

    mov rax, [tax_rate]
    mul qword ptr [total]   ; Recalculate total (redundant)
    mov [tax_amount], rax
    ret
calculate_total endp

; Better: Reuse calculated values
calculate_total proc
    mov rax, [price]
    mov rbx, [quantity]
    mul rbx
    mov [total], rax

    mov rbx, [tax_rate]
    mul rbx
    mov [tax_amount], rax
    ret
calculate_total endp
\`\`\`

Remember: The biggest performance gains usually come from choosing the right algorithm, not micro-optimizations. Focus on algorithmic improvements first, then optimize the implementation.`,
          tags: ['performance', 'optimization', 'profiling', 'efficiency'],
          lastUpdated: new Date('2024-01-10'),
          difficulty: 'advanced'
        }
      ]
    },
    {
      id: 'faq',
      name: 'FAQ',
      icon: MessageCircle,
      description: 'Frequently asked questions and answers',
      articles: [
        {
          id: 'general-questions',
          title: 'General Questions',
          category: 'faq',
          content: `# Frequently Asked Questions

## Getting Started

### What is x64 MASM?
**x64 MASM** stands for x64 Microsoft Macro Assembler. It's an assembly language for 64-bit Intel and AMD processors, used for writing low-level programs that directly control computer hardware.

### Do I need prior programming experience?
While helpful, prior programming experience isn't strictly required. We'll start with the basics and build up gradually. However, understanding general programming concepts (variables, loops, functions) will make learning easier.

### What's the difference between assembly and high-level languages?
- **Assembly**: Direct hardware control, maximum performance, very detailed
- **High-level languages** (C++, Java): Abstract away hardware details, easier to write and maintain

## Platform Usage

### Why can't I run my code?
**Common reasons:**
- **Compilation errors**: Check the syntax and fix any errors
- **Security restrictions**: Some instructions are blocked for safety
- **Missing dependencies**: Ensure all required files are present
- **Resource limits**: Your program might use too much memory or time

### How do I debug my assembly code?
1. **Use the Test Runner** for automated testing
2. **Add debug output** to see intermediate values
3. **Simplify your code** to isolate problems
4. **Check the error messages** carefully
5. **Use smaller test cases** to verify logic

### What are test cases?
Test cases are predefined inputs and expected outputs used to verify your program's correctness. They help ensure your code works correctly for various scenarios.

## Technical Questions

### What's the difference between registers?
**General-purpose registers:**
- \`RAX\`: Primary accumulator, function return values
- \`RBX\`: Base register, general-purpose storage
- \`RCX\`: Counter for loops and string operations
- \`RDX\`: Data register, used with RAX for multiplication/division
- \`RSI/RDI\`: Source/Destination for string operations
- \`RSP/RBP\`: Stack pointer and base pointer
- \`R8-R15\`: Additional registers in x64

### Why do I need to declare variables in .data?
The \`.data\` section tells the assembler to allocate space for your variables in memory. Without declarations, the assembler doesn't know how much space to reserve or where to find your data.

### What's a segmentation fault?
A segmentation fault occurs when your program tries to access memory it doesn't have permission to access, such as:
- Accessing arrays out of bounds
- Using null pointers
- Writing to read-only memory

### Why is my code slow?
**Performance factors:**
- **Algorithm choice**: O(n²) algorithms are slower than O(n)
- **Memory access patterns**: Sequential access is faster than random
- **Register usage**: Using registers instead of memory when possible
- **Loop optimization**: Reducing unnecessary operations in loops

## Account & Progress

### How do I track my progress?
Your progress is automatically tracked and displayed on:
- **Dashboard**: Overview of completed lessons and exercises
- **Sidebar**: Visual progress bars for each lesson
- **Progress page**: Detailed statistics and achievements

### What are points and levels for?
Points reward you for completing exercises and lessons. As you accumulate points, you level up, unlocking new content and achievements.

### Can I reset my progress?
Yes, you can reset individual exercises or entire lessons. Go to Settings > Progress > Reset Options.

## Technical Support

### The platform isn't working correctly
**Troubleshooting steps:**
1. **Refresh the page** - Sometimes a simple refresh fixes issues
2. **Clear browser cache** - Old cached files might cause problems
3. **Try a different browser** - Chrome, Firefox, or Edge recommended
4. **Check your internet connection** - Ensure stable connectivity
5. **Disable browser extensions** - Some extensions can interfere

### I found a bug
**Report bugs:**
1. **Describe the problem** clearly
2. **Include steps to reproduce** the issue
3. **Note your environment** (browser, OS, etc.)
4. **Attach screenshots** if applicable
5. **Provide sample code** that demonstrates the issue

### Code execution isn't working
**Check these:**
1. **Compilation errors**: Fix syntax errors first
2. **Security restrictions**: Some instructions are blocked
3. **Resource limits**: Programs have time and memory limits
4. **Dependencies**: Ensure required files are present
5. **Browser compatibility**: Use a modern browser

## Learning Tips

### How can I learn assembly effectively?
1. **Start with basics** - Don't rush through fundamental concepts
2. **Practice regularly** - Short, consistent practice sessions work best
3. **Experiment** - Try modifying examples to see what happens
4. **Debug systematically** - Use a methodical approach to find errors
5. **Study real code** - Look at existing assembly programs
6. **Join communities** - Discuss with other assembly programmers

### What's the best way to approach exercises?
1. **Read the problem carefully** - Understand requirements
2. **Plan your solution** - Think about registers and memory usage
3. **Write pseudocode first** - Plan before implementing
4. **Test incrementally** - Test small parts as you build
5. **Use the Test Runner** - Get feedback on your progress
6. **Review solutions** - Learn from correct implementations

### How long does it take to learn assembly?
**Timeline varies by individual:**
- **Basics** (1-2 weeks): Syntax, simple programs, basic instructions
- **Intermediate** (2-4 weeks): Complex logic, optimization, debugging
- **Advanced** (1-2 months): System programming, performance tuning
- **Expert** (3-6 months): Complex algorithms, low-level optimization

Consistent practice (1-2 hours daily) accelerates learning significantly.

### Should I memorize all instructions?
**Focus on understanding patterns:**
- Learn instruction categories (data movement, arithmetic, control flow)
- Understand when to use each type
- Master a core set of ~20-30 instructions
- Use reference materials for less common instructions
- Practice regularly to build intuition

## Advanced Topics

### Can I write real programs in assembly?
Yes! Assembly is used for:
- **Operating system kernels**
- **Device drivers**
- **Embedded systems**
- **Performance-critical code**
- **Security research**
- **Compiler development**

### What's inline assembly?
Inline assembly allows mixing assembly instructions within high-level language code (like C/C++). It's useful for:
- **Performance optimization**
- **Hardware access**
- **Atomic operations**
- **Compiler intrinsics**

### How do I optimize assembly code?
**Optimization strategies:**
1. **Algorithm selection**: Choose efficient algorithms
2. **Register usage**: Minimize memory access
3. **Instruction selection**: Use specialized instructions
4. **Memory alignment**: Align data for better performance
5. **Cache optimization**: Optimize memory access patterns
6. **Loop unrolling**: Reduce loop overhead
7. **Branch optimization**: Minimize branch mispredictions

Remember: Readability and correctness come first. Optimize only when necessary and after profiling.`,
          tags: ['faq', 'questions', 'help', 'learning'],
          lastUpdated: new Date('2024-01-09'),
          difficulty: 'beginner'
        }
      ]
    }
  ];

  // Initialize with all articles
  useEffect(() => {
    const allArticles = categories.flatMap(cat => cat.articles);
    setFilteredArticles(allArticles);
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      const allArticles = categories.flatMap(cat => cat.articles);
      setFilteredArticles(allArticles);
      return;
    }

    const filtered = categories
      .flatMap(cat => cat.articles)
      .filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    setFilteredArticles(filtered);
  }, [searchQuery]);

  const handleArticleClick = (article: HelpArticle) => {
    setSelectedArticle(article);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold">Help Center</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[70vh]">
          {/* Sidebar */}
          <div className="w-80 bg-gray-750 border-r border-gray-600 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-600">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto">
              {categories.map((category) => (
                <div key={category.id} className="p-4 border-b border-gray-600">
                  <button
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.id ? null : category.id
                    )}
                    className="w-full flex items-center justify-between text-left hover:bg-gray-700 p-2 rounded transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <category.icon className="w-5 h-5 text-blue-400" />
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-gray-400">{category.description}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      selectedCategory === category.id ? 'rotate-90' : ''
                    }`} />
                  </button>

                  {selectedCategory === category.id && (
                    <div className="mt-3 space-y-2 ml-8">
                      {category.articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => handleArticleClick(article)}
                          className="w-full text-left p-2 rounded hover:bg-gray-650 text-sm text-gray-300 hover:text-white transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span>{article.title}</span>
                            <span className={`text-xs px-1 py-0.5 rounded ${
                              article.difficulty === 'beginner' ? 'bg-green-600' :
                              article.difficulty === 'intermediate' ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}>
                              {article.difficulty[0].toUpperCase()}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {selectedArticle ? (
              /* Article View */
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <button
                    onClick={handleBackToList}
                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                  <h1 className="text-2xl font-bold">{selectedArticle.title}</h1>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
                  <span>Difficulty: {selectedArticle.difficulty}</span>
                  <span>•</span>
                  <span>Last updated: {selectedArticle.lastUpdated.toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Tags: {selectedArticle.tags.join(', ')}</span>
                </div>

                <div className="prose prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedArticle.content.replace(/\n/g, '<br>')
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Article List View */
              <div className="p-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold mb-2">Help Center</h1>
                  <p className="text-gray-400">
                    Find answers to common questions and learn more about x64 assembly programming.
                  </p>
                </div>

                {searchQuery && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">
                      Found {filteredArticles.length} article(s) matching "{searchQuery}"
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors cursor-pointer"
                      onClick={() => handleArticleClick(article)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">{article.title}</h3>
                          <p className="text-sm text-gray-400 mb-2">
                            {article.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{article.category.replace('-', ' ')}</span>
                            <span>•</span>
                            <span>{article.difficulty}</span>
                            <span>•</span>
                            <span>Updated {article.lastUpdated.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>

                {filteredArticles.length === 0 && searchQuery && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-400 mb-2">No results found</h3>
                    <p className="text-gray-500">
                      Try adjusting your search terms or browse the categories above.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
