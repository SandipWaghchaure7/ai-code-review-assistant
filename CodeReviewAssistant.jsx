import React, { useState } from 'react';
import { Upload, FileCode, AlertCircle, CheckCircle, Loader2, Download } from 'lucide-react';

export default function CodeReviewAssistant() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFileName(uploadedFile.name);
      setFile(uploadedFile);
      
      // Detect language from file extension
      const ext = uploadedFile.name.split('.').pop().toLowerCase();
      const langMap = {
        'js': 'javascript',
        'jsx': 'javascript',
        'py': 'python',
        'java': 'java',
        'cpp': 'c++',
        'c': 'c',
        'cs': 'c#',
        'rb': 'ruby',
        'go': 'go',
        'php': 'php',
        'ts': 'typescript',
        'tsx': 'typescript'
      };
      setLanguage(langMap[ext] || 'javascript');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setCode(event.target.result);
      };
      reader.readAsText(uploadedFile);
      setError('');
      setReview(null);
    }
  };

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please upload a code file or paste code first');
      return;
    }

    setLoading(true);
    setError('');
    setReview(null);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `You are a code review expert. Analyze the following ${language} code for:
1. Code Quality & Readability
2. Best Practices & Standards
3. Potential Bugs & Issues
4. Performance Considerations
5. Security Concerns (if any)

Provide a structured review with:
- Overall Score (out of 10)
- Key Issues (list 3-5 main problems)
- Suggestions (specific improvements)
- Positive Points (what's done well)

Code to review:
\`\`\`${language}
${code}
\`\`\`

Format your response as:
**Overall Score:** X/10

**Key Issues:**
- Issue 1
- Issue 2
...

**Suggestions:**
- Suggestion 1
- Suggestion 2
...

**Positive Points:**
- Point 1
- Point 2
...`
            }
          ]
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0]) {
        setReview(data.content[0].text);
      } else {
        setError('Failed to get review from AI');
      }
    } catch (err) {
      setError('Error analyzing code: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!review) return;
    
    const reportContent = `Code Review Report
File: ${fileName || 'Pasted Code'}
Language: ${language}
Date: ${new Date().toLocaleString()}

${'='.repeat(60)}

${review}

${'='.repeat(60)}

Original Code:
${code}
`;
    
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-review-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFile(null);
    setFileName('');
    setCode('');
    setReview(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileCode className="w-12 h-12 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Code Review Assistant</h1>
          </div>
          <p className="text-gray-300 text-lg">AI-powered code analysis for better code quality</p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Code
            </h2>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block w-full">
                <div className="border-2 border-dashed border-purple-400 rounded-lg p-8 text-center cursor-pointer hover:border-purple-300 hover:bg-white/5 transition">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-purple-400" />
                  <p className="text-white font-medium mb-1">Click to upload code file</p>
                  <p className="text-gray-400 text-sm">Supports .js, .py, .java, .cpp, etc.</p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.rb,.go,.php"
                    className="hidden"
                  />
                </div>
              </label>
              {fileName && (
                <div className="mt-2 flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">{fileName}</span>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="c++">C++</option>
                <option value="typescript">TypeScript</option>
                <option value="ruby">Ruby</option>
                <option value="go">Go</option>
                <option value="php">PHP</option>
              </select>
            </div>

            {/* Code Textarea */}
            <div className="mb-4">
              <label className="block text-white font-medium mb-2">Or paste your code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-64 px-4 py-3 bg-slate-900 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={analyzeCode}
                disabled={loading || !code.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FileCode className="w-5 h-5" />
                    Analyze Code
                  </>
                )}
              </button>
              <button
                onClick={clearAll}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Review Report
              </h2>
              {review && (
                <button
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center h-96">
                <Loader2 className="w-16 h-16 text-purple-400 animate-spin mb-4" />
                <p className="text-gray-300">Analyzing your code...</p>
              </div>
            )}

            {/* Review Results */}
            {review && !loading && (
              <div className="bg-slate-900/50 rounded-lg p-6 h-[600px] overflow-y-auto">
                <div className="text-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {review}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!review && !loading && !error && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                <FileCode className="w-20 h-20 mb-4 opacity-50" />
                <p className="text-lg">Upload code to see review report</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Powered by Claude AI • Analyzes code quality, bugs, and best practices</p>
        </div>
      </div>
    </div>
  );
}