#!/usr/bin/env python3
"""
Bundles the entire academic simulation platform into a single standalone HTML file.
The output file contains:
- HTML structure
- Embedded CSS
- Embedded JavaScript (All modules combined in dependency order, zero external imports)
- Dual-mode network handling (connects to live Netlify backend, with offline fallback simulation)
"""

import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read_file(rel_path):
    with open(os.path.join(BASE_DIR, rel_path), "r", encoding="utf-8") as f:
        return f.read()

def clean_module_code(code):
    # Remove ES module import statements
    code = re.sub(r'^\s*import\s+.*?;\s*$', '', code, flags=re.MULTILINE)
    # Remove export declarations but keep definitions
    code = re.sub(r'^\s*export\s+default\s+', '', code, flags=re.MULTILINE)
    code = re.sub(r'^\s*export\s+(const|let|var|function|class)\s+', r'\1 ', code, flags=re.MULTILINE)
    # Remove standalone export lists like "export { a, b };"
    code = re.sub(r'^\s*export\s*\{[^}]*\}\s*;?\s*$', '', code, flags=re.MULTILINE)
    return code

def main():
    css_content = read_file("css/styles.css")
    
    js_files = [
        "js/constants.js",
        "js/scoring.js",
        "js/state.js",
        "js/components/header.js",
        "js/components/studentLanding.js",
        "js/components/studentMarketSnapshot.js",
        "js/components/submissionModal.js",
        "js/components/studentChat.js",
        "js/components/professorDashboard.js",
        "js/components/professorReport.js",
        "js/app.js"
    ]
    
    combined_js = []
    for rel_path in js_files:
        code = read_file(rel_path)
        cleaned = clean_module_code(code)
        combined_js.append(f"// --- START {rel_path} ---\n{cleaned}\n// --- END {rel_path} ---\n")
    
    full_js = "\n".join(combined_js)

    # Inject smart API_BASE resolution:
    api_base_decl = """
    // Smart API Base: when running from file:// or a static domain, route API calls to live Netlify backend
    const API_BASE = (window.location.protocol === 'file:' || (!window.location.host.includes('localhost') && !window.location.host.includes('127.0.0.1')))
      ? 'https://agenticaihackathoniimv.netlify.app'
      : '';
    """
    full_js = api_base_decl + "\n" + full_js

    # Replace relative API paths with API_BASE
    full_js = full_js.replace("fetch('/api/chat',", "fetch(API_BASE + '/api/chat',")
    full_js = full_js.replace("fetch('/api/simulate-quarter',", "fetch(API_BASE + '/api/simulate-quarter',")
    full_js = full_js.replace("fetch('/api/status',", "fetch(API_BASE + '/api/status',")

    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Academic Business Strategy Simulation Platform</title>
  <meta name="description" content="Standalone Academic Business Strategy Simulation Platform for MBA students and faculty.">
  <style>
{css_content}
  </style>
</head>
<body>
  <div id="app-root"></div>

  <script>
{full_js}
  </script>
</body>
</html>
"""

    output_path = os.path.join(BASE_DIR, "standalone_simulation.html")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_template)
    print(f"Successfully generated standalone HTML: {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    main()
