import json
import math

def save_to_json_file(data, file_name):
    with open(file_name, 'w') as f:
        json.dump(data, f, indent=4)

# load data
def load_json(json_file_path):
    with open(json_file_path, 'r') as file:
        nodes = json.load(file)
        return nodes
    
def euclidean(x,y):
    return math.sqrt(x**2 + y**2)

def find_min_max_per_axis(data):
    # Initialize dictionaries to hold min and max values for origin and widths per axis
    min_max_origin = {'x': [float('inf'), float('-inf')], 'y': [float('inf'), float('-inf')], 'z': [float('inf'), float('-inf')]}
    min_max_widths = {'x': [float('inf'), float('-inf')], 'y': [float('inf'), float('-inf')], 'z': [float('inf'), float('-inf')]}

    for entry in data:
        for i, axis in enumerate(['x', 'y', 'z']):
            # Update min and max for origin per axis
            if entry['origin'][i] < min_max_origin[axis][0]:
                min_max_origin[axis][0] = entry['origin'][i]
            if entry['origin'][i] > min_max_origin[axis][1]:
                min_max_origin[axis][1] = entry['origin'][i]
                
            # Update min and max for widths per axis
            if entry['widths'][i] < min_max_widths[axis][0]:
                min_max_widths[axis][0] = entry['widths'][i]
            if entry['widths'][i] > min_max_widths[axis][1]:
                min_max_widths[axis][1] = entry['widths'][i]
    
    return min_max_origin, min_max_widths

def find_global_min_max_values(data):
    # Initialize lists to hold the individual components of all origins
    x_origins, y_origins, z_origins = [], [], []
    widths = []
    
    # Iterate through each dictionary in the list
    for entry in data:
        origin = entry.get('origin', [])
        if origin:
            x_origins.append(origin[0])
            y_origins.append(origin[1])
            z_origins.append(origin[2])
        widths.extend(entry.get('widths', []))
    
    # Find the min and max for each axis
    min_x = min(x_origins) if x_origins else None
    max_x = max(x_origins) if x_origins else None
    min_y = min(y_origins) if y_origins else None
    max_y = max(y_origins) if y_origins else None
    min_z = min(z_origins) if z_origins else None
    max_z = max(z_origins) if z_origins else None
    min_width = min(widths) if widths else None
    max_width = max(widths) if widths else None
    
    return (min_x, max_x), (min_y, max_y), (min_z, max_z), (min_width, max_width)


def normalize_data(data):
    (min_x, max_x), (min_y, max_y), (min_z, max_z), (min_width, max_width) = find_global_min_max_values(data)

    scale_factor = 0.25/min_width
    mid_x = (min_x + max_x) / 2
    mid_y = (min_y + max_y) / 2
    
    
    normalized_data = []
    for entry in data:
        normalized_origin = [
            (entry['origin'][0] - mid_x)*scale_factor,
            (entry['origin'][1] - mid_y)*scale_factor,
            (entry['origin'][2] - min_z)*scale_factor,
        ]

        normalized_width = [
            entry['widths'][0]*scale_factor,
            entry['widths'][1]*scale_factor,
            entry['widths'][2]*scale_factor
        ]
        
        normalized_entry = {
            'origin': normalized_origin,
            'widths': normalized_width
        }

        normalized_data.append(normalized_entry)



    

    return normalized_data



def group_by_z_origin(data):
    # Sort the data first to make grouping easier
    sorted_data = sorted(data, key=lambda x: x['origin'][2])
    
    # Initialize the list to hold groups and a temporary list for the current group
    grouped_data = []
    current_group = []
    current_z_value = None

    for entry in sorted_data:
        z_value = entry['origin'][2]
        # If this is the first iteration or the z value hasn't changed, add to current group
        if z_value != current_z_value:
            # If there's an existing group, append it to grouped_data
            if current_group:
                grouped_data.append(current_group)
                current_group = []  # Reset current group for the new z value
            current_z_value = z_value
        current_group.append(entry)
    
    # Don't forget to add the last group if it exists
    if current_group:
        grouped_data.append(current_group)
    
    return grouped_data

