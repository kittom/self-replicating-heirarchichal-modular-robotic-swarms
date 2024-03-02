import subprocess
import json
import re

def export_mesh_as_stl():
    # Define the path to the Blender executable and the script you want to run
    blender_executable_path = "/Applications/Blender.app/Contents/MacOS/blender"
    blend_file_path = "/Users/morgankitto/Documents/Blender/SimpleCube.blend"
    python_script_path = "/Users/morgankitto/Documents/Code/self-replicating-hierarchical-robotic-swarms/ASDF-Compiler/ExportToSTL.py"

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
        print("Export Success:", result.stdout)
    except subprocess.CalledProcessError as e:
        print("An error occurred while running Blender.")
        print("Error:", e.stderr)

if __name__ == "__main__":
    export_mesh_as_stl()
