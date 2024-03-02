// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

///////////////////////////geometry///////////////////////////////
Swarm.prototype.declareGlobals= function(){
	for( i=0;i<this.numberOfStartLocations;i++){
		this.startLocations.push(new THREE.Vector3(0,0,0) );
		this.depositLocations.push(new THREE.Vector3(0,0,0) );
	}
	for( i=0;i<this.numberOfRobots;i++){
		this.guiControls.push(null);
	
		this.THREE1.push(new THREE.Vector3(0,0,0) );
		this.robotBones.push([]);
		this.joints.push([]);
		this.angles.push([0, 0, 0, 0, 0, 0]);
		this.robotState.push({
			leg1Pos:new THREE.Vector3(1,0,0),
			leg2Pos:new THREE.Vector3(0,0,0),
			up:new THREE.Vector3(0,0,1),
			forward:new THREE.Vector3(1,0,0),
			Z:0,
			rank:0
		});

		// this.THREERobot.push(null);
		this.VisualRobot.push(null);
		this.THREESimulationRobot.push(null);
		// this.geo.push(null);
		this.defaultRobotState.push(null);
		this.target.push(null);
		this.control.push(null);
		this.leg.push(1);
		this.voxelNormal.push(180);
		this.normalAdjustmentVector.push(new THREE.Vector3( 0, 0, 0));	
		
		this.THREE1dir.push(new THREE.Vector3(0,0,1) );
		this.THREE1Pos.push(new THREE.Vector3(0,0,0) );

		//path
		this.targetPositionMesh.push(new THREE.Vector3(1,0,0));
		this.carriedVoxel.push([]);

		this.goHome.push(true);
		this.totalNumberofSteps.push(0);

		//////////////////////

		this.steps.push([]);
		this.path.push({
			curve: null,
			currentPoint: 0,
			points:[],
			number:this.pathParams.number,
			delay:1000/this.speed,
			timeout:100,
			cHeight:this.pathParams.cHeight*this.voxelSpacing[i],
			showPath:this.pathParams.showPath,
			normals:[],
			changeLegs:[],
			changeRotation:[],
			normalAdjustments:[]
		});

	}
}