def sort_cubes_by_size(layers):
    # Function to sort cubes within each subgroup by size in descending order
    def sort_group(group):
        # Extract the size (since width = length = height, just use one of them)
        return sorted(group, key=lambda x: x['widths'][0], reverse=False)

    sorted_layers = []

    for layer in layers:
        # Create a dictionary to group cubes by their size
        size_groups = {}
        for cube in layer:
            size = cube['widths'][0]  # Assuming width = length = height
            if size not in size_groups:
                size_groups[size] = []
            size_groups[size].append(cube)
        
        # Sort each group of cubes and add to the list
        groups_sorted_by_size = [sort_group(group) for size, group in sorted(size_groups.items(), reverse=True)]
        sorted_layers.append(groups_sorted_by_size)
    
    return sorted_layers


def sort_cubes_within_size_groups_by_distance(layers):
    def sort_subgroups_by_distance(cubes):
        # Group cubes by Euclidean distance
        distance_groups = {}
        for cube in cubes:
            print(cube)
            distance = euclidean(cube['origin'][0], cube['origin'][1])
            if distance not in distance_groups:
                distance_groups[distance] = []
            distance_groups[distance].append(cube)

        # Sort each distance group and return them as a list of groups
        return [group for _, group in sorted(distance_groups.items())]

    sorted_layers = []
    for layer in layers:  # Layer is a list of size-sorted groups
        print(layer)
        sorted_size_groups = []
        for size_group in layer:  # size_group is a list of cubes of the same size
            # Sort the cubes within this size group into subgroups by distance
            sorted_distance_subgroups = sort_subgroups_by_distance(size_group)
            sorted_size_groups.append(sorted_distance_subgroups)
        sorted_layers.append(sorted_size_groups)

    return sorted_layers
                

def three_adapt(fully_grouped_data):
    # Iterate through each layer in the fully grouped data
    for layer_group in fully_grouped_data:
        # Iterate through each size group within the layer
        for size_group in layer_group:
            # Assuming sdf_group is the correct list to iterate over
            for sdf_group in size_group:
            # If sdf_group represents individual entries, iterate through it
                for entry in sdf_group:  # Directly iterate over entries in the size_group
                # Swap the values of origin[1] (y-axis) and origin[2] (z-axis)
                    entry['origin'][1], entry['origin'][2] = entry['origin'][2], entry['origin'][1]

    return fully_grouped_data

def compileASDF(data):
    
    # Example usage with your provided data list
    normalized_data = normalize_data(data)
    sorted_data = group_by_z_origin(normalized_data)
    sorted_data = sort_cubes_by_size(sorted_data)
    sorted_data = sort_cubes_within_size_groups_by_distance(sorted_data)
    
    final_data = [three_adapt(sorted_data)]

    save_to_json_file(final_data, 'normalized_data.json')
    min_max_origin, min_max_widths = find_min_max_per_axis(normalized_data)
    print("Min and Max for Origin per Axis:", min_max_origin)
    print("Min and Max for Widths per Axis:", min_max_widths)    

if __name__ == "__main__":
    json_file_path = 'Torus.json'
    data = load_json(json_file_path)
    
    # plot_octree_from_json(json_file_path)
    min_origin, min_widths, max_origin, max_widths = find_global_min_max_values(data)
    # Example usage with your provided data list
    normalized_data = normalize_data(data)
    sorted_data = group_by_z_origin(normalized_data)
    sorted_data = sort_cubes_by_size(sorted_data)
    sorted_data = sort_cubes_within_size_groups_by_distance(sorted_data)
    save_to_json_file(sorted_data, 'test.json')
    final_data = three_adapt(sorted_data)
    # final_data = [sorted_data]

    save_to_json_file(final_data, '../recursive_swarm/asdf/json/normalized_data.json')
    save_to_json_file(final_data, 'normalized_data.json')
    min_max_origin, min_max_widths = find_min_max_per_axis(normalized_data)
    print("Min and Max for Origin per Axis:", min_max_origin)
    print("Min and Max for Width per Axis:", min_max_widths)


    
