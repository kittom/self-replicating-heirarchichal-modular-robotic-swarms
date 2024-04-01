function createBuildList1(json, setup, scale) {
  var offset2 = 12;
  var offset = offset2 + 8;
  var buildSize = 32;
  var gridSize = buildSize + 2 * offset;
  var opacity = 0.9;
  var order1 = 0;

  var voxelIndexList = [
    null,
    {
      size: 1,
      list: [new THREE.Vector3(0, 0, 0)],
    },
    {
      size: 2,
      list: [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(1, 1, 0),
        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 1, 1),
        new THREE.Vector3(1, 0, 1),
        new THREE.Vector3(1, 1, 1),
      ],
    },
    null,
    {
      size: 4,
      list: [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(0, 2, 0),
        new THREE.Vector3(0, 3, 0),

        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(1, 1, 0),
        new THREE.Vector3(1, 2, 0),
        new THREE.Vector3(1, 3, 0),

        new THREE.Vector3(2, 0, 0),
        new THREE.Vector3(2, 1, 0),
        new THREE.Vector3(2, 2, 0),
        new THREE.Vector3(2, 3, 0),

        new THREE.Vector3(3, 0, 0),
        new THREE.Vector3(3, 1, 0),
        new THREE.Vector3(3, 2, 0),
        new THREE.Vector3(3, 3, 0),

        new THREE.Vector3(0, 0, 1),
        new THREE.Vector3(0, 1, 1),
        new THREE.Vector3(0, 2, 1),
        new THREE.Vector3(0, 3, 1),

        new THREE.Vector3(1, 0, 1),
        // new THREE.Vector3(1,1,1),
        // new THREE.Vector3(1,2,1),
        new THREE.Vector3(1, 3, 1),

        new THREE.Vector3(2, 0, 1),
        // new THREE.Vector3(2,1,1),
        // new THREE.Vector3(2,2,1),
        new THREE.Vector3(2, 3, 1),

        new THREE.Vector3(3, 0, 1),
        new THREE.Vector3(3, 1, 1),
        new THREE.Vector3(3, 2, 1),
        new THREE.Vector3(3, 3, 1),

        new THREE.Vector3(0, 0, 2),
        new THREE.Vector3(0, 1, 2),
        new THREE.Vector3(0, 2, 2),
        new THREE.Vector3(0, 3, 2),

        new THREE.Vector3(1, 0, 2),
        // new THREE.Vector3(1,1,2),
        // new THREE.Vector3(1,2,2),
        new THREE.Vector3(1, 3, 2),

        new THREE.Vector3(2, 0, 2),
        // new THREE.Vector3(2,1,2),
        // new THREE.Vector3(2,2,2),
        new THREE.Vector3(2, 3, 2),

        new THREE.Vector3(3, 0, 2),
        new THREE.Vector3(3, 1, 2),
        new THREE.Vector3(3, 2, 2),
        new THREE.Vector3(3, 3, 2),

        new THREE.Vector3(0, 0, 3),
        new THREE.Vector3(0, 1, 3),
        new THREE.Vector3(0, 2, 3),
        new THREE.Vector3(0, 3, 3),

        new THREE.Vector3(1, 0, 3),
        new THREE.Vector3(1, 1, 3),
        new THREE.Vector3(1, 2, 3),
        new THREE.Vector3(1, 3, 3),

        new THREE.Vector3(2, 0, 3),
        new THREE.Vector3(2, 1, 3),
        new THREE.Vector3(2, 2, 3),
        new THREE.Vector3(2, 3, 3),

        new THREE.Vector3(3, 0, 3),
        new THREE.Vector3(3, 1, 3),
        new THREE.Vector3(3, 2, 3),
        new THREE.Vector3(3, 3, 3),
      ],
    },
  ];

  var totalNumber = 0;

  var shift = gridSize / 2.0;

  var buildList = {
    currentZIndex: 0,
    maxZIndex: json.length,
    listZ: [],
    done: false,
    availablePickup: [],
    listToBuild: [],
  };
  // todo multiply by 4 as smallest size in cubeCone is 0.25
  // y is z and z is y
  // shift z by 1 cause sacrificial layer is 0
  // shift x and y to not have negative values

  for (var i = 0; i < json.length; i++) {
    //for each z layer bin
    buildList.listZ.push({
      layerZ: json[i][0][0][0].origin[1] * scale + 1,
      done: false,
      currentSizeIndex: 0,
      maxSizeIndex: json[i].length,
      listSize: [],
    });
    for (var j = 0; j < json[i].length; j++) {
      //for each size bin
      buildList.listZ[i].listSize.push({
        size: json[i][j][0][0].widths[0] * scale,
        layerZ: buildList.listZ[i].layerZ,
        done: false,
        currentSDFIndex: 0,
        maxSDFIndex: json[i][j].length,
        listSDF: [],
      });
      for (var k = 0; k < json[i][j].length; k++) {
        //for each sdf bin (signed distance field)
        buildList.listZ[i].listSize[j].listSDF.push({
          sdfRank: k,
          layerZ: buildList.listZ[i].layerZ,
          size: buildList.listZ[i].listSize[j].size,
          done: false,
          currentCubeIndex: 0,
          maxCubeIndex: json[i][j][k].length,
          listCubes: [],
        });

        for (var l = 0; l < json[i][j][k].length; l++) {
          //for each cube add location (todo check if int)
          var stockBuilt = false;
          totalNumber +=
            buildList.listZ[i].listSize[j].size *
            buildList.listZ[i].listSize[j].size *
            buildList.listZ[i].listSize[j].size;

          if (buildList.listZ[i].listSize[j].size == 1) {
            stockBuilt = true;
          }
          buildList.listZ[i].listSize[j].listSDF[k].listCubes.push({
            layerZ: buildList.listZ[i].layerZ,
            size: buildList.listZ[i].listSize[j].size,
            sdfRank: buildList.listZ[i].listSize[j].listSDF[k].sdfRank,
            done: false,
            stockBuilt: stockBuilt,
            stockAssigned: false,
            stockPickedUp: false,
            position: new THREE.Vector3(
              json[i][j][k][l].origin[0] * scale + shift,
              json[i][j][k][l].origin[2] * scale + shift,
              json[i][j][k][l].origin[1] * scale + 1
            ),
          });
          var nomSize = buildList.listZ[i].listSize[j].size;
          var x = json[i][j][k][l].origin[0] * scale;
          var y = json[i][j][k][l].origin[1] * scale;
          var z = json[i][j][k][l].origin[2] * scale;

          // if(true){
          // if(json[i][j][k][l].origin[2]*scale+nomSize/2.0<0){
          if (
            json[i][j][k][l].origin[2] * scale + nomSize / 2.0 < 0 ||
            json[i][j][k][l].origin[0] * scale + nomSize / 2.0 < 0
          ) {
            setup.nodes.push({
              id: "[" + nomSize + "," + x + "," + y + "," + z + "]",
              position: {
                x: x + nomSize / 2.0,
                y: y + nomSize / 2.0,
                z: z + nomSize / 2.0,
              },
              displacement: {
                x: 0,
                y: 0,
                z: 0,
              },
              nomSize: nomSize,
              orgNomSize: nomSize,
              viz: opacity,
              order: order1,
            });

            addEdge(setup, nomSize, nomSize, x, y, z, opacity);

            if (nomSize == 2) {
              for (var ii = 0; ii < voxelIndexList[2].list.length; ii++) {
                var nomSize1 = 1;
                var x1 = x + voxelIndexList[2].list[ii].x;
                var y1 = y + voxelIndexList[2].list[ii].y;
                var z1 = z + voxelIndexList[2].list[ii].z;

                setup.nodes.push({
                  id: "[" + nomSize1 + "," + x1 + "," + y1 + "," + z1 + "]",
                  position: {
                    x: x1 + nomSize1 / 2.0,
                    y: y1 + nomSize1 / 2.0,
                    z: z1 + nomSize1 / 2.0,
                  },
                  displacement: {
                    x: 0,
                    y: 0,
                    z: 0,
                  },
                  nomSize: nomSize1,
                  orgNomSize: nomSize,
                  viz: 0.0,
                  order: order1,
                });

                addEdge(setup, nomSize1, nomSize, x1, y1, z1, 0);
              }
            }

            if (nomSize == 4) {
              for (var ii = 0; ii < voxelIndexList[4].list.length; ii++) {
                var nomSize1 = 1;
                var x1 = x + voxelIndexList[4].list[ii].x;
                var y1 = y + voxelIndexList[4].list[ii].y;
                var z1 = z + voxelIndexList[4].list[ii].z;

                setup.nodes.push({
                  id: "[" + nomSize1 + "," + x1 + "," + y1 + "," + z1 + "]",
                  position: {
                    x: x1 + nomSize1 / 2.0,
                    y: y1 + nomSize1 / 2.0,
                    z: z1 + nomSize1 / 2.0,
                  },
                  displacement: {
                    x: 0,
                    y: 0,
                    z: 0,
                  },
                  nomSize: nomSize1,
                  orgNomSize: nomSize,
                  viz: 0.0,
                  order: order1,
                });

                addEdge(setup, nomSize1, nomSize, x1, y1, z1, 0);
              }
            }
          }
        }
        order1++;
      }
    }
  }

  console.log("total number of blocks=" + totalNumber);

  maxOrder = order1;
  console.log(maxOrder);
  return buildList;
}

