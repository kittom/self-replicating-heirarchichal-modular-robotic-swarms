from Wrapper import get_blender_data
from sdf import load_sdf
import numpy as np
from octree import find_positive_sdf_bounds, build_octree, update_loading_bar, write_to_json
from asdf_comp import find_global_min_max_values, find_min_max_per_axis, load_json, normalize_data, group_by_z_origin, save_to_json_file, sort_cubes_by_size, sort_cubes_within_size_groups_by_distance, three_adapt


if __name__ == "__main__":
    scale_factor = 40
    data = get_blender_data()

     # Compute the SDF values
    sdf_values, centroid = load_sdf(data, scale_factor)
    print(sdf_values)

    # Save the SDF values to a file
    np.save('sdf_values.npy', sdf_values)

    # Build the octree
    # Find bounds for positive SDF values
    min_coords, max_coords = find_positive_sdf_bounds(sdf_values)

    # Adjust root corner and size based on positive SDF bounds
    root_corner = min_coords
    root_size = max(max_coords[i] - min_coords[i] for i in range(3))
    print(f"Adjusted Root Size: {root_size}")
    print("Building Octree")
    octree = build_octree(sdf_values, root_corner, root_size)
    update_loading_bar(root_size, True, root_size, True)
    


    print("Octree Built")
    print("Writing octree data")
    json_file_path = 'octree_data.json'
    write_to_json(octree, json_file_path, root_size)
    print("Data written")

    
    # plot_octree_from_json(json_file_path)
    min_origin, min_widths, max_origin, max_widths = find_global_min_max_values(octree)
    # Example usage with your provided data list
    normalized_data = normalize_data(octree)
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