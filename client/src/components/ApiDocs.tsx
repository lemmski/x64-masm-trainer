import React, { useState } from 'react';
import {
  Code,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  FileText,
  Server,
  Database,
  TestTube,
  Settings,
  Book,
  X
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: object;
  responseBody?: object;
  examples?: Array<{
    title: string;
    request: string;
    response: string;
  }>;
}

interface ApiDocsProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiDocs: React.FC<ApiDocsProps> = ({ isOpen, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('overview');
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const apiCategories = {
    overview: {
      title: 'API Overview',
      icon: Server,
      description: 'General information about the x64 MASM Trainer API',
      content: `
# x64 MASM Trainer API

The x64 MASM Trainer API provides programmatic access to all platform features including lesson management, code execution, testing, and progress tracking.

## Base URL
\`\`\`
http://localhost:3001/api
\`\`\`

## Authentication
Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format
All API responses follow a consistent JSON format:

**Success Response:**
\`\`\`json
{
  "data": { ... },
  "message": "Optional success message",
  "status": 200
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "error": "Error message",
  "details": "Optional error details",
  "status": 400
}
\`\`\`

## Rate Limiting
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## Content Types
- Request: \`application/json\`
- Response: \`application/json\`

## Error Codes
- \`200\` - Success
- \`400\` - Bad Request
- \`404\` - Not Found
- \`429\` - Rate Limited
- \`500\` - Internal Server Error
      `
    },
    lessons: {
      title: 'Lessons API',
      icon: Book,
      description: 'Manage educational content and curriculum',
      endpoints: [
        {
          method: 'GET',
          path: '/lessons',
          description: 'Get all lessons with optional filtering',
          parameters: [
            {
              name: 'difficulty',
              type: 'string',
              required: false,
              description: 'Filter by difficulty (beginner, intermediate, advanced)'
            }
          ],
          responseBody: {
            lessons: [
              {
                id: 'string',
                title: 'string',
                description: 'string',
                difficulty: 'string',
                estimatedTime: 'number',
                tags: ['string'],
                content: 'object',
                prerequisites: ['string'],
                exercises: ['string']
              }
            ]
          },
          examples: [
            {
              title: 'Get all lessons',
              request: `GET /api/lessons`,
              response: `[
  {
    "id": "basic-syntax",
    "title": "Basic Assembly Syntax",
    "description": "Learn the fundamentals...",
    "difficulty": "beginner",
    "estimatedTime": 30,
    "tags": ["basics", "syntax"]
  }
]`
            }
          ]
        },
        {
          method: 'GET',
          path: '/lessons/:id',
          description: 'Get a specific lesson by ID',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'Lesson ID'
            }
          ]
        },
        {
          method: 'GET',
          path: '/lessons/recommended/:userId',
          description: 'Get recommended next lesson for a user',
          parameters: [
            {
              name: 'userId',
              type: 'string',
              required: true,
              description: 'User ID'
            }
          ]
        }
      ]
    },
    exercises: {
      title: 'Exercises API',
      icon: Code,
      description: 'Manage coding exercises and submissions',
      endpoints: [
        {
          method: 'GET',
          path: '/exercises/lesson/:lessonId',
          description: 'Get all exercises for a specific lesson',
          parameters: [
            {
              name: 'lessonId',
              type: 'string',
              required: true,
              description: 'Lesson ID'
            }
          ]
        },
        {
          method: 'GET',
          path: '/exercises/:id',
          description: 'Get a specific exercise by ID',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'Exercise ID'
            }
          ]
        },
        {
          method: 'POST',
          path: '/exercises/:id/submit',
          description: 'Submit a solution for grading',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'Exercise ID'
            }
          ],
          requestBody: {
            code: 'string',
            userId: 'string'
          },
          responseBody: {
            exerciseId: 'string',
            code: 'string',
            results: ['TestResult[]'],
            passed: 'boolean',
            score: 'number',
            timestamp: 'string'
          }
        }
      ]
    },
    assembler: {
      title: 'Assembler API',
      icon: Settings,
      description: 'Compile and execute assembly code',
      endpoints: [
        {
          method: 'POST',
          path: '/assembler/compile',
          description: 'Compile and execute assembly code',
          requestBody: {
            code: 'string',
            input: 'string?',
            timeout: 'number?',
            allowSystemCalls: 'boolean?'
          },
          responseBody: {
            success: 'boolean',
            output: 'string?',
            error: 'string?',
            executionTime: 'number',
            exitCode: 'number?'
          },
          examples: [
            {
              title: 'Compile simple program',
              request: `POST /api/assembler/compile
Content-Type: application/json

{
  "code": ".data\\n    msg db \\"Hello!\\", 0\\n.code\\nmain proc\\n    ret\\nmain endp\\nend",
  "timeout": 5000
}`,
              response: `{
  "success": true,
  "output": "",
  "executionTime": 45,
  "exitCode": 0
}`
            }
          ]
        },
        {
          method: 'POST',
          path: '/assembler/validate',
          description: 'Validate assembly syntax without execution',
          requestBody: {
            code: 'string'
          },
          responseBody: {
            valid: 'boolean',
            errors: ['string'],
            warnings: ['string']
          }
        }
      ]
    },
    testing: {
      title: 'Testing API',
      icon: TestTube,
      description: 'Advanced testing and grading capabilities',
      endpoints: [
        {
          method: 'POST',
          path: '/testing/generate/:exerciseId',
          description: 'Generate test cases for an exercise',
          parameters: [
            {
              name: 'exerciseId',
              type: 'string',
              required: true,
              description: 'Exercise ID'
            }
          ],
          requestBody: {
            concepts: ['string'],
            count: 'number?'
          }
        },
        {
          method: 'POST',
          path: '/testing/run/:exerciseId',
          description: 'Execute comprehensive test suite',
          parameters: [
            {
              name: 'exerciseId',
              type: 'string',
              required: true,
              description: 'Exercise ID'
            }
          ],
          requestBody: {
            code: 'string',
            userId: 'string',
            testSuite: 'TestSuite',
            options: 'TestRunnerOptions?'
          }
        },
        {
          method: 'POST',
          path: '/testing/validate/:exerciseId',
          description: 'Quick validation with sample test cases',
          parameters: [
            {
              name: 'exerciseId',
              type: 'string',
              required: true,
              description: 'Exercise ID'
            }
          ],
          requestBody: {
            code: 'string',
            testCases: ['ValidationTestCase']
          }
        },
        {
          method: 'POST',
          path: '/testing/security/:exerciseId',
          description: 'Analyze code for security vulnerabilities',
          parameters: [
            {
              name: 'exerciseId',
              type: 'string',
              required: true,
              description: 'Exercise ID'
            }
          ],
          requestBody: {
            code: 'string'
          }
        },
        {
          method: 'POST',
          path: '/testing/quality/:exerciseId',
          description: 'Analyze code quality and provide suggestions',
          parameters: [
            {
              name: 'exerciseId',
              type: 'string',
              required: true,
              description: 'Exercise ID'
            }
          ],
          requestBody: {
            code: 'string'
          }
        }
      ]
    },
    users: {
      title: 'Users API',
      icon: Database,
      description: 'User management and progress tracking',
      endpoints: [
        {
          method: 'GET',
          path: '/users/:id',
          description: 'Get user profile and progress',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'User ID'
            }
          ]
        },
        {
          method: 'POST',
          path: '/users',
          description: 'Create a new user account',
          requestBody: {
            username: 'string',
            email: 'string',
            preferences: 'object?'
          }
        },
        {
          method: 'PUT',
          path: '/users/:id/preferences',
          description: 'Update user preferences',
          parameters: [
            {
              name: 'id',
              type: 'string',
              required: true,
              description: 'User ID'
            }
          ],
          requestBody: {
            preferences: 'object'
          }
        }
      ]
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold">API Documentation</h2>
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
                {Object.entries(apiCategories).map(([key, category]) => {
                  if (!category.endpoints) return null;

                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        selectedCategory === key
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{category.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {selectedCategory === 'overview' ? (
                <div className="prose prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: apiCategories.overview.content.replace(/\n/g, '<br>')
                    }}
                  />
                </div>
              ) : (
                <div>
                  {(() => {
                    const category = apiCategories[selectedCategory as keyof typeof apiCategories];
                    if (!category || !category.endpoints) return null;

                    return (
                      <div>
                        <div className="mb-6">
                          <h1 className="text-2xl font-bold mb-2">{category.title}</h1>
                          <p className="text-gray-400">{category.description}</p>
                        </div>

                        <div className="space-y-8">
                          {category.endpoints.map((endpoint, index) => (
                            <div key={index} className="bg-gray-750 rounded-lg p-6">
                              {/* Endpoint Header */}
                              <div className="flex items-center space-x-3 mb-4">
                                <span className={`px-3 py-1 rounded text-sm font-mono ${
                                  endpoint.method === 'GET' ? 'bg-green-600' :
                                  endpoint.method === 'POST' ? 'bg-blue-600' :
                                  endpoint.method === 'PUT' ? 'bg-yellow-600' :
                                  'bg-red-600'
                                }`}>
                                  {endpoint.method}
                                </span>
                                <code className="text-lg font-mono text-gray-300">
                                  {endpoint.path}
                                </code>
                              </div>

                              {/* Description */}
                              <p className="text-gray-400 mb-4">{endpoint.description}</p>

                              {/* Parameters */}
                              {endpoint.parameters && endpoint.parameters.length > 0 && (
                                <div className="mb-4">
                                  <h4 className="font-medium mb-2">Parameters</h4>
                                  <div className="space-y-2">
                                    {endpoint.parameters.map((param, paramIndex) => (
                                      <div key={paramIndex} className="flex items-start space-x-3 text-sm">
                                        <code className="text-blue-400 font-mono">
                                          {param.name}
                                        </code>
                                        <span className="text-gray-400">
                                          ({param.type})
                                          {param.required && <span className="text-red-400">*</span>}
                                        </span>
                                        <span className="text-gray-300 flex-1">
                                          {param.description}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Request Body */}
                              {endpoint.requestBody && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">Request Body</h4>
                                    <button
                                      onClick={() => copyToClipboard(JSON.stringify(endpoint.requestBody, null, 2))}
                                      className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white"
                                    >
                                      {copiedText === JSON.stringify(endpoint.requestBody, null, 2) ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                      <span>Copy</span>
                                    </button>
                                  </div>
                                  <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                                    <code>{JSON.stringify(endpoint.requestBody, null, 2)}</code>
                                  </pre>
                                </div>
                              )}

                              {/* Response Body */}
                              {endpoint.responseBody && (
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">Response Body</h4>
                                    <button
                                      onClick={() => copyToClipboard(JSON.stringify(endpoint.responseBody, null, 2))}
                                      className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white"
                                    >
                                      {copiedText === JSON.stringify(endpoint.responseBody, null, 2) ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                      <span>Copy</span>
                                    </button>
                                  </div>
                                  <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                                    <code>{JSON.stringify(endpoint.responseBody, null, 2)}</code>
                                  </pre>
                                </div>
                              )}

                              {/* Examples */}
                              {endpoint.examples && endpoint.examples.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-4">Examples</h4>
                                  <div className="space-y-4">
                                    {endpoint.examples.map((example, exampleIndex) => (
                                      <div key={exampleIndex} className="border border-gray-600 rounded-lg p-4">
                                        <h5 className="font-medium mb-3">{example.title}</h5>

                                        <div className="mb-3">
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-400">Request</span>
                                            <button
                                              onClick={() => copyToClipboard(example.request)}
                                              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white"
                                            >
                                              {copiedText === example.request ? (
                                                <Check className="w-4 h-4" />
                                              ) : (
                                                <Copy className="w-4 h-4" />
                                              )}
                                              <span>Copy</span>
                                            </button>
                                          </div>
                                          <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                                            <code>{example.request}</code>
                                          </pre>
                                        </div>

                                        <div>
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-400">Response</span>
                                            <button
                                              onClick={() => copyToClipboard(example.response)}
                                              className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white"
                                            >
                                              {copiedText === example.response ? (
                                                <Check className="w-4 h-4" />
                                              ) : (
                                                <Copy className="w-4 h-4" />
                                              )}
                                              <span>Copy</span>
                                            </button>
                                          </div>
                                          <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                                            <code>{example.response}</code>
                                          </pre>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
