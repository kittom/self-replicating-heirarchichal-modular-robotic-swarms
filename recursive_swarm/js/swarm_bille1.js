// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

function Bille(swarm, inputState,firstLoad=true) {
    this.inputState = inputState;
    this.swarm = swarm;
    this.spacing = swarm.spacing; //general spacing
    this.robotScale = this.inputState[2];
    this.voxelSpacing = this.robotScale * swarm.spacing; //spacing based on robot size

    console.log("voxelSpacing:"+this.voxelSpacing)
    this.bille = null;
    this.billeAngles = null;
    this.billePos = null;
    this.billePos1 = null;
    this.billePosition = null;

    this.billePos = this.swarm.setup.billePos;
    this.billePos1 = this.swarm.setup.billePos1;

    this.stepsDirection = this.swarm.setup.stepsDir; //todo remove later based on path planning

    this.targetGui = null;
    this.jointsGui = null;

    this.init();
    if(typeof swarm.setup.parametric!== undefined && swarm.setup.parametric){ //parametric Bill-E
        this.BilleSize=this.swarm.setup.BilleSize;
        if(this.BilleSize.rotatedJoint){
            this.loadRhino(swarm.setup.fileNameRot,true,firstLoad);
        }
        else{
            this.loadRhino(swarm.setup.fileName,true,firstLoad);
        }
    }
    else{
        this.loadRhino(swarm.setup.fileName,false,firstLoad);
    }

    if (swarm.setup.recursion) {
        // this.loadBilleRecursion(swarm.setup.fileNameParts);
        setTimeout(function () { recursiveBille.loadBilleRecursion(swarm.setup.fileNameParts); }, this.path.timeout += this.path.delay);
    }

}

Bille.prototype.startMovement = function () {
    this.generatePath(this.stepsDirection);
}

Bille.prototype.init = function () {
    this.id = 0; //todo change when you need multiple
    this.billeAngles = {
        j0: 0.0,
        j1: 0.0,
        j2: 0.0,
        j3: 0.0,
        j4: 0.0,
        j5: 0.0,
    };

    this.billeTarget = {
        x: this.inputState[1].x * this.voxelSpacing,
        y: this.inputState[1].y * this.voxelSpacing,
        z: this.inputState[1].z * this.voxelSpacing,
        rx: 0,
        ry: 0,
        rz: 0,
        targetEnd: "end 1"
    };

    this.bille = new THREE.Group();

    this.billePosition = this.inputState[0].clone().multiplyScalar(this.voxelSpacing);

    this.bille.position.x = this.billePosition.x;
    this.bille.position.y = this.billePosition.y;
    this.bille.position.z = this.billePosition.z;

    this.billeDirection = new THREE.Vector3(0, 0, 1);

    this.robotState = {
        leg1Pos: this.inputState[1].clone(),
        leg2Pos: this.inputState[0].clone(),
        up: new THREE.Vector3(0, 0, 1),
        forward: new THREE.Vector3(1, 0, 0), //todo change to make it parametric from inputState
    };
    this.steps = [];

    this.leg = 1;
    this.voxelNormal = 180;
    this.normalAdjustmentVector = new THREE.Vector3(0, 0, 0);

    this.path = {
        curve: null,
        currentPoint: 0,
        points: [],
        number: this.swarm.pathParams.number,
        delay: 1000 / this.swarm.speed,
        timeout: 1000,
        cHeight: this.swarm.pathParams.cHeight * this.voxelSpacing,
        showPath: this.swarm.pathParams.showPath,
        normals: [],
        changeLegs: [],
        changeRotation: [],
        normalAdjustments: [],
        rotations: [],
        j0: []
    };

    this.totalNumberofSteps = 0;
    this.carriedVoxel = [];

    this.flipped = false;
    this.loadArrows=[];
    
};

Bille.prototype.remove=function(){
    // objects=null;
    var selectedObject = this.swarm.scene.getObjectByName("RecursiveBille");
    this.swarm.scene.remove(selectedObject);
    var selectedObject = this.swarm.scene.getObjectByName("loadArrowsGroup");
    this.swarm.scene.remove(selectedObject);
    var selectedObject = this.swarm.scene.getObjectByName("targetBille");
    this.swarm.scene.remove(selectedObject);
    var selectedObject = this.swarm.scene.getObjectByName("controlBille");
    this.swarm.scene.remove(selectedObject);

    this.gui.destroy();
    this.lgui.destroy();
}

Bille.prototype.loadRhino=function(fileName,parametric,first){

    if(first){
        let fetchPromise = fetch(fileName);

        rhino3dm().then(async m => {
            this.swarm.rhino = m;

            let res = await fetchPromise;
            let buffer = await res.arrayBuffer();
            let arr = new Uint8Array(buffer);
            let doc = this.swarm.rhino.File3dm.fromByteArray(arr);
            this.swarm.rhinoDoc=doc;
            
            if (parametric){
                this.loadParametric();
            }else{
                this.load();
            }
        });

    }else{
        if (parametric){
            this.loadParametric();
        }else{
            this.load();
        }
    }
}

