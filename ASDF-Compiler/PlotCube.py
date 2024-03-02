import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from Wrapper import get_blender_data

# Your JSON data as a dictionary
cube_data = get_blender_data()

# Initialize a 3D plot
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

# Extract vertices
vertices = cube_data['vertices']
# Create a list of tuples from the dictionary
points = [(v['x'], v['y'], v['z']) for v in vertices]

# Extract edges
edges = cube_data['edges']

# Plot the edges
for edge in edges:
    # Get the starting and ending point indices for each edge
    start_point = points[edge['v1']]
    end_point = points[edge['v2']]

    # Plot the line between the start and end points
    ax.plot([start_point[0], end_point[0]],
            [start_point[1], end_point[1]],
            [start_point[2], end_point[2]],
            'black')  # You can change the color if you want

# Set plot display parameters
ax.set_xlabel('X axis')
ax.set_ylabel('Y axis')
ax.set_zlabel('Z axis')
ax.set_title('3D Cube Reconstruction')

# Show the plot
plt.show()
