# import json
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from scipy.spatial import Delaunay
from Wrapper import get_blender_data

from matplotlib.colors import Normalize

# scale_factor = 40
# # Function to compute the distance from a point to a line segment (edge)
# def point_to_edge_distance(point, edge_start, edge_end):
#     # Vector from edge start to point
#     edge_to_point = point - edge_start
#     # Vector from edge start to edge end
#     edge_vector = edge_end - edge_start
#     # Project edge_to_point onto edge_vector
#     projection = np.dot(edge_to_point, edge_vector) / np.linalg.norm(edge_vector)**2
#     # Clamp projection between 0 and 1 to find the closest point on the line segment
#     projection = np.clip(projection, 0, 1)
#     # Find the closest point on the line segment
#     closest_point = edge_start + projection * edge_vector
#     # Return the distance from the point to the closest point on the edge
#     return np.linalg.norm(edge_to_point - closest_point)



# # Function to compute the SDF for a single point
# def sdf(point, vertices, edges, del_hull):
#     # Initialize the minimum distance to a high number
#     min_distance = np.inf
#     # Check each edge
#     for edge in edges:
#         # Get the vertex indices of the edge
#         v1, v2 = edge['v1'], edge['v2']
#         # Compute the distance from the point to this edge
#         distance = point_to_edge_distance(point, vertices[v1], vertices[v2])
#         # If this is the closest edge so far, update min_distance
#         min_distance = min(min_distance, distance)
#     # Use Delaunay's find_simplex method to check if the point is inside the convex hull
#     if del_hull.find_simplex(point) >= 0:
#         return min_distance  # Point is inside the convex hull
#     else:
#         return -min_distance  # Point is outside the convex hull

# Function to plot a 3D SDF
# Function to plot a 3D SDF
def plot_3d_sdf(sdf_values, scale_factor, slice_fraction=0.5):
    fig = plt.figure(figsize=(10, 7))
    ax = fig.add_subplot(111, projection='3d')

    # Create a grid for the indices that matches the re-centered vertices
    grid_range = np.linspace(-1.5, 1.5, scale_factor)
    x, y, z = np.meshgrid(grid_range, grid_range, grid_range)
    x, y, z = x.flatten(), y.flatten(), z.flatten()
    
    # Offset the grid by the centroid to plot the SDF values in the correct position
    # x -= centroid[0]
    # y -= centroid[1]
    # z -= centroid[2]
    
    sdf_flattened = sdf_values.flatten()

    # Slice the data: remove a quarter going into the center
    mask = (x < slice_fraction * scale_factor) | (y > slice_fraction * scale_factor) | (z < slice_fraction * scale_factor)
    x = x[mask]
    y = y[mask]
    z = z[mask]
    sdf_flattened = sdf_flattened[mask]

    # Plot the points with SDF values
    scatter = ax.scatter(x, y, z, c=sdf_flattened, cmap='rainbow', marker='o', alpha=0.9)
    fig.colorbar(scatter, shrink=0.5, aspect=5, label='Signed Distance')

    # Set labels and title
    ax.set_xlabel('X axis')
    ax.set_ylabel('Y axis')
    ax.set_zlabel('Z axis')
    ax.set_title('3D Signed Distance Field with Quarter Slice')

    # Show the plot
    plt.show()


    

    # Plot the points with SDF values
    scatter = ax.scatter(x, y, z, c=sdf_flattened, cmap='rainbow', marker='o', alpha=0.9)
    fig.colorbar(scatter, shrink=0.5, aspect=5, label='Signed Distance')

    # Set labels and title
    ax.set_xlabel('X axis')
    ax.set_ylabel('Y axis')
    ax.set_zlabel('Z axis')
    ax.set_title('3D Signed Distance Field with Quarter Slice')

    # Show the plot
    plt.show()

# def load_sdf(data, scale_factor):
#     # Convert vertices to a numpy array for easier manipulation
#     vertices = np.array([[v['x'], v['y'], v['z']] for v in data['vertices']])

#     # Calculate the centroid of the vertices
#     centroid = np.mean(vertices, axis=0)

#     # Re-center the vertices around the origin
#     vertices -= centroid

#     del_hull = Delaunay(vertices)
#     # Adjust the linspace to be normalized to the dimensions of the shape
#     x = np.linspace(-1.5, 1.5, scale_factor) 
#     y = np.linspace(-1.5, 1.5, scale_factor)
#     z = np.linspace(-1.5, 1.5, scale_factor)
#     X, Y, Z = np.meshgrid(x, y, z)

#     # Compute the SDF for each point on the grid
#     sdf_values = np.zeros((scale_factor, scale_factor, scale_factor))
#     for i in range(scale_factor):
#         print(f"block {i} of {scale_factor}")
#         for j in range(scale_factor):
#             for k in range(scale_factor):
#                 point = np.array([X[i,j,k], Y[i, j, k], Z[i, j, k]])
#                 sdf_values[i, j, k] = sdf(point, vertices, data['edges'], del_hull)
#     print("sdf complete")
#     print("sdf complete")
#     return sdf_values, centroid
    
    
if __name__ == "__main__":
    # Load your JSON data
    data = get_blender_data()


    # Compute the SDF values
    # sdf_values, centroid = load_sdf(data, scale_factor)
    # # print(sdf_values)

    # # Call the plotting function
    # plot_3d_sdf(sdf_values, scale_factor, centroid)

    # Save the SDF values to a file
    # np.save('sdf_values.npy', sdf_values)
