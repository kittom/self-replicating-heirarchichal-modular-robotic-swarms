import bpy
import json
# Get the current scene
scene = bpy.context.scene

# Get mesh data
mesh = scene.objects[0].data

# Ensure we have a mesh with vertices
if not mesh.vertices:
    raise ValueError("Mesh has no vertices")

# Prepare data structure
mesh_data = {'vertices':[],'edges':[]}

# Loop through vertices and record their coordinates
for vertex in mesh.vertices:
    # The coordinates are given as (x, y, z)
    coord = vertex.co
    mesh_data['vertices'].append({'x': coord.x, 'y': coord.y, 'z': coord.z})

# Loop through edges and record their vertex indices
for edge in mesh.edges:
    # The vertices are given as two indices, pointing to the mesh.vertices array
    mesh_data['edges'].append({'v1': edge.vertices[0], 'v2': edge.vertices[1]})

# Convert data to JSON format
mesh_json = json.dumps(mesh_data)

# Print the JSON data to the console (for testing purposes)
print(mesh_json)