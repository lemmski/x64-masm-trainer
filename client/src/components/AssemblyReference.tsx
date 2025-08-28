import React, { useState } from 'react';
import {
  Book,
  Search,
  Code,
  Cpu,
  Database,
  GitBranch,
  Calculator,
  ArrowRight,
  Filter,
  Star,
  ChevronRight,
  X
} from 'lucide-react';

interface AssemblyReferenceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Instruction {
  name: string;
  category: string;
  syntax: string[];
  description: string;
  operands: string;
  flags: string;
  examples: string[];
  notes?: string;
}

interface Register {
  name: string;
  fullName: string;
  size: string;
  purpose: string;
  preserved: boolean;
  alias?: string;
}

const AssemblyReference: React.FC<AssemblyReferenceProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);

  const categories = [
    { id: 'overview', name: 'Overview', icon: Book },
    { id: 'registers', name: 'Registers', icon: Cpu },
    { id: 'data-movement', name: 'Data Movement', icon: ArrowRight },
    { id: 'arithmetic', name: 'Arithmetic', icon: Calculator },
    { id: 'control-flow', name: 'Control Flow', icon: GitBranch },
    { id: 'directives', name: 'Directives', icon: Database }
  ];

  const registers: Register[] = [
    {
      name: 'RAX',
      fullName: 'Accumulator Register',
      size: '64-bit',
      purpose: 'Primary accumulator, function return values, arithmetic operations',
      preserved: false,
      alias: 'EAX, AX, AL'
    },
    {
      name: 'RBX',
      fullName: 'Base Register',
      size: '64-bit',
      purpose: 'Base register for memory addressing, general storage',
      preserved: true,
      alias: 'EBX, BX, BL'
    },
    {
      name: 'RCX',
      fullName: 'Counter Register',
      size: '64-bit',
      purpose: 'Loop counter, string operations, shift operations',
      preserved: false,
      alias: 'ECX, CX, CL'
    },
    {
      name: 'RDX',
      fullName: 'Data Register',
      size: '64-bit',
      purpose: 'Data register, arithmetic operations, I/O operations',
      preserved: false,
      alias: 'EDX, DX, DL'
    },
    {
      name: 'RSI',
      fullName: 'Source Index',
      size: '64-bit',
      purpose: 'Source pointer for string operations, array indexing',
      preserved: true,
      alias: 'ESI, SI'
    },
    {
      name: 'RDI',
      fullName: 'Destination Index',
      size: '64-bit',
      purpose: 'Destination pointer for string operations, array indexing',
      preserved: true,
      alias: 'EDI, DI'
    },
    {
      name: 'RSP',
      fullName: 'Stack Pointer',
      size: '64-bit',
      purpose: 'Points to the top of the stack',
      preserved: true,
      alias: 'ESP, SP'
    },
    {
      name: 'RBP',
      fullName: 'Base Pointer',
      size: '64-bit',
      purpose: 'Base pointer for stack frames, function parameters',
      preserved: true,
      alias: 'EBP, BP'
    },
    {
      name: 'R8-R15',
      fullName: 'Extended Registers',
      size: '64-bit',
      purpose: 'Additional general-purpose registers',
      preserved: false,
      alias: 'R8D-R15D, R8W-R15W, R8B-R15B'
    },
    {
      name: 'RFLAGS',
      fullName: 'Flags Register',
      size: '64-bit',
      purpose: 'Status flags for conditional operations',
      preserved: false
    }
  ];

  const instructions: Instruction[] = [
    {
      name: 'MOV',
      category: 'data-movement',
      syntax: ['MOV destination, source'],
      description: 'Copies data from source to destination. Most fundamental data transfer instruction.',
      operands: 'destination: register/memory, source: register/memory/immediate',
      flags: 'None affected',
      examples: [
        'MOV RAX, 42          ; Load immediate value',
        'MOV RBX, RAX         ; Register to register',
        'MOV [variable], RCX  ; Register to memory',
        'MOV RDX, [array]     ; Memory to register'
      ],
      notes: 'Cannot move memory directly to memory. Use appropriate operand sizes.'
    },
    {
      name: 'LEA',
      category: 'data-movement',
      syntax: ['LEA destination, source'],
      description: 'Loads effective address of source into destination register.',
      operands: 'destination: register, source: memory expression',
      flags: 'None affected',
      examples: [
        'LEA RSI, [array]           ; Load array base address',
        'LEA RDI, [array + RAX*8]  ; Calculate indexed address',
        'LEA RCX, [base + offset]  ; Complex address calculation'
      ],
      notes: 'Does not access memory, only calculates addresses. More efficient than MUL for simple calculations.'
    },
    {
      name: 'ADD',
      category: 'arithmetic',
      syntax: ['ADD destination, source'],
      description: 'Adds source to destination and stores result in destination.',
      operands: 'destination: register/memory, source: register/memory/immediate',
      flags: 'CF, PF, AF, ZF, SF, OF',
      examples: [
        'ADD RAX, 10         ; Add immediate',
        'ADD RBX, RCX        ; Add registers',
        'ADD [sum], RDX      ; Add to memory location'
      ]
    },
    {
      name: 'SUB',
      category: 'arithmetic',
      syntax: ['SUB destination, source'],
      description: 'Subtracts source from destination and stores result in destination.',
      operands: 'destination: register/memory, source: register/memory/immediate',
      flags: 'CF, PF, AF, ZF, SF, OF',
      examples: [
        'SUB RAX, 5          ; Subtract immediate',
        'SUB RBX, RCX        ; Subtract registers',
        'SUB [balance], RDX  ; Subtract from memory'
      ]
    },
    {
      name: 'MUL',
      category: 'arithmetic',
      syntax: ['MUL source'],
      description: 'Unsigned multiplication of RAX by source. Result stored in RDX:RAX.',
      operands: 'source: register/memory',
      flags: 'CF, OF (others undefined)',
      examples: [
        'MOV RAX, 10         ; Load multiplicand',
        'MOV RBX, 20         ; Load multiplier',
        'MUL RBX             ; RDX:RAX = 10 * 20'
      ],
      notes: 'Result may overflow into RDX. Check overflow flags.'
    },
    {
      name: 'DIV',
      category: 'arithmetic',
      syntax: ['DIV source'],
      description: 'Unsigned division of RDX:RAX by source. Quotient in RAX, remainder in RDX.',
      operands: 'source: register/memory',
      flags: 'CF, PF, AF, ZF, SF, OF (undefined)',
      examples: [
        'MOV RAX, 100        ; Load dividend',
        'XOR RDX, RDX        ; Clear upper bits',
        'MOV RBX, 7          ; Load divisor',
        'DIV RBX             ; RAX = 14, RDX = 2'
      ],
      notes: 'Division by zero causes exception. Upper bits must be cleared for 64-bit division.'
    },
    {
      name: 'CMP',
      category: 'control-flow',
      syntax: ['CMP destination, source'],
      description: 'Compares destination with source by subtracting source from destination.',
      operands: 'destination: register/memory, source: register/memory/immediate',
      flags: 'CF, PF, AF, ZF, SF, OF',
      examples: [
        'CMP RAX, RBX        ; Compare registers',
        'CMP [value], 10      ; Compare memory with immediate',
        'CMP RCX, 0          ; Test for zero'
      ],
      notes: 'Does not store result, only affects flags. Used before conditional jumps.'
    },
    {
      name: 'JMP',
      category: 'control-flow',
      syntax: ['JMP target'],
      description: 'Unconditional jump to target location.',
      operands: 'target: label/register/memory',
      flags: 'None affected',
      examples: [
        'JMP loop_start      ; Jump to label',
        'JMP RAX             ; Jump to address in RAX'
      ]
    },
    {
      name: 'JE',
      category: 'control-flow',
      syntax: ['JE target'],
      description: 'Jump if equal (ZF = 1). Used after CMP instruction.',
      operands: 'target: label',
      flags: 'None affected',
      examples: [
        'CMP RAX, RBX',
        'JE equal_case       ; Jump if RAX == RBX'
      ]
    },
    {
      name: 'CALL',
      category: 'control-flow',
      syntax: ['CALL procedure'],
      description: 'Calls a procedure, saving return address on stack.',
      operands: 'procedure: label/register/memory',
      flags: 'None affected',
      examples: [
        'CALL my_function    ; Call procedure',
        'CALL RAX            ; Call function at address in RAX'
      ],
      notes: 'Return address automatically pushed to stack. Use RET to return.'
    },
    {
      name: 'RET',
      category: 'control-flow',
      syntax: ['RET [expression]'],
      description: 'Returns from procedure, popping return address from stack.',
      operands: 'expression: optional immediate (stack cleanup)',
      flags: 'None affected',
      examples: [
        'RET                 ; Simple return',
        'RET 16              ; Return and clean 16 bytes from stack'
      ]
    },
    {
      name: 'PUSH',
      category: 'data-movement',
      syntax: ['PUSH source'],
      description: 'Pushes source operand onto the stack.',
      operands: 'source: register/memory/immediate (16-bit or 64-bit)',
      flags: 'None affected',
      examples: [
        'PUSH RAX            ; Push register',
        'PUSH [variable]     ; Push memory',
        'PUSH 42             ; Push immediate'
      ],
      notes: 'Stack grows downward. PUSH decrements RSP by operand size.'
    },
    {
      name: 'POP',
      category: 'data-movement',
      syntax: ['POP destination'],
      description: 'Pops value from stack into destination.',
      operands: 'destination: register/memory',
      flags: 'None affected',
      examples: [
        'POP RAX             ; Pop to register',
        'POP [variable]      ; Pop to memory'
      ],
      notes: 'Stack grows upward after POP. RSP incremented by operand size.'
    }
  ];

  const filteredInstructions = instructions.filter(instruction =>
    instruction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instruction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    instruction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">x64 Assembly Reference</h2>
        <p className="text-gray-400 mb-6">
          Complete reference guide for x64 Microsoft Macro Assembler (MASM) programming.
          This guide covers registers, instructions, directives, and best practices.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-750 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Cpu className="w-5 h-5 mr-2 text-blue-400" />
            Registers
          </h3>
          <p className="text-gray-400 mb-4">
            x64 processors provide 16 general-purpose registers, each 64 bits wide.
            Understanding registers is fundamental to assembly programming.
          </p>
          <ul className="space-y-2 text-sm">
            <li>• <code className="bg-gray-800 px-1 rounded">RAX</code> - Primary accumulator</li>
            <li>• <code className="bg-gray-800 px-1 rounded">RBX</code> - Base register</li>
            <li>• <code className="bg-gray-800 px-1 rounded">RCX</code> - Counter register</li>
            <li>• <code className="bg-gray-800 px-1 rounded">RDX</code> - Data register</li>
            <li>• And 12 more registers...</li>
          </ul>
        </div>

        <div className="bg-gray-750 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Code className="w-5 h-5 mr-2 text-green-400" />
            Instructions
          </h3>
          <p className="text-gray-400 mb-4">
            Assembly instructions perform operations on data in registers and memory.
            Instructions are grouped by function for easier understanding.
          </p>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Data Movement:</strong> MOV, LEA, PUSH, POP</li>
            <li>• <strong>Arithmetic:</strong> ADD, SUB, MUL, DIV</li>
            <li>• <strong>Control Flow:</strong> JMP, CALL, RET, CMP</li>
            <li>• <strong>Logic:</strong> AND, OR, XOR, NOT</li>
          </ul>
        </div>
      </div>

      <div className="bg-gray-750 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Program Structure</h3>
        <div className="bg-gray-900 rounded p-4 font-mono text-sm">
          <div className="text-green-400 mb-2">; Basic assembly program structure</div>
          <div className="text-blue-400">.data</div>
          <div className="ml-4 text-gray-300">; Variable declarations</div>
          <div className="text-blue-400">.code</div>
          <div className="ml-4 text-gray-300">main proc</div>
          <div className="ml-8 text-gray-300">; Program instructions</div>
          <div className="ml-8 text-gray-300">ret</div>
          <div className="ml-4 text-gray-300">main endp</div>
          <div className="text-blue-400">end</div>
        </div>
      </div>
    </div>
  );

  const renderRegisters = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">CPU Registers Reference</h2>
        <p className="text-gray-400 mb-6">
          x64 processors provide 16 general-purpose registers plus special registers for specific purposes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {registers.map((register) => (
          <div key={register.name} className="bg-gray-750 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <code className="text-lg font-bold text-blue-400">{register.name}</code>
              {register.preserved && (
                <span className="px-2 py-1 bg-green-600 text-xs text-white rounded">
                  Preserved
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-2">{register.fullName}</p>
            <p className="text-sm text-gray-300 mb-2">{register.purpose}</p>
            <div className="text-xs text-gray-500">
              Size: {register.size}
              {register.alias && <div>Alias: {register.alias}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <h3 className="font-medium text-blue-400 mb-2">Register Usage Guidelines</h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p><strong>Volatile Registers (Caller-saved):</strong> RAX, RCX, RDX, R8-R11</p>
          <p><strong>Non-volatile Registers (Callee-saved):</strong> RBX, RSI, RDI, RBP, RSP, R12-R15</p>
          <p><strong>Calling Convention:</strong> Arguments passed in RCX, RDX, R8, R9, then stack</p>
          <p><strong>Return Value:</strong> Stored in RAX</p>
        </div>
      </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Instruction Reference</h2>
          <p className="text-gray-400">Complete guide to x64 assembly instructions</p>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search instructions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredInstructions.map((instruction) => (
          <div
            key={instruction.name}
            className="bg-gray-750 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => setSelectedInstruction(instruction)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <code className="text-xl font-bold text-green-400">{instruction.name}</code>
                <span className="px-2 py-1 bg-blue-600 text-xs text-white rounded capitalize">
                  {instruction.category.replace('-', ' ')}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <p className="text-gray-300 mb-3">{instruction.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Syntax:</div>
                <div className="space-y-1">
                  {instruction.syntax.map((syntax, index) => (
                    <code key={index} className="block bg-gray-800 px-2 py-1 rounded text-green-300">
                      {syntax}
                    </code>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Operands:</div>
                <div className="text-gray-300">{instruction.operands}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Book className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold">Assembly Reference</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[75vh]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-750 border-r border-gray-600 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-medium mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedInstruction(null);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {selectedInstruction ? (
                /* Instruction Detail View */
                <div>
                  <div className="flex items-center space-x-2 mb-6">
                    <button
                      onClick={() => setSelectedInstruction(null)}
                      className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    <h1 className="text-2xl font-bold">{selectedInstruction.name}</h1>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gray-750 rounded-lg p-6">
                      <h2 className="text-lg font-semibold mb-3">Description</h2>
                      <p className="text-gray-300">{selectedInstruction.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-750 rounded-lg p-6">
                        <h3 className="font-medium mb-3">Syntax</h3>
                        <div className="space-y-2">
                          {selectedInstruction.syntax.map((syntax, index) => (
                            <code key={index} className="block bg-gray-900 px-3 py-2 rounded text-green-300 font-mono">
                              {syntax}
                            </code>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-750 rounded-lg p-6">
                        <h3 className="font-medium mb-3">Operands</h3>
                        <p className="text-gray-300">{selectedInstruction.operands}</p>
                      </div>
                    </div>

                    <div className="bg-gray-750 rounded-lg p-6">
                      <h3 className="font-medium mb-3">Flags Affected</h3>
                      <p className="text-gray-300">{selectedInstruction.flags}</p>
                    </div>

                    <div className="bg-gray-750 rounded-lg p-6">
                      <h3 className="font-medium mb-3">Examples</h3>
                      <div className="space-y-3">
                        {selectedInstruction.examples.map((example, index) => (
                          <div key={index} className="bg-gray-900 rounded p-3">
                            <code className="text-green-300 font-mono text-sm">{example}</code>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedInstruction.notes && (
                      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
                        <h3 className="font-medium text-blue-400 mb-3">Important Notes</h3>
                        <p className="text-blue-200">{selectedInstruction.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Category Content */
                <div>
                  {selectedCategory === 'overview' && renderOverview()}
                  {selectedCategory === 'registers' && renderRegisters()}
                  {selectedCategory === 'data-movement' && renderInstructions()}
                  {selectedCategory === 'arithmetic' && renderInstructions()}
                  {selectedCategory === 'control-flow' && renderInstructions()}
                  {selectedCategory === 'directives' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold">Assembler Directives</h2>
                      <p className="text-gray-400">Directives guide the assembler in generating code and data.</p>
                      <div className="text-center py-12 text-gray-400">
                        <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Directives reference coming soon...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssemblyReference;
