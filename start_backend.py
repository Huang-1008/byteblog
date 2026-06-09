import sys, os

# 切换到 backend 目录
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

import uvicorn
uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
