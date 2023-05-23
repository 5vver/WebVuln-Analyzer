import subprocess
import os

class SubprocessHandler:
    def __init__(self):
        filepath = os.path.dirname(__file__) + "\sqlmap\sqlmapapi.py"
        self.process = subprocess.Popen(["python", filepath, "-s"])

    def stop(self):
        self.process.terminate()
        self.process.wait()

def start_subprocess():
    subprocess_handler = SubprocessHandler()
    return subprocess_handler