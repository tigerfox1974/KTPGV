from pathlib import Path

root = Path(r'c:\Users\user\KTPGV\src')
for path in root.rglob('*'):
    if path.suffix.lower() not in {'.ts', '.tsx', '.js', '.jsx'}:
        continue
    text = path.read_text(encoding='utf-8')
    new = text.replace("import React from 'react';\n", "").replace('import React from "react";\n', '').replace('import React, {', 'import {')
    if new != text:
        path.write_text(new, encoding='utf-8')
        print(path)
