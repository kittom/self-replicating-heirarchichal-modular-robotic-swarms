import subprocess
import json
import re

def get_blender_data():
    # Define the path to the Blender executable and the script you want to run
    blender_executable_path = "/Applications/Blender.app/Contents/MacOS/blender"  # Replace with your actual Blender path
    blend_file_path = "/Users/morgankitto/Documents/Blender/SimpleCube.blend"
    python_script_path = "/Users/morgankitto/Documents/Code/self-replicating-hierarchical-robotic-swarms/ASDF-Compiler/GetBlenderData.py"

    # Construct the command as a list of arguments
    command = [
        blender_executable_path,
        "--background",
        blend_file_path,
        "--python",
        python_script_path
    ]

    # Run the command and capture the output
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        # 'capture_output=True' is shorthand for 'stdout=subprocess.PIPE' and 'stderr=subprocess.PIPE'
        # 'text=True' makes sure that the output is returned as a string
        match = re.search(r'{.*}', result.stdout, re.DOTALL)
        data = json.loads(match.group(0))
        return data
        # data = json.loads(result.stdout.strip())
        

    except subprocess.CalledProcessError as e:
        # If Blender exits with a non-zero exit code, print the error
        print("An error occurred while running Blender.")
        print("Error:", e.stderr)
        return None

    # If you need to capture the output in real-time, you can use subprocess.Popen instead
if __name__ == "__main__":
    data = get_blender_data()
    print(data)