Bille.prototype.load = function () {
    var objects = this.swarm.rhinoDoc.objects();
    
    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1)

    var beta = 0.5;

    var material = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.8, 0.8, 0.8) });
    var material1 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.3, 0.3, 0.3) });
    var material2 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.6, 0.6, 0.6) });
    var material3 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0, 0.2, 0) });
    var material4 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.5, 0.5, 0) });
    var material5 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.1, 0.1, 0.1) });

    var material  = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(1.0, 1.0, 1.0) });
    var material1 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0.3, 0.3, 0.3) });
    var material2 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0.6, 0.6, 0.6) });
    var material3 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0, 0.2, 0) });
    var material4 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0.5, 0.5, 0) });
    var material5 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0.1, 0.1, 0.1) });

    let billeGroupsTemp = [
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group()
    ];

    for (let i = 0; i < objects.count; i++) {
        let mesh = objects.get(i).geometry();
        let layer = objects.get(i).attributes().layerIndex;
        // console.log(objects.get(i).attributes())
        if (mesh instanceof this.swarm.rhino.Mesh) {
            // convert all meshes in 3dm model into threejs objects

            let threeMesh;

            if (objects.get(i).attributes().name == 'grey' || objects.get(i).attributes().name == 'grey1' || objects.get(i).attributes().name == 'grey2' || objects.get(i).attributes().name == 'pcb') {
                threeMesh = meshToThreejs(mesh, material1);

            } else if (objects.get(i).attributes().name == 'motors') {
                threeMesh = meshToThreejs(mesh, material2);
            } else if (objects.get(i).attributes().name == 'controller') {
                threeMesh = meshToThreejs(mesh, material3);
            } else if (objects.get(i).attributes().name == 'connectors') {
                threeMesh = meshToThreejs(mesh, material4);
            } else if (objects.get(i).attributes().name == 'battery') {
                threeMesh = meshToThreejs(mesh, material5);
            } else {
                threeMesh = meshToThreejs(mesh, material);
            }
            // console.log(layer)
            threeMesh.position.x += this.billePos[layer - 1].x;
            threeMesh.position.y += this.billePos[layer - 1].y;
            threeMesh.position.z += this.billePos[layer - 1].z;

            billeGroupsTemp[layer - 1].add(threeMesh);
        }
    }

    for (let i = 0; i < billeGroupsTemp.length; i++) {
        billeGroupsTemp[i].name = "Group:" + i;
    }
    billeGroupsTemp[0].add(billeGroupsTemp[6].clone());

    this.bille.add(billeGroupsTemp[0].clone().add(billeGroupsTemp[1].clone().add(billeGroupsTemp[2].clone().add(billeGroupsTemp[3].clone().add(billeGroupsTemp[4].clone().add(billeGroupsTemp[5].clone()))))));

    
    this.bille.name="RecursiveBille";
    this.swarm.scene.add(this.bille);

    console.log("Loaded Bille!");

    this.GUI();
    // this.jointsGui = jointsGui;
    // this.targetGui = targetGui;

    this.createTarget();
    this.updateAngles();
    // this.startMovement();

    this.initLoads();


    

};