//implemented based on https://github.com/glumb/robot-gui
Swarm.prototype.THREERobotCall= function(robotIndex){
	THREERobot= function (r,robotIndex,V_initial, limits, group) {
		this.r=r;
		r.THREE1[robotIndex] = new THREE.Group();

		var colors = [
			0xaaaaaa,
			0xbbbbbb,
			0xbcbcbc,
			0xcbcbcb,
			0xcccccc,
			0x0,
		];

		let parentObject = r.THREE1[robotIndex];
		r.robotBones[robotIndex] = [];
		r.joints[robotIndex] = [];

		function createCube(x, y, z, w, h, d, min, max, jointNumber) {
			var thicken = 1*r.robotScale[robotIndex];
			// var thicken = 1; //for hierachy demo
		
			var w_thickened = Math.abs(w) + thicken;
			var h_thickened = Math.abs(h) + thicken;
			var d_thickened = Math.abs(d) + thicken;
		
			var material = new THREE.MeshLambertMaterial({ color: colors[jointNumber],});
			var geometry = new THREE.CubeGeometry(w_thickened, h_thickened, d_thickened);
			var mesh = new THREE.Mesh(geometry, material);

			
		
			mesh.position.set(w / 2, h / 2, d / 2);
			var group = new THREE.Object3D();
			group.position.set(x, y, z);
			group.add(mesh);
		
			// min = min / 180 * Math.PI
			// max = max / 180 * Math.PI
		
			var jointGeo1 = new THREE.CylinderGeometry  (0.8*r.robotScale[robotIndex], 0.8*r.robotScale[robotIndex], 0.8 * 2*r.robotScale[robotIndex], 32, 32, false, -min, 2 * Math.PI - max + min)
			var jointGeoMax = new THREE.CylinderGeometry(0.8*r.robotScale[robotIndex], 0.8*r.robotScale[robotIndex], 0.8 * 2*r.robotScale[robotIndex], 32, 32, false, -max, max)
			var jointGeoMin = new THREE.CylinderGeometry(0.8*r.robotScale[robotIndex], 0.8*r.robotScale[robotIndex], 0.8 * 2*r.robotScale[robotIndex], 32, 32, false, 0, -min)
			

			// var jointGeo1 = new THREE.CylinderGeometry  (0.8, 0.8, 0.8 * 2, 32, 32, false, -min, 2 * Math.PI - max + min)//for hierachy demo
			// var jointGeoMax = new THREE.CylinderGeometry(0.8, 0.8, 0.8 * 2, 32, 32, false, -max, max)//for hierachy demo
			// var jointGeoMin = new THREE.CylinderGeometry(0.8, 0.8, 0.8 * 2, 32, 32, false, 0, -min)//for hierachy demo
			

			var jointMesh1 = new THREE.Mesh(jointGeo1, new THREE.MeshBasicMaterial({
			color: 0x000000,//0xffbb00,
			}));
			var jointMeshMax = new THREE.Mesh(jointGeoMax, new THREE.MeshBasicMaterial({
			color: 0x000000,//0x009900,
			}));
			var jointMeshMin = new THREE.Mesh(jointGeoMin, new THREE.MeshBasicMaterial({
			color: 0x000000,//0xdd2200,
			}));
		
			var joint = new THREE.Group();
			joint.add(jointMeshMax, jointMeshMin, jointMesh1);
		
			r.joints[robotIndex].push(joint);
		
			switch (jointNumber) {
			case 0:
				joint.rotation.x = Math.PI / 2;
				break;
			case 1:
			// joint.rotation.x = Math.PI / 2
				break;
			case 2:
			// joint.rotation.x = Math.PI / 2
				break;
			case 3:
				// joint.rotation.z = Math.PI / 2;
				break;
			case 4:	
				joint.rotation.x = Math.PI / 2;
				break;
			}
		
			group.add(joint);
			return group;
		}

		let x = 0,
		y = 0,
		z = 0;

		// V_initial.push([0, 0, 0]) // add a 6th pseudo link for 6 axis

		for (let i = 0; i < V_initial.length; i++) {
			var link = V_initial[i];

			
		
			var linkGeo = createCube(x, y, z, link[0], link[1], link[2], limits[i][0], limits[i][1], i);
			x = link[0];
			y = link[1];
			z = link[2];

			if(i==1 ||i==2)
			{

				r.carriedVoxel[robotIndex].push(r.voxel[robotIndex].clone());
				r.carriedVoxel[robotIndex][r.carriedVoxel[robotIndex].length-1].position.x=x-r.voxelSpacing[robotIndex]/2-0.5;
				r.carriedVoxel[robotIndex][r.carriedVoxel[robotIndex].length-1].position.y=y;
				r.carriedVoxel[robotIndex][r.carriedVoxel[robotIndex].length-1].position.z=z-2;
				linkGeo.add( r.carriedVoxel[robotIndex][r.carriedVoxel[robotIndex].length-1] );
			}

			parentObject.add(linkGeo);
			parentObject = linkGeo;
			r.robotBones[robotIndex].push(linkGeo);
		}
		r.carriedVoxel[robotIndex][0].visible=false;
	
		group.add(r.THREE1[robotIndex]);
	};

	THREERobot.prototype = {
		setAngles(robotIndex,angles1) {
		this.r.robotBones[robotIndex][0].rotation.z =this.r.angles[robotIndex][0];
		this.r.robotBones[robotIndex][1].rotation.y =this.r.angles[robotIndex][1];
		this.r.robotBones[robotIndex][2].rotation.y =this.r.angles[robotIndex][2];
		this.r.robotBones[robotIndex][3].rotation.y =this.r.angles[robotIndex][3];
		this.r.robotBones[robotIndex][4].rotation.z =this.r.angles[robotIndex][4];
		// this.robotBones[robotIndex][5].rotation.z =this.angles[robotIndex][5];
		},
	
		setAngle(robotIndex,index, angle) {
		this.r.angles[robotIndex][index] = angle;
		this.setAngles(robotIndex,this.r.angles[robotIndex].slice());
		},
	};
}

