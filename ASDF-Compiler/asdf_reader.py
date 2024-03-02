import json
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import numpy as np

def load_json(json_file_path):
    with open(json_file_path, 'r') as file:
        return json.load(file)

def generate_cube_vertices(origin, widths):
    x, y, z = origin
    dx, dy, dz = widths
    vertices = np.array([[x, y, z],
                         [x, y + dy, z],
                         [x + dx, y + dy, z],
                         [x + dx, y, z],
                         [x, y, z + dz],
                         [x, y + dy, z + dz],
                         [x + dx, y + dy, z + dz],
                         [x + dx, y, z + dz]])
    faces = [[vertices[j] for j in [0, 1, 2, 3]], [vertices[j] for j in [4, 5, 6, 7]], 
             [vertices[j] for j in [0, 3, 7, 4]], [vertices[j] for j in [1, 2, 6, 5]], 
             [vertices[j] for j in [0, 1, 5, 4]], [vertices[j] for j in [2, 3, 7, 6]]]
    return faces

def plot_cubes_from_json(json_file_path):
    data = load_json(json_file_path)
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')
    
    for layer_group in data:
        for size_group in layer_group:
            for subgroup in size_group:
                for cube in subgroup:
                    origin = cube['origin']
                    widths = cube['widths']
                    faces = generate_cube_vertices(origin, widths)
                    poly3d = [faces]
                    ax.add_collection3d(Poly3DCollection(poly3d, facecolors='cyan', linewidths=1, edgecolors='r', alpha=0.66))
    
    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    scaling = np.array([getattr(ax, f'get_{dim}lim')() for dim in 'xyz'])
    ax.auto_scale_xyz(*[[np.min(scaling), np.max(scaling)]]*3)
    plt.show()

# Assuming you have a file named 'octree_data.json' with the sample data
json_file_path = 'normalized_data.json'
plot_cubes_from_json(json_file_path)