Bille.prototype.loadParametric = function () {
    var objects = this.swarm.rhinoDoc.objects();
    
    var wrist=0.3;
    var bille_parts={
        "g1":new THREE.Vector3(0.0   ,0.0                  ,- (1-1)*this.spacing -wrist ),//"g1",
        "c1":new THREE.Vector3(0.0   ,0.0                  ,- (1-1)*this.spacing-1*wrist),//"c1",
        "w1":new THREE.Vector3(0.0   ,0.0                  ,- (2-1)*this.spacing-1*wrist),//"w1",
        "e1_1":new THREE.Vector3(0.0 ,0.0                  ,- (2-1)*this.spacing-2*wrist),//"e1",
        "e1_2":new THREE.Vector3(0.0 ,0.0                  ,- (2-1)*this.spacing-2*wrist),//"e1",
        "v1":new THREE.Vector3(0.0   ,0.0                  ,- (3-1)*this.spacing-2*wrist  ),//"v1",
        "v1":new THREE.Vector3(0.0   ,0.0                  ,- (4-1)*this.spacing-2*wrist  ),//"v11",
        "w2":new THREE.Vector3(0.0   ,0.0                  ,- (4-1)*this.spacing-2*wrist  ),//"w2",
        "v2":new THREE.Vector3(0.0   , this.spacing+wrist  ,- (4-1)*this.spacing-2*wrist  ),//"v2",
        "v2":new THREE.Vector3(0.0   , this.spacing+wrist  ,- (5-1)*this.spacing-2*wrist  ),//"v22",
        "e2_1":new THREE.Vector3(0.0 , this.spacing+wrist  ,- (6-1)*this.spacing-2*wrist  ),//"e2",
        "e2_2":new THREE.Vector3(0.0 , this.spacing+wrist  ,- (6-1)*this.spacing-2*wrist  ),//"e2",
        "w3":new THREE.Vector3(0.0   , this.spacing+wrist  ,- (7-1)*this.spacing-2*wrist  ),//"w3",
        "v3":new THREE.Vector3(0.0   , this.spacing+wrist  ,- (7-1)*this.spacing-4*wrist  ),//"v3",
        "g2":new THREE.Vector3(0.0   , this.spacing+wrist  ,- (8-1)*this.spacing-5*wrist  ),//"g2",
        "e3_1":new THREE.Vector3(0.0 ,-this.spacing+wrist  ,- (1-1)*this.spacing -2*wrist ),//"e3",
        "e3_2":new THREE.Vector3(0.0 ,-this.spacing+wrist  ,- (1-1)*this.spacing -2*wrist ),//"e3",
        "g3":new THREE.Vector3(0.0   ,-this.spacing+wrist  ,- (1-1)*this.spacing -2*wrist ),//"g3",
        

    };

    THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1)

    var beta = 0.5;

    var material = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.8, 0.8, 0.8) });
    var material1 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.3, 0.3, 0.3) });
    var material2 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.6, 0.6, 0.6) });
    var material3 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0, 0.2, 0) });
    var material4 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.5, 0.5, 0) });
    var material5 = new THREE.MeshLambertMaterial({ reflectivity: beta, color: new THREE.Color(0.1, 0.1, 0.1) });

    var material  = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(1.0, 1.0, 1.0) });
    var material1 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0.3, 0.3, 0.3) });
    var material2 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0.6, 0.6, 0.6) });
    var material3 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0, 0.2, 0) });
    var material4 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0.5, 0.5, 0) });
    var material5 = new THREE.MeshPhysicalMaterial({ metalness: 0.4, reflectivity: 0.5, roughness: 0.5, color: new THREE.Color(0.1, 0.1, 0.1) });

    let billeGroupsTemp = [
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group(),
        new THREE.Group()
    ];

    for (let i = 0; i < objects.count; i++) {
        let mesh = objects.get(i).geometry();
        let layerIndex = objects.get(i).attributes().layerIndex;
        let layerName = this.swarm.rhinoDoc.layers().findIndex(layerIndex).name;
        // console.log(objects.get(i).attributes())
        if (mesh instanceof this.swarm.rhino.Mesh) {
            // convert all meshes in 3dm model into threejs objects

            let threeMeshes=[];
            let materialChosen=material;

            if (objects.get(i).attributes().name == 'grey' || objects.get(i).attributes().name == 'grey1' || objects.get(i).attributes().name == 'grey2' || objects.get(i).attributes().name == 'pcb') {
                materialChosen=material1;
            } else if (objects.get(i).attributes().name == 'motors') {
                materialChosen=material2;
            } else if (objects.get(i).attributes().name == 'controller') {
                materialChosen=material3;
            } else if (objects.get(i).attributes().name == 'connectors') {
                materialChosen=material4;
            } else if (objects.get(i).attributes().name == 'battery') {
                materialChosen=material5;
            } else {
                materialChosen=material;
            }

            threeMeshes.push(meshToThreejs(mesh, materialChosen));

            var layer=0
            var add=true;
            var wrist=0.3;
            if(layerName=="g1"||layerName=="c1"||layerName=="e3_1"||layerName=="v11"){
                layer=0
                
            }else if(layerName=="w1"||layerName=="e1_1"||layerName=="v111"){
                layer=1
                if(this.BilleSize.rotatedJoint && (layerName=="v111"||layerName=="e1_1")){
                    threeMeshes[0].position.z+=wrist;
                }else if(layerName=="v111"){
                    add=false;
                }
            }else if(layerName=="v1"||layerName=="e1_2"||layerName=="w2"){
                layer=2
                if(layerName=="w2"){
                    threeMeshes[0].position.z+=this.spacing*(this.BilleSize.legHeight-1);
                }
            }else if(layerName=="v2"||layerName=="e2_1"){
                layer=3
                if(layerName=="e2_1"){
                    threeMeshes[0].position.z+=this.spacing*(this.BilleSize.legHeight-1);
                }
            }else if(layerName=="e2_2"||layerName=="w3"||layerName=="v222"){
                layer=4
                if(this.BilleSize.rotatedJoint && (layerName=="v222"||layerName=="e2_2")){
                    // threeMeshes[0].position.z+=wrist;
                }else if(layerName=="v222"){
                    add=false;
                }
            }else if(layerName=="v3"||layerName=="g2"||layerName=="v22"){
                layer=5
                if(layerName=="g2"){
                    threeMeshes[0].position.z+=this.spacing*(this.BilleSize.baseHeight-1);
                }
            }else if(layerName=="e3_2"||layerName=="g3"){
                layer=6
                
            }else{
                add=false;
            }
            
            for (var ii=1;ii<this.BilleSize.legHeight;ii++){
                if(layerName=="v1"||layerName=="v2"){
                    threeMeshes.push(meshToThreejs(mesh, materialChosen));
                    threeMeshes[threeMeshes.length-1].position.z+=this.spacing*(this.BilleSize.legHeight-(threeMeshes.length-1));
                }
            }
            for (var ii=1;ii<this.BilleSize.baseHeight;ii++){
                if(layerName=="v11"||layerName=="v22"){
                    threeMeshes.push(meshToThreejs(mesh, materialChosen));
                    threeMeshes[threeMeshes.length-1].position.z+=this.spacing*(this.BilleSize.baseHeight-(threeMeshes.length-1));
                }
            }

            if(this.BilleSize.rotatedJoint){ //width should be 1 already but just in case
                for (var ii=1;ii<this.BilleSize.width;ii++){
                    if(layerName=="v11"||layerName=="v22"){
                        for (var kk=0;kk<this.BilleSize.baseHeight;kk++){
                            // console.log("ii:"+(this.BilleSize.width-(ii))+" kk:"+(this.BilleSize.baseHeight-(kk)))
                            threeMeshes.push(meshToThreejs(mesh, materialChosen));
                            threeMeshes[threeMeshes.length-1].position.x-=this.spacing*(this.BilleSize.width-(ii));
                            threeMeshes[threeMeshes.length-1].position.z+=this.spacing*(this.BilleSize.baseHeight-(kk+1));
                        }
                    }
                    if(layerName=="v1"){
                        for (var kk=0;kk<this.BilleSize.legHeight;kk++){
                            threeMeshes.push(meshToThreejs(mesh, materialChosen));
                            threeMeshes[threeMeshes.length-1].position.y+=this.spacing*(this.BilleSize.width-(ii));
                            threeMeshes[threeMeshes.length-1].position.z+=this.spacing*(this.BilleSize.legHeight-(kk+1));

                        }
                    }else if(layerName=="v2"){
                        for (var kk=0;kk<this.BilleSize.legHeight;kk++){
                            threeMeshes.push(meshToThreejs(mesh, materialChosen));
                            threeMeshes[threeMeshes.length-1].position.y-=this.spacing*(this.BilleSize.width-(ii));
                            threeMeshes[threeMeshes.length-1].position.z+=this.spacing*(this.BilleSize.legHeight-(kk+1));
                        }
                    }


                    if(layerName=="v111"||layerName=="e1_1"||layerName=="e1_2"){
                        threeMeshes.push(meshToThreejs(mesh, materialChosen));
                        threeMeshes[threeMeshes.length-1].position.y+=this.spacing*(this.BilleSize.width-(ii));
                    }else if(layerName=="v222"||layerName=="e2_1"||layerName=="e2_2"){
                        threeMeshes.push(meshToThreejs(mesh, materialChosen));
                        threeMeshes[threeMeshes.length-1].position.y-=this.spacing*(this.BilleSize.width-(ii));
                    }else if(layerName=="g1"||layerName=="e3_1"||layerName=="e3_2"||layerName=="g3"||layerName=="g2"){
                        threeMeshes.push(meshToThreejs(mesh, materialChosen));
                        threeMeshes[threeMeshes.length-1].position.x-=this.spacing*(this.BilleSize.width-(ii));
                    }
                    if(layerName=="e2_1"){
                        threeMeshes[threeMeshes.length-1].position.z+=this.spacing*(this.BilleSize.legHeight-1);
                    }else if(layerName=="g2"){
                        threeMeshes[threeMeshes.length-1].position.z+=this.spacing*(this.BilleSize.baseHeight-1);
                    }
                    
                }
            }
                
            

            if(add){
                for (var ii=0;ii<threeMeshes.length;ii++){
                    threeMeshes[ii].position.x += this.billePos[layer].x;
                    threeMeshes[ii].position.y += this.billePos[layer].y;
                    threeMeshes[ii].position.z += this.billePos[layer].z;
                    billeGroupsTemp[layer].add(threeMeshes[ii]);
                }
            }
            
        }
    }

    for (let i = 0; i < billeGroupsTemp.length; i++) {
        billeGroupsTemp[i].name = "Group:" + i;
    }
    billeGroupsTemp[0].add(billeGroupsTemp[6].clone());

    this.bille.add(billeGroupsTemp[0].clone().add(billeGroupsTemp[1].clone().add(billeGroupsTemp[2].clone().add(billeGroupsTemp[3].clone().add(billeGroupsTemp[4].clone().add(billeGroupsTemp[5].clone()))))));

    this.bille.name="RecursiveBille";
    this.swarm.scene.add(this.bille);

    console.log("Loaded Bille!");

    this.GUI();
    // this.jointsGui = jointsGui;
    // this.targetGui = targetGui;

    this.createTarget();
    this.updateAngles();
    // // this.startMovement();

    this.initLoads();



};

