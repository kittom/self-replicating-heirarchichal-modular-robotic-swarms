function drawGraph(setup){
    scale=10.0;
    offset = 8
    gData = {
        nodes: setup.nodes.map(node => ({ 
        id: node.id,
        px:node.position.x*scale,
        py:node.position.y*scale,
        pz:node.position.z*scale,
        dx:node.displacement.x*scale,
        dy:node.displacement.y*scale,
        dz:node.displacement.z*scale,
        nomSize:node.nomSize,
        viz:node.viz,
        order:node.order
        })),
        links: setup.edges
        .filter(edge => edge.id)
        .map(edge => ({
            source: edge.source,
            target: edge.target,
        //   color:getColor(edge.stress)
        }))
    };
    // MIN MAX Data
    // Initialize variables to store min/max values. Start with opposite extremes for min/max.
    let minNomSize = Infinity;
    let minPx = Infinity, maxPx = -Infinity;
    let minPy = Infinity, maxPy = -Infinity;
    let minPz = Infinity, maxPz = -Infinity;

    gData.nodes.forEach(node => {
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

    Graph1 = ForceGraph3D({ controlType: 'orbit' }).backgroundColor(color2)
        (document.getElementById('graph1'))
        .d3Force('center', null)
        .d3Force('charge', null)
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
        .nodeThreeObject(node => {
            var mesh =new THREE.Mesh(
                new THREE.BoxGeometry(scale*node.nomSize*0.9, scale*node.nomSize*0.9, scale*node.nomSize*0.9),
                new THREE.MeshLambertMaterial({
                color: getColor(node.order,maxOrder  ,0,colormap),
                transparent: true,
                opacity: node.viz
            }));
            if(node.viz==0){
                mesh.visible=false;
            }
            return mesh;
        })
        .d3Force('box', () => {

        gData.nodes.forEach(node => {
            node.fx=node.px;
            node.fy=node.py;
            node.fz=node.pz;

        });
        })
        
        .cooldownTime(Infinity)
        .graphData(gData)
        // .height(window.innerHeight/3);
        .width(1*window.innerWidth/2.1);
        // .height(window.innerHeight);

    var count=0;
    var totalCount=0;
    var increment=true;
    var speed=100;
    var exaggeration=10000.0;

    // Update this section to build a grid of boxes. 
    //
    let cubeSize = scale * minNomSize * 0.9;
    let startX = minPx - offset * cubeSize;
    let startZ = minPz - offset* cubeSize;
    let endX = maxPx + offset* cubeSize;
    let endZ = maxPz +offset* cubeSize;

    // Calculate the number of cubes along each axis
    let cubesX = Math.ceil((endX - startX) / cubeSize);
    let cubesZ = Math.ceil((endZ - startZ) / cubeSize);
    //
    let cubeGeometry = new THREE.BoxGeometry(cubeSize * 0.8, cubeSize * 0.8, cubeSize * 0.8);
    let cubeMaterial = new THREE.MeshBasicMaterial({color: 0xdddddd, transparent: true, opacity: 0.5});
    
    // Generate and add cubes
    for (let i = 0; i < cubesX; i++) {
        for (let j = 0; j < cubesZ; j++) {
            let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            cube.position.x = startX + i * cubeSize + cubeSize / 2 - (scale * minNomSize * 0.45); // Center the cube
            cube.position.y = -cubeSize /2; // Y position is 0
            cube.position.z = startZ + j * cubeSize + cubeSize / 2 - (scale * minNomSize * 0.45); // Center the cube

            cube.name = `Grid Box ${cubesX}, ${cubesZ}`;
            Graph1.scene().add(cube);
        }
    }



    // Attach the event listener


    var geometry = new THREE.ConeGeometry( scale*10*1.15, scale*16*1.15, 32 );
    var material = new THREE.MeshBasicMaterial( {color: color3} );
    cone = new THREE.Mesh( geometry, material );
    cone.position.y=scale*16*1.15/2.0;
    cone.visible = false

    Graph1.scene().add( cone );
}

