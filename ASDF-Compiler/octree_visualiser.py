import sys
import json
import numpy as np
from PyQt5.QtWidgets import QApplication, QMainWindow, QVBoxLayout, QWidget, QSlider
from PyQt5.QtCore import Qt
from matplotlib.figure import Figure
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from mpl_toolkits.mplot3d import Axes3D
from asdf_comp import normalize_data, find_global_min_max_values
import math


def load_json(json_file_path):
    with open(json_file_path, 'r') as file:
        nodes = json.load(file)
        return nodes



class Visualiser(QMainWindow):
    def __init__(self, cubes, parent=None):
        super(Visualiser, self).__init__(parent)
        
        # Store cubes data
        self.cubes = cubes

        
        # Set up the main window
        self.setWindowTitle('3D Cubes Visualisation with Z-Layer Adjustment')
        self.setGeometry(100, 100, 800, 600)
        
        # Create a central widget
        self.central_widget = QWidget()
        self.setCentralWidget(self.central_widget)
        
        # Create a vertical layout
        self.layout = QVBoxLayout(self.central_widget)
        
        # Create the matplotlib figure and canvas
        self.figure = Figure()
        self.canvas = FigureCanvas(self.figure)
        self.layout.addWidget(self.canvas)
        (self.min_x, self.max_x), (self.min_y, self.max_y), (self.min_z, self.max_z), (self.min_width, self.max_width) = find_global_min_max_values(self.cubes)
        # Add a slider for z-layer adjustment
        self.slider = QSlider(Qt.Horizontal)
        self.slider.setMinimum(0)
        self.slider.setMaximum(math.ceil(self.max_z))  
        self.slider.setValue(10)  # Start with all layers visible
        self.slider.valueChanged.connect(self.update_plot)
        self.layout.addWidget(self.slider)
        
        # Initial plot
        self.update_plot()

    def update_plot(self):
        # Clear the previous figure
        self.figure.clear()
        
        # Create a 3D subplot
        ax = self.figure.add_subplot(111, projection='3d')
        ax.set_xlabel('X')
        ax.set_ylabel('Y')
        ax.set_zlabel('Z')
        ax.set_xlim([self.min_x,self.max_x])
        ax.set_ylim([self.min_y,self.max_y])
        ax.set_zlim([self.min_z,self.max_z])
        
        
        # Get the current z-layer limit from the slider
        z_limit = self.slider.value()
        
        # Draw each cube with z-layer filtering
        for cube in self.cubes:
            if cube['origin'][2] < z_limit:
                
                self.draw_cube(ax, cube['origin'], cube['widths'])
                
        
        # Refresh the canvas
        self.canvas.draw()

    def draw_cube(self, ax, origin, widths):
        # Generate cube vertices and draw the cube
        for s in range(2):
            for t in range(2):
                ax.plot3D(*zip(*[(origin[0] + s*widths[0], origin[1] + t*widths[1], origin[2]),
                                (origin[0] + s*widths[0], origin[1] + t*widths[1], origin[2] + widths[2])]), color="b")
                ax.plot3D(*zip(*[(origin[0], origin[1] + s*widths[1], origin[2] + t*widths[2]),
                                (origin[0] + widths[0], origin[1] + s*widths[1], origin[2] + t*widths[2])]), color="b")
                ax.plot3D(*zip(*[(origin[0] + t*widths[0], origin[1], origin[2] + s*widths[2]),
                                (origin[0] + t*widths[0], origin[1] + widths[1], origin[2] + s*widths[2])]), color="b")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    
    # Load your cubes data
    cubes = load_json('Torus.json')
    
    cubes = normalize_data(cubes)
    
    # Create and show the visualiser
    visualiser = Visualiser(cubes)
    
    visualiser.show()
    
    
    
    sys.exit(app.exec_())