Bille.prototype.updateAngles = function (getTarget = true) {
    if (this.leg == 1) {
        if (getTarget) {
            this.IK(new THREE.Vector3(this.targetBille.position.x - this.bille.position.x,
                this.targetBille.position.y - this.bille.position.y,
                this.targetBille.position.z - this.bille.position.z));
        }
        // console.log(this.billeAngles)

        for (let i = 0; i < 7; i++) {
            var joint = this.swarm.scene.getObjectByName("Group:" + i);
            joint.position.x = 0;
            joint.position.y = 0;
            joint.position.z = 0;
        }


        if (this.path.j0.length > 0 && this.path.currentPoint < this.path.j0.length) {
            this.billeAngles.j0 = this.path.j0[this.path.currentPoint];
        }

        this.swarm.scene.getObjectByName("Group:" + 6).rotation.x = this.swarm.DEG_TO_RAD * this.billeAngles.j0;
        this.swarm.scene.getObjectByName("Group:" + 1).rotation.z = this.swarm.DEG_TO_RAD * this.billeAngles.j1;
        this.swarm.scene.getObjectByName("Group:" + 2).rotation.y = this.swarm.DEG_TO_RAD * this.billeAngles.j2;
        this.swarm.scene.getObjectByName("Group:" + 3).rotation.y = this.swarm.DEG_TO_RAD * this.billeAngles.j3;
        this.swarm.scene.getObjectByName("Group:" + 4).rotation.y = this.swarm.DEG_TO_RAD * this.billeAngles.j4;
        this.swarm.scene.getObjectByName("Group:" + 5).rotation.z = this.swarm.DEG_TO_RAD * this.billeAngles.j5;

        this.swarm.scene.getObjectByName("Group:" + 1).rotation.z -= this.swarm.scene.getObjectByName("Group:" + 0).rotation.z;

        if (this.path.rotations.length > 0 && this.path.currentPoint < this.path.rotations.length) {
            this.swarm.scene.getObjectByName("Group:" + 5).rotation.z += this.path.rotations[this.path.currentPoint] * this.swarm.DEG_TO_RAD;
        }

        for (let i = 1; i < 7; i++) {
            var joint = this.swarm.scene.getObjectByName("Group:" + i);
            joint.position.x -= this.billePos1[i].x;
            joint.position.y -= this.billePos1[i].y;
            joint.position.z -= this.billePos1[i].z;
            
        }

    } else {
        if (getTarget) {
            this.IK(new THREE.Vector3(-(this.targetBille.position.x - this.bille.position.x),
                -(this.targetBille.position.y - this.bille.position.y),
                -(this.targetBille.position.z - this.bille.position.z)));
        }


        for (let i = 0; i < 7; i++) {
            var joint = this.swarm.scene.getObjectByName("Group:" + i);
            joint.position.x = 0;
            joint.position.y = 0;
            joint.position.z = 0;
        }

        this.swarm.scene.getObjectByName("Group:" + 6).rotation.x = this.swarm.DEG_TO_RAD * this.billeAngles.j0;
        this.swarm.scene.getObjectByName("Group:" + 1).rotation.z = this.swarm.DEG_TO_RAD * this.billeAngles.j1;
        this.swarm.scene.getObjectByName("Group:" + 2).rotation.y = this.swarm.DEG_TO_RAD * this.billeAngles.j2;
        this.swarm.scene.getObjectByName("Group:" + 3).rotation.y = this.swarm.DEG_TO_RAD * this.billeAngles.j3;
        this.swarm.scene.getObjectByName("Group:" + 4).rotation.y = this.swarm.DEG_TO_RAD * this.billeAngles.j4;
        this.swarm.scene.getObjectByName("Group:" + 5).rotation.z = this.swarm.DEG_TO_RAD * this.billeAngles.j5;


        if (this.path.rotations.length > 0 && this.path.currentPoint < this.path.rotations.length) {
            this.swarm.scene.getObjectByName("Group:" + 0).rotation.z = -this.path.rotations[this.path.currentPoint] * this.swarm.DEG_TO_RAD + this.bille.position.rz;
            this.swarm.scene.getObjectByName("Group:" + 1).rotation.z += this.path.rotations[this.path.currentPoint] * this.swarm.DEG_TO_RAD - this.bille.position.rz;

        } else {
            this.swarm.scene.getObjectByName("Group:" + 1).rotation.z -= this.swarm.scene.getObjectByName("Group:" + 0).rotation.z;

        }

        for (let i = 1; i < 7; i++) {
            var joint = this.swarm.scene.getObjectByName("Group:" + i);
            joint.position.x -= this.billePos1[i].x;
            joint.position.y -= this.billePos1[i].y;
            joint.position.z -= this.billePos1[i].z;
        }

        var joint = this.swarm.scene.getObjectByName("Group:" + 0);
        joint.position.x = this.targetBille.position.x - this.bille.position.x;
        joint.position.y = this.targetBille.position.y - this.bille.position.y;
        joint.position.z = this.targetBille.position.z - this.bille.position.z;

    }
    for (var i in this.jointsGui.__controllers) {
        this.jointsGui.__controllers[i].updateDisplay();
    }
    for (var i in this.targetGui.__controllers) {
        this.targetGui.__controllers[i].updateDisplay();
    }

    if(this.loadArrows.length!=0){
        this.updateLoads();
    }

};

