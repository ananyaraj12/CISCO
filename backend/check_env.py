import os
import sys

# Automatically add parent directory of backend to sys.path to allow backend.* imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.abspath(os.path.join(current_dir, ".."))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

def load_env(env_path=".env"):
    """Manually parse .env file to populate os.environ without external dependencies."""
    if not os.path.exists(env_path):
        print(f"No .env file found at {env_path}")
        return
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()

def main():
    load_env()
    
    api_key = os.environ.get("GEMINI_API_KEY")
    model = os.environ.get("GEMINI_MODEL")
    
    print("Environment check:")
    if api_key:
        print("GEMINI_API_KEY: configured")
    else:
        print("GEMINI_API_KEY: missing")
        sys.exit(1)
        
    if model:
        print(f"GEMINI_MODEL: {model}")
    else:
        print("GEMINI_MODEL: missing (defaulting to gemini-2.5-flash)")
        
    print("\nAttempting to initialize GeminiDiagnosisService...")
    try:
        # Import and try to instantiate service
        from backend.llm.service import GeminiDiagnosisService
        service = GeminiDiagnosisService()
        print("GeminiDiagnosisService initialized successfully!")
    except Exception as e:
        print(f"Initialization failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
