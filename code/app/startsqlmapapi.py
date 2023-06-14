import subprocess
import os

class SubprocessHandler:
    def __init__(self):
        filepath = os.path.join(os.path.dirname(__file__), "sqlmap", "sqlmapapi.py")
        self.process = subprocess.Popen(["python", filepath, "-s", "-H", "0.0.0.0", "-p", "8775"])

    def stop(self):
        self.process.terminate()
        self.process.wait()

def start_subprocess():
    subprocess_handler = SubprocessHandler()
    return subprocess_handler