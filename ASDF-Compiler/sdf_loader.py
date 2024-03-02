import numpy as np
import trimesh
from sdf import plot_3d_sdf

def average_neighborhood(sdf_values):
    """
    Smooth the SDF values by averaging each point with its neighborhood.

    :param sdf_values: A 3D numpy array containing the SDF values.
    :return: A 3D numpy array of the same shape, with smoothed values.
    """
    smoothed_values = np.copy(sdf_values)  # Copy the original values to avoid modifying in place
    
    # Get the shape of the grid
    nx, ny, nz = sdf_values.shape
    
    # Iterate over each point in the grid
    for x in range(1, nx - 1):
        for y in range(1, ny - 1):
            for z in range(1, nz - 1):
                # Compute the average of the point and its immediate neighbors
                neighborhood_avg = np.mean(sdf_values[x-1:x+2, y-1:y+2, z-1:z+2])
                smoothed_values[x, y, z] = neighborhood_avg
                
    return smoothed_values


def generate_random_directions(num_directions=10):
    """
    Generate random directions using stratified sampling over the unit sphere.
    The sphere is divided into `num_directions` strata, and one direction is randomly
    chosen within each stratum to ensure uniform coverage.
    """
    directions = []
    for i in range(num_directions):
        # Uniform sampling within each stratum in the azimuthal angle (phi)
        phi = 2 * np.pi * np.random.random()
        
        # Stratified sampling in the polar angle (theta)
        # Ensuring an even distribution of elevation angles
        cos_theta = 1 - (i + np.random.random()) / num_directions
        sin_theta = np.sqrt(1 - cos_theta**2)
        
        # Spherical to Cartesian conversion
        x = sin_theta * np.cos(phi)
        y = sin_theta * np.sin(phi)
        z = cos_theta
        directions.append([x, y, z])
    
    return np.array(directions)

def signed_distance(mesh, point):
    """
    Compute the signed distance from a point to the nearest surface of the mesh.

    :param mesh: The mesh to compute distances from.
    :param point: The point to compute the distance for.
    :return: The signed distance from the point to the mesh. Negative inside, positive outside.
    """
    # Find the closest point on the mesh and the distance
    closest_point, distance, _ = trimesh.proximity.closest_point(mesh, [point])

    # Use ray casting to determine if the point is inside or outside the mesh
    inside = is_point_inside(mesh, point, num_rays=1)  # Using a single ray for inside/outside check
    
    # Adjust the sign based on inside/outside status
    signed_distance = distance if inside == 1 else -distance
    return signed_distance

def is_point_inside(mesh, point, num_rays=1):
    """
    Simplified inside/outside check using a single ray in a fixed direction.
    """
    ray_origins = np.array([point])
    ray_directions = np.array([[0, 0, 1]])  # Arbitrary direction; adjust as needed
    
    # Count intersections
    locations, index_ray, index_tri = mesh.ray.intersects_location(ray_origins, ray_directions)
    inside = len(locations) % 2 == 1
    
    return 1 if inside else -1

def load_sdf(mesh, scale_factor):
    """
    Generate SDF values for a mesh within a specified grid.

    :param mesh: The mesh to generate the SDF for.
    :param scale_factor: The resolution of the grid.
    """
    # Adjust bounds to fit mesh dimensions
    min_bound, max_bound = mesh.bounds
    x = np.linspace(min_bound[0], max_bound[0], scale_factor) 
    y = np.linspace(min_bound[1], max_bound[1], scale_factor)
    z = np.linspace(min_bound[2], max_bound[2], scale_factor)
    X, Y, Z = np.meshgrid(x, y, z)

    # Compute SDF for each point
    sdf_values = np.zeros((scale_factor, scale_factor, scale_factor))
    for i in range(scale_factor):
        print(f"Layer {i} of {scale_factor}")
        for j in range(scale_factor):
            for k in range(scale_factor):
                point = np.array([X[i, j, k], Y[i, j, k], Z[i, j, k]])
                sdf_values[i, j, k] = signed_distance(mesh, point)
                
    return sdf_values

# Check if the point is inside or outside
if __name__ == '__main__':
    # Load your mesh
    mesh = trimesh.load('Cone.stl')
    scale_factor = 10
    sdf_values = load_sdf(mesh, scale_factor)
    # Assuming `sdf_values` is the 3D grid obtained from your SDF computation
    sdf_values_smoothed = average_neighborhood(sdf_values)


    plot_3d_sdf(sdf_values_smoothed, scale_factor)

    np.save('sdf_values.npy', sdf_values)