Bille.prototype.GUI = function () {
    this.gui = new dat.GUI();

    var button = {
        'download csv': function () {
            recursiveBille.download_csv();
        },
        'start movement': function () {
            recursiveBille.startMovementDirections(recursiveBille.stepsDirection);
        },
        'pick up': function () {
            recursiveBille.startMovementPickup();
        },
        // 'drop off':function(){
        //     recursiveBille.startMovementDropOff();
        // },
        // 'create robot':function(){
        //     recursiveBille.magic();
        // },
        // 'final':function(){
        //     recursiveBille.final();
        // }
    };

    var jointsGui = this.gui.addFolder('Robot Joints');
    var jointsParams = [];
    jointsParams.push(jointsGui.add(this.billeAngles, 'j0', -180.0, 180.0).step(0.01));
    jointsParams.push(jointsGui.add(this.billeAngles, 'j1', -180.0, 180.0).step(0.01));
    jointsParams.push(jointsGui.add(this.billeAngles, 'j2', -180.0, 180.0).step(0.01));
    jointsParams.push(jointsGui.add(this.billeAngles, 'j3', -180.0, 180.0).step(0.01));
    jointsParams.push(jointsGui.add(this.billeAngles, 'j4', -180.0, 180.0).step(0.01));
    jointsParams.push(jointsGui.add(this.billeAngles, 'j5', -180.0, 180.0).step(0.01));

    for (var i = 0; i < jointsParams.length; i++) {
        jointsParams[i].onChange(function (value) {
            recursiveBille.updateAngles(false); //todo change
            
        });
    }

    var targetGui = this.gui.addFolder('Target Position');
    var targetParams = [];
    // targetParams.push(targetGui.add(this.billeTarget, 'x', -15.0, 15.0).step(0.01).listen());
    // targetParams.push(targetGui.add(this.billeTarget, 'y', -15.0, 15.0).step(0.01).listen());
    // targetParams.push(targetGui.add(this.billeTarget, 'z', -15.0, 15.0).step(0.01).listen());
    // var changeTargetEnd = targetGui.add(this.billeTarget, 'targetEnd', ["end 1", "end 2"]).listen()
    targetParams.push(targetGui.add(this.billeTarget, 'x', -15.0, 15.0).step(0.01));
    targetParams.push(targetGui.add(this.billeTarget, 'y', -15.0, 15.0).step(0.01));
    targetParams.push(targetGui.add(this.billeTarget, 'z', -15.0, 15.0).step(0.01));
    var changeTargetEnd = targetGui.add(this.billeTarget, 'targetEnd', ["end 1", "end 2"])

    // var extraGui =gui.addFolder('Simulation Speed');
    // extraGui.add(this.path, 'delay', 0, 100).step(10).listen();

    // gui.add(button,"pick up");
    // gui.add(button,"drop off");
    // gui.add(button,"create robot");
    // gui.add(button,"final");
    // gui.add(button,"start movement");
    // gui.add(button,"download csv");

    for (var i = 0; i < targetParams.length; i++) {
        targetParams[i].onChange(function (value) {

            recursiveBille.targetBille.position.x = recursiveBille.billeTarget.x;
            recursiveBille.targetBille.position.y = recursiveBille.billeTarget.y;
            recursiveBille.targetBille.position.z = recursiveBille.billeTarget.z;
            recursiveBille.controlBille.position.x = recursiveBille.billeTarget.x;
            recursiveBille.controlBille.position.y = recursiveBille.billeTarget.y;
            recursiveBille.controlBille.position.z = recursiveBille.billeTarget.z;

            recursiveBille.updateAngles();  //todo change bille
            
        });
    }
    changeTargetEnd.onChange(function (value) {
        recursiveBille.changeEnd();
    });

    this.jointsGui = jointsGui;
    this.targetGui = targetGui;

};

