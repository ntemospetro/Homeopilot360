import re

with open('src/components/TherapistPanel.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

if "import Markdown from 'react-markdown';" not in content:
    content = content.replace("import React,", "import Markdown from 'react-markdown';\nimport React,")

old_render = """                          {typeof analysisResults === 'string' ? (
                            <div dangerouslySetInnerHTML={{ __html: analysisResults.replace(/\\\\n/g, '<br/>').replace(/\\\\*\\\\*(.*?)\\\\*\\\\*/g, '<strong>$1</strong>') }} />
                          ) : analysisResults ? (
                             <pre className="whitespace-pre-wrap font-sans text-sm">{JSON.stringify(analysisResults, null, 2)}</pre>
                          ) : ("""

new_render = """                          {typeof analysisResults === 'string' ? (
                            <div className="markdown-body"><Markdown>{analysisResults}</Markdown></div>
                          ) : analysisResults ? (
                             <pre className="whitespace-pre-wrap font-sans text-sm">{JSON.stringify(analysisResults, null, 2)}</pre>
                          ) : ("""

content = content.replace(old_render, new_render)

with open('src/components/TherapistPanel.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Markdown updated.")
