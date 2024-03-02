import numpy as np
import matplotlib.pyplot as plt



import json
import math

def find_positive_sdf_bounds(data):
    min_coords = [np.inf, np.inf, np.inf]
    max_coords = [-np.inf, -np.inf, -np.inf]

    for x in range(data.shape[0]):
        for y in range(data.shape[1]):
            for z in range(data.shape[2]):
                if data[x, y, z] > 0:
                    min_coords = [min(min_coords[0], x), min(min_coords[1], y), min(min_coords[2], z)]
                    max_coords = [max(max_coords[0], x), max(max_coords[1], y), max(max_coords[2], z)]
    
    # Ensure the bounds are within the data dimensions
    min_coords = [max(0, min_coords[0]), max(0, min_coords[1]), max(0, min_coords[2])]
    max_coords = [min(data.shape[0] - 1, max_coords[0]), min(data.shape[1] - 1, max_coords[1]), min(data.shape[2] - 1, max_coords[2])]

    return min_coords, max_coords

def update_loading_bar(node_size, update_condition, root_size, done=False):
    # Static variable to hold the history of node sizes
    if not hasattr(update_loading_bar, "node_sizes"):
        update_loading_bar.node_sizes = []
    
    # Add the node size to the list if it meets the condition
    if update_condition and (len(update_loading_bar.node_sizes) == 0 or node_size >= update_loading_bar.node_sizes[-1]):
        update_loading_bar.node_sizes.append(node_size)
    
    # Calculate the fraction of completion
    total_volume = sum([size**3 for size in update_loading_bar.node_sizes])
    root_volume = root_size**3 /2
    fraction_completed = total_volume / root_volume
    
    # Determine the length of the loading bar
    bar_length = 50  # Adjust the length of the loading bar here
    filled_length = int(bar_length * fraction_completed)
    
    # Create the loading bar string
    bar = '█' * filled_length + '-' * (bar_length - filled_length)
    
    if done:
        # If done, show a full loading bar
        bar = '█' * bar_length
        print(f"\r[{bar}] 100%", end="\n")
        print("Loading completed!")
    else:
        # Print the current state of the loading bar
        print(f"\r[{bar}] {fraction_completed * 100:.2f}%", end="")


# Define the Octree Node class
class OctreeNode:
    def __init__(self, corner, size):
        self.corner = corner
        self.size = size
        self.children = []
        self.is_leaf = True
        self.contains_positive = False
        self.contains_negative = False

    def subdivide(self, data):
        half = self.size / 2
        offsets = [(x, y, z) for x in [0, half] for y in [0, half] for z in [0, half]]
        for offset in offsets:
            new_corner = [self.corner[i] + offset[i] for i in range(3)]
            child = OctreeNode(new_corner, half)
            self.children.append(child)

        for x in range(data.shape[0]):
            for y in range(data.shape[1]):
                for z in range(data.shape[2]):
                    point = [x, y, z]
                    value = data[x, y, z]
                    for child in self.children:
                        if child.contains_point(point):
                            child.add_point(value)
                            break
    
    def contains_point(self, point):
        
        return all(self.corner[i] <= point[i] <= self.corner[i] + self.size for i in range(3))

    def add_point(self, value):
        if value > 0:
            self.contains_positive = True
        elif value < 0:
            self.contains_negative = True

# Function to build the octree
def build_octree(data, root_corner, root_size):
    root = OctreeNode(root_corner, root_size)

    def build(node):
        
        if should_subdivide(node, data):
            node.subdivide(data)
            node.is_leaf = False
            for child in node.children:
                # print(child.size)
                build(child)
                
        else:
            update_loading_bar(node.size,True, root_size, done=False)
           

    build(root)
    return root

# Evaluate the sdf values inside of the node
def should_subdivide(node, data):
    has_positive = False
    has_negative = False
    
    for x in range(data.shape[0]):
        for y in range(data.shape[1]):
            for z in range(data.shape[2]):
                if node.contains_point([x, y, z]):
                    value = data[x, y, z]
                    if value > 0:
                        has_positive = True
                        if has_negative:
                            return True
                    elif value < 0:
                        has_negative = True
                        if has_positive:
                            return True
    return False


# Function for visualizing the octree
def plot_octree(node, ax, depth=0, max_depth=10):
    if node.is_leaf or depth == max_depth:
        if node.contains_positive:
            x = [node.corner[0], node.corner[0] + node.size]
            y = [node.corner[1], node.corner[1] + node.size]
            z = [node.corner[2], node.corner[2] + node.size]
            for xi in x:
                for yi in y:
                    ax.plot([xi, xi], [yi, yi], z, color='g')
            for xi in x:
                for zi in z:
                    ax.plot([xi, xi], y, [zi, zi], color='g')
            for yi in y:
                for zi in z:
                    ax.plot(x, [yi, yi], [zi, zi], color='g')
        return

    for child in node.children:
        plot_octree(child, ax, depth + 1, max_depth)
    
def write_to_json(node, file_path, root_size):
    leaf_nodes = []


    def find_leaf_nodes(node):
        if node.is_leaf:
            if (not node.contains_negative) and (node.contains_positive) and (node.size >= 1):
                leaf_nodes.append({
                    #Convert XYZ to fit three.js convention
                    "origin": [node.corner[0],node.corner[1],node.corner[2]],
                    "widths": [node.size, node.size, node.size]
                })
        else:
            for child in node.children:
                find_leaf_nodes(child)

    find_leaf_nodes(node)

    with open(file_path, 'w') as file:
        json.dump(leaf_nodes, file, indent=4)




if __name__ == "__main__":
    # Load the data from the provided .npy file
    data = np.load('./sdf_values.npy')
    # data = load_sdf(get_blender_data(), 30)
    

    # Build the octree
    # Find bounds for positive SDF values
    min_coords, max_coords = find_positive_sdf_bounds(data)

    # Adjust root corner and size based on positive SDF bounds
    root_corner = min_coords
    root_size = max(max_coords[i] - min_coords[i] for i in range(3))
    print(f"Adjusted Root Size: {root_size}")
    print("Building Octree")
    octree = build_octree(data, root_corner, root_size)
    update_loading_bar(root_size, True, root_size, True)
    


    print("Octree Built")
    print("Writing octree data")
    json_file_path = 'Torus.json'
    write_to_json(octree, json_file_path, root_size)
    print("Data written")