Bille.prototype.IK = function (pos) {
    var x1 = pos.x;
    var y1 = pos.y;

    var x = x1;
    var alt = this.spacing;
    var y = pos.y + alt;
    var z = pos.z - 0.0; // empirical was pos.z-0.188


    var l = Math.sqrt(pos.y ** 2 + pos.x ** 2);
    var ll = this.spacing + (10.5 / 102) * this.spacing; //Middle wrist actuator thickness


    if (pos.y <= 0) {

        var alpha = Math.asin(pos.x / l);
        var beta = Math.asin(ll / l);

        var theta = Math.PI / 2 - alpha - beta;


        var xm = Math.sin(theta) * ll;
        var ym = Math.cos(theta) * ll;

        x = Math.sqrt((-pos.y - ym) ** 2 + (pos.x + xm) ** 2);
        j1 = -theta;
    } else {
        var alpha = Math.asin(Math.sqrt(l ** 2 - ll ** 2) / l);
        var beta = Math.atan(pos.x / Math.abs(pos.y));

        var theta = Math.PI - alpha - beta;


        var xm = Math.sin(theta) * ll;
        var ym = Math.cos(theta) * ll;
        x = Math.sqrt((pos.y + ym) ** 2 + (pos.x - xm) ** 2);
        j1 = theta;
    }


    var j1, j2, j3, j4, j5;
    var a = this.spacing * this.robotScale;
    var b = this.spacing * this.robotScale;
    // console.log(this.robotScale)

    var c = Math.sqrt(x * x + z * z);

    j2 = Math.PI / 2.0 - (Math.atan(z / x) + Math.acos((b * b + c * c - a * a) / (2 * b * c)));

    j3 = Math.acos((a * a + b * b - c * c) / (2 * a * b));

    j4 = Math.atan(x / z) + Math.acos((a * a + c * c - b * b) / (2 * a * c));



    if (z < 0) {
        j4 -= Math.PI;
    }


    this.billeAngles.j1 = j1 * this.swarm.RAD_TO_DEG;
    this.billeAngles.j2 = (j2 * this.swarm.RAD_TO_DEG);
    this.billeAngles.j3 = 180 - (j3 * this.swarm.RAD_TO_DEG);
    this.billeAngles.j4 = 180 - (j4 * this.swarm.RAD_TO_DEG);
    if (this.billeAngles.j4 > 360) {
        this.billeAngles.j4 -= 360;
    } else if (this.billeAngles.j4 > 180) {
        this.billeAngles.j4 -= 360;
    }
    this.billeAngles.j5 = (j1 * this.swarm.RAD_TO_DEG);


    // console.log(this.path.points.length)
};

Bille.prototype.createTarget = function () {
    this.targetBille = new THREE.Group();
    this.targetBille.name="targetBille";
    if (this.swarm.showGUI) {
        
        this.swarm.scene.add(this.targetBille);
    }

    this.controlBille = new THREE.TransformControls(this.swarm.camera, this.swarm.renderer.domElement);
    this.controlBille.name="controlBille"
    this.targetBille.position.x = this.billeTarget.x;
    this.targetBille.position.y = this.billeTarget.y;
    this.targetBille.position.z = this.billeTarget.z;

    this.controlBille.size = 0.5;
    this.controlBille.space = "local";
    // this.targetBille.rotation.y=180*this.DEG_TO_RAD;
    // this.targetBille.rotation.z=90*this.DEG_TO_RAD;
    // this.control.setSpace( this.control.space === "local" ? "world" : "local" );
    this.controlBille.addEventListener('change', () => {
        recursiveBille.billeTarget.x = recursiveBille.targetBille.position.x; //todo change bille
        recursiveBille.billeTarget.y = recursiveBille.targetBille.position.y;
        recursiveBille.billeTarget.z = recursiveBille.targetBille.position.z;
        recursiveBille.updateAngles();
    });
    this.controlBille.attach(this.targetBille);

    if (this.swarm.showGUI) {
        this.swarm.scene.add(this.controlBille);
        // this.control.visible = false;

    }

};

Bille.prototype.getNormalAdjustment = function (n, vnormal, forward) {//n is normal degree{
    var result = new THREE.Vector3(0, 0, 0);
    if (n == 180) {
        return result;
    }
    var theta = Math.abs(180 - n);
    var base = 2 * Math.sin(theta / 2 * this.DEG_TO_RAD) * (this.voxelSpacing * 1.5);//TODO fix (offset)
    var x = Math.sin(((180 - theta) / 2) * this.DEG_TO_RAD) * base;
    var y = Math.cos(((180 - theta) / 2) * this.DEG_TO_RAD) * base;

    result = vnormal.clone().multiplyScalar(-y);

    if (n > 180) {
        var tempV = forward.clone().multiplyScalar(x);
        result.add(tempV);
        return result;
    } else {
        var tempV = forward.clone().multiplyScalar(-x);
        result.add(tempV);
        return result;
    }

};