function addEdge(setup, nomSize, orgNomSize, x, y, z, viz) {
  var source = "[" + nomSize + "," + x + "," + y + "," + z + "]";

  for (var i = -1; i < 2; i++) {
    for (var j = -1; j < 2; j++) {
      for (var k = -1; k < 2; k++) {
        if ((i == 0 && j == 0) || (i == 0 && k == 0) || (j == 0 && k == 0)) {
          //not same voxel and no diagonals
          if (!(i == 0 && j == 0 && k == 0)) {
            var x1 = x + i * nomSize;
            var y1 = y + j * nomSize;
            var z1 = z + k * nomSize;
            var target = "[" + nomSize + "," + x1 + "," + y1 + "," + z1 + "]";
            var node = setup.nodes.find((v) => v.id === target);
            if (node !== undefined) {
              if (!(viz == 0 && node.viz == 0)) {
                setup.edges.push({
                  id: "e" + setup.edges.length,
                  source: source,
                  target: target,
                  stress: 0,
                });
              }
              if (orgNomSize != node.orgNomSize) {
                setup.edges.push({
                  id: "e" + setup.edges.length,
                  source: source,
                  target: target,
                  stress: 0,
                });
              }
            }
          }
        }
      }
    }
  }
}

function drawGraph(setup) {
  scale = 10.0;
  offset = 8;
  gData = {
    nodes: setup.nodes.map((node) => ({
      id: node.id,
      px: node.position.x * scale,
      py: node.position.y * scale,
      pz: node.position.z * scale,
      dx: node.displacement.x * scale,
      dy: node.displacement.y * scale,
      dz: node.displacement.z * scale,
      nomSize: node.nomSize,
      viz: node.viz,
      order: node.order,
    })),
    links: setup.edges
      .filter((edge) => edge.id)
      .map((edge) => ({
        source: edge.source,
        target: edge.target,
        //   color:getColor(edge.stress)
      })),
  };
  // MIN MAX Data
  // Initialize variables to store min/max values. Start with opposite extremes for min/max.
  let minNomSize = Infinity;
  let minPx = Infinity,
    maxPx = -Infinity;
  let minPy = Infinity,
    maxPy = -Infinity;
  let minPz = Infinity,
    maxPz = -Infinity;

  gData.nodes.forEach((node) => {
    // Update minimum nomSize
    if (node.nomSize < minNomSize) minNomSize = node.nomSize;

    // Update minimum and maximum px values
    if (node.px < minPx) minPx = node.px;
    if (node.px > maxPx) maxPx = node.px;

    // Update minimum and maximum py values
    if (node.py < minPy) minPy = node.py;
    if (node.py > maxPy) maxPy = node.py;

    // Update minimum and maximum pz values
    if (node.pz < minPz) minPz = node.pz;
    if (node.pz > maxPz) maxPz = node.pz;
  });

  // Logging the results
  console.log(`Minimum nomSize: ${minNomSize}`);
  console.log(`Minimum px: ${minPx}, Maximum px: ${maxPx}`);
  console.log(`Minimum py: ${minPy}, Maximum py: ${maxPy}`);
  console.log(`Minimum pz: ${minPz}, Maximum pz: ${maxPz}`);

  Graph1 = ForceGraph3D({ controlType: "orbit" })
    .backgroundColor(color2)(document.getElementById("graph1"))
    .d3Force("center", null)
    .d3Force("charge", null)
    .linkWidth(1.0)
    .linkOpacity(1.0)
    // .nodeThreeObject(({ nomSize,viz,order }) => new THREE.Mesh(
    //     new THREE.BoxGeometry(scale*nomSize*0.9, scale*nomSize*0.9, scale*nomSize*0.9),
    //     new THREE.MeshLambertMaterial({
    //     color: getColor(order, maxOrder+1 ,-1,colormap),
    //     transparent: true,
    //     opacity: viz
    // })
    // )
    // )
    .nodeThreeObject((node) => {
      var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          scale * node.nomSize * 0.9,
          scale * node.nomSize * 0.9,
          scale * node.nomSize * 0.9
        ),
        new THREE.MeshLambertMaterial({
          color: getColor(node.order, maxOrder, 0, colormap),
          transparent: true,
          opacity: node.viz,
        })
      );
      if (node.viz == 0) {
        mesh.visible = false;
      }
      return mesh;
    })
    .d3Force("box", () => {
      gData.nodes.forEach((node) => {
        node.fx = node.px;
        node.fy = node.py;
        node.fz = node.pz;
      });
    })

    .cooldownTime(Infinity)
    .graphData(gData)
    // .height(window.innerHeight/3);
    .width((1 * window.innerWidth) / 2.1);
  // .height(window.innerHeight);

  var count = 0;
  var totalCount = 0;
  var increment = true;
  var speed = 100;
  var exaggeration = 10000.0;

  // Update this section to build a grid of boxes.
  //
  let cubeSize = scale * minNomSize * 0.9;
  let startX = minPx - offset * cubeSize;
  let startZ = minPz - offset * cubeSize;
  let endX = maxPx + offset * cubeSize;
  let endZ = maxPz + offset * cubeSize;

  // Calculate the number of cubes along each axis
  let cubesX = Math.ceil((endX - startX) / cubeSize);
  let cubesZ = Math.ceil((endZ - startZ) / cubeSize);
  //
  let cubeGeometry = new THREE.BoxGeometry(
    cubeSize * 0.8,
    cubeSize * 0.8,
    cubeSize * 0.8
  );
  let cubeMaterial = new THREE.MeshBasicMaterial({
    color: 0xdddddd,
    transparent: true,
    opacity: 0.5,
  });

  // Generate and add cubes
  for (let i = 0; i < cubesX; i++) {
    for (let j = 0; j < cubesZ; j++) {
      let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
      cube.position.x =
        startX + i * cubeSize + cubeSize / 2 - scale * minNomSize * 0.45; // Center the cube
      cube.position.y = -cubeSize / 2; // Y position is 0
      cube.position.z =
        startZ + j * cubeSize + cubeSize / 2 - scale * minNomSize * 0.45; // Center the cube

      cube.name = `Grid Box ${cubesX}, ${cubesZ}`;
      Graph1.scene().add(cube);
    }
  }

  // Attach the event listener

  var geometry = new THREE.ConeGeometry(
    scale * 10 * 1.15,
    scale * 16 * 1.15,
    32
  );
  var material = new THREE.MeshBasicMaterial({ color: color3 });
  cone = new THREE.Mesh(geometry, material);
  cone.position.y = (scale * 16 * 1.15) / 2.0;
  cone.visible = false;

  Graph1.scene().add(cone);
}

