import subprocess
import sys
import time
import webbrowser
import os
import signal

def run():
    print("🚀 Starting Skimbleshanks Web GUI (Development Mode)...")
    
    # Set default API Key for dev if not present
    env = os.environ.copy()
    if "SKIMBLE_API_KEY" not in env:
        env["SKIMBLE_API_KEY"] = "your-secret-key"
        print("💡 SKIMBLE_API_KEY not set. Using default: 'your-secret-key'")

    # 1. Start FastAPI Backend
    backend_cmd = [sys.executable, "-m", "uvicorn", "src.api.app:app", "--host", "127.0.0.1", "--port", "8000"]
    print(f"Starting Backend: {' '.join(backend_cmd)}")
    backend_proc = subprocess.Popen(
        backend_cmd,
        env=env
    )
    
    # 2. Start Vite Frontend
    frontend_dir = os.path.join(os.getcwd(), "frontend")
    print(f"Starting Frontend in {frontend_dir}...")
    
    # Check if node_modules exists
    if not os.path.exists(os.path.join(frontend_dir, "node_modules")):
        print("📦 Installing frontend dependencies...")
        subprocess.run(["npm", "install"], cwd=frontend_dir)

    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=frontend_dir,
        env=env
    )
    
    print("⏳ Waiting for servers to start...")
    time.sleep(3)
    
    # 3. Open Browser
    url = "http://localhost:5173"
    print(f"🌍 Opening browser at {url}")
    webbrowser.open(url)
    
    print("\n✅ Web GUI is running!")
    print("   - Backend: http://127.0.0.1:8000")
    print("   - Frontend: http://localhost:5173")
    print("\nPress Ctrl+C to stop both servers.")
    
    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("❌ Backend process exited unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("❌ Frontend process exited unexpectedly.")
                break
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
    finally:
        # Graceful shutdown
        if os.name == 'nt':
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(backend_proc.pid)])
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(frontend_proc.pid)])
        else:
            try:
                os.kill(backend_proc.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                os.kill(frontend_proc.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
        print("Done.")

if __name__ == "__main__":
    run()