Bille.prototype.initLoads= function(){
    this.loadArrowsGroup=new THREE.Group();
    this.loadArrowsGroup.name="loadArrowsGroup";

    this.loads={
        grip_1:new THREE.Vector3(0,0,0),
        control_voxel:new THREE.Vector3(0,0,0), //control voxel
        wrist_1:new THREE.Vector3(0,0,0) , // wrist 1
        elbow_1:new THREE.Vector3(0,0,0), // elbow 1
        leg_1:new THREE.Vector3(0,0,0), // leg_1
        wrist_2:new THREE.Vector3(0,0,0) , // wrist 2
        leg_2:new THREE.Vector3(0,0,0), // leg_2
        elbow_2:new THREE.Vector3(0,0,0), // elbow 2
        wrist_3:new THREE.Vector3(0,0,0),  //wrist 3
        voxel_1:new THREE.Vector3(0,0,0), //voxel
        grip_2:new THREE.Vector3(0,0,0),  //grip 3
        elbow_pickup:new THREE.Vector3(0,0,0)  //elbow_pickup

    };
    if(typeof this.swarm.setup.parametric!== undefined && this.swarm.setup.parametric){
        var shift=0.3

        this.loadPosAdjustments=[
            new THREE.Vector3(0,0,-shift),//grip 1
            new THREE.Vector3(0,0,(this.spacing*this.BilleSize.baseHeight)*0.5),//control voxel
            new THREE.Vector3(0,0,this.spacing),//wrist 1
            new THREE.Vector3(0.0,0.0,this.spacing*1.5),// elbow 1
            new THREE.Vector3(0,0,this.spacing+this.spacing*0.5*(this.BilleSize.legHeight-1)),// leg 1
            new THREE.Vector3(0,this.spacing*0.5,0),//wrist 2
            new THREE.Vector3(0,0,this.spacing*0.5*(this.BilleSize.legHeight-1)),// leg 2
            new THREE.Vector3(0,0,0), // elbow 2
            new THREE.Vector3(0,0,this.spacing/2+shift), // wrist 3

            new THREE.Vector3(0,0,(this.spacing*this.BilleSize.baseHeight)-0.5*this.spacing), //voxel

            new THREE.Vector3(0,0,(1+this.BilleSize.baseHeight)*this.spacing-2*shift),//grip 2

            new THREE.Vector3(0,0,0) //elbow_pickup

        ];

    }else{
        this.loadPosAdjustments=[
            new THREE.Vector3(0,0,-this.voxelSpacing/this.robotScale*0.1),//grip 1
            new THREE.Vector3(0,0,this.voxelSpacing/this.robotScale*0.5),//control voxel
            new THREE.Vector3(0,0,0),//wrist 1
            new THREE.Vector3(0,0,this.voxelSpacing/this.robotScale*0.5),// elbow 1
            new THREE.Vector3(0,0,this.voxelSpacing/this.robotScale*1.5),// leg 1
            new THREE.Vector3(0,this.voxelSpacing/this.robotScale*0.5,0),//wrist 2
            new THREE.Vector3(0,0,this.voxelSpacing/this.robotScale*0.5),// leg 2
            new THREE.Vector3(0,0,0), // elbow 2
            new THREE.Vector3(0,0,-this.voxelSpacing/this.robotScale*0.25), // wrist 3
            new THREE.Vector3(0,0,this.voxelSpacing/this.robotScale*0.25), //voxel
            new THREE.Vector3(0,0,this.voxelSpacing/this.robotScale*0.75),//grip 2
            new THREE.Vector3(0,0,0) //elbow_pickup
    
        ];

    }

    

    this.weights=[
        5,  //grip 1
        15, //control voxel
        5,  //wrist 1
        30, // elbow 1
        20, // leg 1
        5,  // wrist 2
        20, // leg 2
        30, // elbow 3
        5,  //wrist 3
        10, //voxel
        5,  //grip 2
        30  //lower elbow

    ];
    this.torques=[
        new THREE.Vector3(0,0,0), //grip 1
        new THREE.Vector3(0,0,0), //control voxel
        new THREE.Vector3(0,0,0), //wrist1
        new THREE.Vector3(0,0,0), // elbow 1
        new THREE.Vector3(0,0,0), // leg 1
        new THREE.Vector3(0,0,0), // wrist 2
        new THREE.Vector3(0,0,0), // leg 2
        new THREE.Vector3(0,0,0), // elbow 3
        new THREE.Vector3(0,0,0), //wrist 3
        new THREE.Vector3(0,0,0), //voxel
        new THREE.Vector3(0,0,0), //grip 2
        new THREE.Vector3(0,0,0), //lower elbow

    ];
    

    var currentParent=this.bille.children[this.bille.children.length - 1];
    var length = 1.2;
    var hex = 0xff7171;
    var dir = new THREE.Vector3( 0, 0, -1 );
    dir.normalize();
    var arrowScale=0.7;

    
    
    for(var i=0;i<10;i++){
        var origin = currentParent.getWorldPosition(origin).clone().add(this.bille.position);

        var vec=this.loadPosAdjustments[i].clone();
        var q=currentParent.getWorldQuaternion();
        vec.applyQuaternion(q);

        this.loadArrows.push(new THREE.ArrowHelper( dir, origin.clone().add(vec), length, hex,arrowScale,arrowScale ));
        
        this.loadArrows[i].name="loadArrow:" + i;
        this.loadArrowsGroup.add( this.loadArrows[i] );
        if(i!=9 ){
            if(i!=2&&i!=5&&i!=0&&i!=8){
                currentParent=currentParent.children[currentParent.children.length - 1];
            }
        }
        
            

    }
    //last wrist
    var origin = currentParent.getWorldPosition(origin).clone().add(this.bille.position);
    var vec=this.loadPosAdjustments[this.loadPosAdjustments.length-2].clone();
    var q=currentParent.getWorldQuaternion();
    vec.applyQuaternion(q);
    this.loadArrows.push(new THREE.ArrowHelper( dir, origin.clone().add(vec), length, hex,arrowScale,arrowScale ));
    this.loadArrows[this.loadArrows.length-1].name="loadArrow:" + (this.loadArrows.length-1);
    this.loadArrowsGroup.add( this.loadArrows[this.loadArrows.length-1] );



    //pickup elbow
    var origin = this.bille.children[0].children[this.bille.children[0].children.length - 2].getWorldPosition().clone().add(this.bille.position);
    var vec=this.loadPosAdjustments[this.loadPosAdjustments.length-1].clone();
    var q=currentParent.getWorldQuaternion();
    vec.applyQuaternion(q);
    this.loadArrows.push(new THREE.ArrowHelper( dir, origin.clone().add(vec), length, hex,arrowScale,arrowScale ));
    this.loadArrows[this.loadArrows.length-1].name="loadArrow:" + (this.loadArrows.length-1);
    this.loadArrowsGroup.add( this.loadArrows[this.loadPosAdjustments.length-1] );
    


    this.swarm.scene.add( this.loadArrowsGroup );

    this.calcTorque();
    this.loadsGUI();
    
}

Bille.prototype.updateLoads= function(){

    var currentParent=this.bille.children[this.bille.children.length - 1];
  
    
    for(var i=0;i<10;i++){

        var origin = currentParent.getWorldPosition().clone();

        var vec=this.loadPosAdjustments[i].clone();
        var q=currentParent.getWorldQuaternion();
        vec.applyQuaternion(q);

        this.loadArrows[i].position.copy(origin.add(vec))
        if(i!=9 ){
            if(i!=2&&i!=5&&i!=0&&i!=8){
                currentParent=currentParent.children[currentParent.children.length - 1];
            }
        }
    }

    //last wrist
    var origin = currentParent.getWorldPosition(origin).clone();
    var vec=this.loadPosAdjustments[this.loadPosAdjustments.length-2].clone();
    var q=currentParent.getWorldQuaternion();
    vec.applyQuaternion(q);
    this.loadArrows[this.loadArrows.length-2].position.copy(origin.add(vec))
    


    var origin = this.bille.children[0].children[this.bille.children[0].children.length - 2].getWorldPosition().clone();
    var vec=this.loadPosAdjustments[this.loadArrows.length-1].clone();
    var q=currentParent.getWorldQuaternion();
    vec.applyQuaternion(q);
    this.loadArrows[this.loadArrows.length-1].position.copy(origin.add(vec))

    this.calcTorque();


}

