Cognitive Trust Secure Plugin

This project is a VS Code extension that detects insecure code patterns using Semgrep and suggests secure fixes. 
It enriches developer prompts, highlights common security anti-patterns, and provides auto-fixes for issues like hardcoded secrets and missing authorization checks.

Features
* Detects hardcoded secrets (for example, API keys, tokens, passwords).
* Detects missing authorization checks (for example, Flask routes without authentication).
* Provides inline warnings in the editor and entries in the Problems tab.
* Offers Quick Fixes (for example, replace hardcoded secrets with environment variable references).
* Enriches developer prompts by suggesting secure practices while typing.
  
Setup
1. Install dependencies: npm install
2. Compile the extension: npm run compile
3. Launch the Extension Development Host: open the project in VS Code and press F5
   
Usage
1. Open a Python or JavaScript file.
2. Save the file — the extension will run Semgrep automatically.
3. Security warnings will appear as underlines in the editor and in the Problems tab.
4. For hardcoded secrets, use the Quick Fix (lightbulb) to replace with an environment variable.
5. You can also run “Run Semgrep Scan” manually from the Command Palette.
   
Example
Insecure code: API_KEY = "12345-abcdef-secret-key"
Extension warning: [hardcoded-secret] Possible hardcoded secret detected. Avoid hardcoding secrets, use environment variables instead.

Roadmap / Future Work
* Add more Semgrep rules (for example, SQL injection, insecure deserialization).
* Support scanning multiple files at once.
* Integrate AI-based auto-refactoring of insecure code.
* Track scan results over time for reporting.
  
Requirements
* Node.js (v18 or higher recommended)
* Semgrep installed and available in your system PATH
