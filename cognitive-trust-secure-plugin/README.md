Cognitive Trust Secure Plugin
This Visual Studio Code extension helps developers write secure code by detecting insecure patterns with Semgrep and suggesting inline fixes in real time.
Features
Prompt enrichment
While typing prompts or comments in your code, the extension suggests security best practices (for example, reminding you to use TLS for database connections or to add role-based access control).
Semgrep-powered scanning
On file save or when triggered manually, the extension runs Semgrep with custom rules to detect:
Hardcoded secrets (API keys, credentials, tokens)
Missing authorization in Flask routes (@app.route without @login_required)
Inline diagnostics
Insecure code is highlighted with warnings in the editor and listed in the Problems tab.
Quick fixes
Replace hardcoded secrets with environment variable references
Add @login_required to Flask routes
Manual scan command
Use Command Palette → Run Semgrep Scan to analyze the active file on demand.
Requirements
Install Semgrep CLI:
pip install semgrep
or
brew install semgrep
Semgrep rules should be located under the semgrep-rules/ folder. This project includes:
hardcoded_secret.yaml
missing_auth_check.yaml
Extension Settings
This extension contributes the following command:
cognitiveTrust.runScan: Run Semgrep on the active file.
No additional settings are required.
Usage
Open a Python or JavaScript file.
Save the file. The extension will automatically scan it with Semgrep.
Review any warnings inline (highlighted code) or in the Problems tab.
Hover over a warning to apply a Quick Fix (for example, replace a hardcoded secret with an environment variable).
Examples
Hardcoded secret detection
API_KEY = "12345-abcdef-secret-key"  # Highlighted
Quick Fix → Replace with:
API_KEY = os.getenv("MY_SECRET")
Missing authorization detection
@app.route("/admin")
def admin_panel():
    return "Sensitive admin panel exposed"
Quick Fix → Adds @login_required:
from flask_login import login_required

@app.route("/admin")
@login_required
def admin_panel():
    return "Sensitive admin panel exposed"
Known Issues
Currently supports only Python and JavaScript.
Requires Semgrep to be installed locally and available in your PATH.
Release Notes
0.0.1
Initial release
Semgrep integration for hardcoded secret and missing authorization detection
Quick Fixes implemented for both rules
Prompt enrichment added for common insecure patterns