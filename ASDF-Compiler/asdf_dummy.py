import json
import math
from asdf_comp import normalize_data, three_adapt, group_by_z_origin, sort_cubes_by_size, sort_and_group_by_euclidean_distance



# load data
def load_json(json_file_path):
    with open(json_file_path, 'r') as file:
        nodes = json.load(file)
        return nodes

def save_to_json_file(data, file_name):
    with open(file_name, 'w') as f:
        json.dump(data, f, indent=4)



if __name__ == '__main__':
    data = load_json('octree_data.json')
    data = normalize_data(data)
    data = group_by_z_origin(data)
    data = sort_cubes_by_size(data)
    data =  sort_and_group_by_euclidean_distance(data)
    data = three_adapt(data)
    data = data
    save_to_json_file(data, '../recursive_swarm/asdf/json/basic_norm.json')