Bille.prototype.calcTorque= function(){
    //calculate load

    for(var i=0;i<10;i++){
        this.torques[i]=new THREE.Vector3(0,0,0);
        for(var j=i+1;j<10;j++){
            this.torques[i].add(new THREE.Vector3(0,0,-this.weights[j]));
            var vec=this.loadArrows[j].position.clone().sub(this.loadArrows[i].position);
            var t=new THREE.Vector3(0,0,0);
            t.crossVectors(vec,new THREE.Vector3(0,0,-this.weights[j]));
            this.torques[i].add(t);
        }
        
    }

    this.loads.grip_1       .copy(this.torques[0]);
    this.loads.control_voxel.copy(this.torques[1]);
    this.loads.wrist_1      .copy(this.torques[2]);
    this.loads.elbow_1      .copy(this.torques[3]);
    this.loads.leg_1        .copy(this.torques[4]);
    this.loads.wrist_2.copy(this.torques[5]);
    this.loads.leg_2        .copy(this.torques[6]);
    this.loads.elbow_2      .copy(this.torques[7]);
    this.loads.wrist_3      .copy(this.torques[8]);
    this.loads.voxel_1      .copy(this.torques[9]);
    this.loads.grip_2       .copy(this.torques[10]);
    this.loads.elbow_pickup .copy(this.torques[11]);

}

Bille.prototype.loadsGUI= function(){
    this.lgui = new dat.GUI();
    var loadGUI = this.lgui.addFolder('Loads');

    var elbow_pickup=loadGUI.addFolder('elbow_pickup');
    var grip_1      =loadGUI.addFolder('grip_1')
    var wrist_1     =loadGUI.addFolder('wrist_1')
    var elbow_1     =loadGUI.addFolder('elbow_1')
    var wrist_2     =loadGUI.addFolder('wrist_2')
    var elbow_2     =loadGUI.addFolder('elbow_2')
    var wrist_3     =loadGUI.addFolder('wrist_3')
    var grip_2      =loadGUI.addFolder('grip_2')

    elbow_pickup.add(this.loads.elbow_pickup, 'x', 0, 100.0).step(0.01).listen();
    grip_1      .add(this.loads.grip_1      , 'x', 0, 100.0).step(0.01).listen();
    wrist_1     .add(this.loads.wrist_1     , 'x', 0, 100.0).step(0.01).listen();
    elbow_1     .add(this.loads.elbow_1     , 'x', 0, 100.0).step(0.01).listen();
    wrist_2     .add(this.loads.wrist_2     , 'x', 0, 100.0).step(0.01).listen();
    elbow_2     .add(this.loads.elbow_2     , 'x', 0, 100.0).step(0.01).listen();
    wrist_3     .add(this.loads.wrist_3     , 'x', 0, 100.0).step(0.01).listen();
    grip_2      .add(this.loads.grip_2      , 'x', 0, 100.0).step(0.01).listen();

    elbow_pickup.add(this.loads.elbow_pickup, 'y', 0, 100.0).step(0.01).listen();
    grip_1      .add(this.loads.grip_1      , 'y', 0, 100.0).step(0.01).listen();
    wrist_1     .add(this.loads.wrist_1     , 'y', 0, 100.0).step(0.01).listen();
    elbow_1     .add(this.loads.elbow_1     , 'y', 0, 100.0).step(0.01).listen();
    wrist_2     .add(this.loads.wrist_2     , 'y', 0, 100.0).step(0.01).listen();
    elbow_2     .add(this.loads.elbow_2     , 'y', 0, 100.0).step(0.01).listen();
    wrist_3     .add(this.loads.wrist_3     , 'y', 0, 100.0).step(0.01).listen();
    grip_2      .add(this.loads.grip_2      , 'y', 0, 100.0).step(0.01).listen();

    elbow_pickup.add(this.loads.elbow_pickup, 'z', 0, 100.0).step(0.01).listen();
    grip_1      .add(this.loads.grip_1      , 'z', 0, 100.0).step(0.01).listen();
    wrist_1     .add(this.loads.wrist_1     , 'z', 0, 100.0).step(0.01).listen();
    elbow_1     .add(this.loads.elbow_1     , 'z', 0, 100.0).step(0.01).listen();
    wrist_2     .add(this.loads.wrist_2     , 'z', 0, 100.0).step(0.01).listen();
    elbow_2     .add(this.loads.elbow_2     , 'z', 0, 100.0).step(0.01).listen();
    wrist_3     .add(this.loads.wrist_3     , 'z', 0, 100.0).step(0.01).listen();
    grip_2      .add(this.loads.grip_2      , 'z', 0, 100.0).step(0.01).listen();

    

}


//////////////////calls//////////////////

function meshToThreejs(mesh, material) {
    let loader = new THREE.BufferGeometryLoader();
    var geometry = loader.parse(mesh.toThreejsJSON());
    return new THREE.Mesh(geometry, material);
}

//todo figure out a way to call this.
function move() {
    recursiveBille.move();
}

function changeEnd() {
    recursiveBille.changeEnd();
}

function rotateRobot() {
    recursiveBille.rotateRobot(recursiveBille.path.changeRotation[parseInt((recursiveBille.path.currentPoint - recursiveBille.path.number) / recursiveBille.path.number / 2)]);

}

function pickupPart(num) {
    // console.log(num);
    recursiveBille.pickupPart(num);
}
//////////////////////////////////////////////

