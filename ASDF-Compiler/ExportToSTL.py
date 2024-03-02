import bpy
import os

# Function to export the first mesh object found in the scene as an STL file
def export_first_mesh_as_stl():
    # Get the current scene
    scene = bpy.context.scene
    
    # Find the first mesh object
    mesh_object = None
    for obj in scene.objects:
        if obj.type == 'MESH':
            mesh_object = obj
            print("HELLO")
            break
    
    if mesh_object is None:
        print("No mesh object found in the scene.")
        return
    
    # Ensure the mesh object is selected and active
    bpy.ops.object.select_all(action='DESELECT')
    mesh_object.select_set(True)
    bpy.context.view_layer.objects.active = mesh_object
    
    # Define the STL file path (same location as the script)
    script_file = os.path.realpath(__file__)
    directory = os.path.dirname(script_file)
    stl_file_path = os.path.join(directory, mesh_object.name + ".stl")
    
    # Export the selected mesh object to an STL file
    bpy.ops.export_mesh.stl(filepath=stl_file_path, use_selection=True)
    print(f"Exported {mesh_object.name} to {stl_file_path}")

# if __name__ == '__main__':
    # Call the function to export the first mesh object as an STL
export_first_mesh_as_stl()