function getColor(value, min, max, colormap) {
  var val = map(value, min, max, 1.0, 0.5);
  color = interpolateLinearly(val, colormap);
  // return new THREE.Color(color[0],color[1],color[2]);
  return new THREE.Color(color[0], color[1], color[2]).getHex();
}

function map(value, x1, y1, x2, y2) {
  return ((value - x1) * (y2 - x2)) / (y1 - x1) + x2;
}

function interpolateLinearly(x, values) {
  // Split values into four lists
  var x_values = [];
  var r_values = [];
  var g_values = [];
  var b_values = [];
  for (i in values) {
    x_values.push(values[i][0]);
    r_values.push(values[i][1][0]);
    g_values.push(values[i][1][1]);
    b_values.push(values[i][1][2]);
  }
  var i = 1;
  while (x_values[i] < x) {
    i = i + 1;
  }
  i = i - 1;
  var width = Math.abs(x_values[i] - x_values[i + 1]);
  var scaling_factor = (x - x_values[i]) / width;
  // Get the new color values though interpolation
  var r = r_values[i] + scaling_factor * (r_values[i + 1] - r_values[i]);
  var g = g_values[i] + scaling_factor * (g_values[i + 1] - g_values[i]);
  var b = b_values[i] + scaling_factor * (b_values[i + 1] - b_values[i]);
  return [enforceBounds(r), enforceBounds(g), enforceBounds(b)];
}

function enforceBounds(x) {
  if (x < 0) {
    return 0;
  } else if (x > 1) {
    return 1;
  } else {
    return x;
  }
}

const graph = ForceGraph3D({ controlType: "orbit" })
  .backgroundColor(color2)
  .dagMode("td")
  .dagLevelDistance(150)
  .linkColor(() => "rgba(127,127,127,0.5)")
  .nodeThreeObject((node) => {
    var use = node.level <= 2;
    // Use a cube geometry as specified
    const geometry = new THREE.BoxGeometry(
      node.size / 25,
      node.size / 25,
      node.size / 25
    );
    const material = new THREE.MeshBasicMaterial({
      depthWrite: false, // Optional based on your visual needs
      transparent: true,
      opacity: use ? 1 : 0, // Changed logic to match your use case
    });
    const obj = new THREE.Mesh(geometry, material);

    return obj; // Make sure to return the object
  });