///////////////////////initialization/////////////////////////////
Swarm.prototype.defaultRobot= function(robotIndex){
	localState = {
		jointOutOfBound: [false, false, false, false, false, false],
	  };
	var maxAngleVelocity = 90.0 / (180.0 * Math.PI) / 1000.0;
	geo = [
		[0, 0, this.guiControls[robotIndex].offset],
		[0, 0, this.guiControls[robotIndex].leg1  ],
		[0, 0, this.guiControls[robotIndex].leg2  ],
		[0, 0, this.guiControls[robotIndex].offset],
		[0, 0, 0],
		[0, 0, 0],
	  ];

	this.defaultRobotState[robotIndex] = {
		target: {
		  position: {
			x: 10,
			y: 10,
			z: 10,
		  },
		  rotation: {
			x: Math.PI,
			y: 0,
			z: 0,
		  },
		},
		angles: {
		  A0: 0,
		  A1: 0,
		  A2: 0,
		  A3: 0,
		  A4: 0,
		  A5: 0,
		},
		jointOutOfBound: [false, false, false, false, false, false],
		maxAngleVelocities: {
		  J0: maxAngleVelocity,
		  J1: maxAngleVelocity,
		  J2: maxAngleVelocity,
		  J3: maxAngleVelocity,
		  J4: maxAngleVelocity,
		  J5: maxAngleVelocity,
		},
		jointLimits: {
		  J0: [-190 / 180 * Math.PI, 190 / 180 * Math.PI],
		  J1: [-58 / 180 * Math.PI, 90 / 180 * Math.PI],
		  J2: [-135 / 180 * Math.PI, 40 / 180 * Math.PI],
		  J3: [-90 / 180 * Math.PI, 75 / 180 * Math.PI],
		  J4: [-139 / 180 * Math.PI, 20 / 180 * Math.PI],
		  J5: [-188 / 180 * Math.PI, 181 / 180 * Math.PI],
		},
		geometry: {
		  V0: {
			x: geo[0][0],
			y: geo[0][1],
			z: geo[0][2],
		  },
		  V1: {
			x: geo[1][0],
			y: geo[1][1],
			z: geo[1][2],
		  },
		  V2: {
			x: geo[2][0],
			y: geo[2][1],
			z: geo[2][2],
		  },
		  V3: {
			x: geo[3][0],
			y: geo[3][1],
			z: geo[3][2],
		  },
		  V4: {
			x: geo[4][0],
			y: geo[4][1],
			z: geo[4][2],
		  },
		},
	  };
	  
	this.THREESimulationRobot[robotIndex] = new THREE.Group();
	this.scene.add(this.THREESimulationRobot[robotIndex]);
	  
	var geometry = Object.values(this.defaultRobotState[robotIndex].geometry).map((val, i, array) => [val.x, val.y, val.z]);
    var jointLimits = Object.values(this.defaultRobotState[robotIndex].jointLimits);

	this.VisualRobot[robotIndex] = new THREERobot(this,robotIndex,geometry, jointLimits, this.THREESimulationRobot[robotIndex]);
	// varthis.angles = Object.values(this.defaultRobotState.angles);
	// this.VisualRobot[robotIndex].setAngles(angles);
	var restAngle=60;
	// this.VisualRobot[robotIndex].setAngle(0,restAngle/ 180 * Math.PI);
	this.VisualRobot[robotIndex].setAngle(robotIndex,1,restAngle*this.RAD_TO_DEG);
	this.VisualRobot[robotIndex].setAngle(robotIndex,2,restAngle*this.RAD_TO_DEG);
	this.VisualRobot[robotIndex].setAngle(robotIndex,3,restAngle*this.RAD_TO_DEG);
	
	if(this.showGUI){
		// var target= new THREE.Vector3(this.guiControls[robotIndex].x,this.guiControls[robotIndex].y,this.guiControls[robotIndex].z);
		this.updateGUI(robotIndex);

	}
	
	
	this.targetControl(robotIndex);
	this.THREE1[robotIndex].position.x=this.robotState[robotIndex].leg2Pos.x*this.voxelSpacing[robotIndex];// /this.robotScale[robotIndex];
	this.THREE1[robotIndex].position.y=this.robotState[robotIndex].leg2Pos.y*this.voxelSpacing[robotIndex];// /this.robotScale[robotIndex];
	this.THREE1[robotIndex].position.z=this.robotState[robotIndex].leg2Pos.z*this.voxelSpacing[robotIndex];// /this.robotScale[robotIndex];
	this.updateAngles(robotIndex);

}

Swarm.prototype.updateRobotGeometry= function(robotIndex){
	geo = [
		[0, 0, this.guiControls[robotIndex].offset],
		[0, 0, this.guiControls[robotIndex].leg1],
		[0, 0, this.guiControls[robotIndex].leg2],
		[0, 0, this.guiControls[robotIndex].offset],
		[0, 0, 0],
		[0, 0, 0],
	];
	
	this.defaultRobotState[robotIndex].geometry ={
		V0: {
		  x: geo[0][0],
		  y: geo[0][1],
		  z: geo[0][2],
		},
		V1: {
		  x: geo[1][0],
		  y: geo[1][1],
		  z: geo[1][2],
		},
		V2: {
		  x: geo[2][0],
		  y: geo[2][1],
		  z: geo[2][2],
		},
		V3: {
		  x: geo[3][0],
		  y: geo[3][1],
		  z: geo[3][2],
		},
		V4: {
		  x: geo[4][0],
		  y: geo[4][1],
		  z: geo[4][2],
		},
	};

	var geometry = Object.values(this.defaultRobotState[robotIndex].geometry).map((val, i, array) => [val.x, val.y, val.z]);
    var jointLimits = Object.values(this.defaultRobotState[robotIndex].jointLimits);

	while (this.THREESimulationRobot[robotIndex].children.length) {
		this.THREESimulationRobot[robotIndex].remove(this.THREESimulationRobot[robotIndex].children[0]);
	}

	


	this.VisualRobot[robotIndex] = new THREERobot(this,robotIndex,geometry, jointLimits, this.THREESimulationRobot[robotIndex]);
	
	this.THREE1[robotIndex].position.x=this.robotState[robotIndex].leg2Pos.x*this.voxelSpacing[robotIndex];///this.robotScale[robotIndex];
	this.THREE1[robotIndex].position.y=this.robotState[robotIndex].leg2Pos.y*this.voxelSpacing[robotIndex];///this.robotScale[robotIndex];
	this.THREE1[robotIndex].position.z=this.robotState[robotIndex].leg2Pos.z*this.voxelSpacing[robotIndex];///this.robotScale[robotIndex];

	this.updateAngles(robotIndex);
}