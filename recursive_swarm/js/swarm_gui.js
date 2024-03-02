// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

////////////////////////////////GUI///////////////////////////////
Swarm.prototype.setupGUI= function(robotIndex){
	var r=this;
	//Parameters that can be modified.
	this.guiControls[robotIndex] = new function() {
		// this.x = r.robotState[robotIndex].leg1Pos.x*r.voxelSpacing[robotIndex]/r.robotScale[robotIndex];
		// this.y = r.robotState[robotIndex].leg1Pos.y*r.voxelSpacing[robotIndex]/r.robotScale[robotIndex];
		// this.z = r.voxelSpacing[robotIndex]/2;
		this.x = r.robotState[robotIndex].leg1Pos.x*r.voxelSpacing[robotIndex];///r.robotScale[robotIndex]*2;
		this.y = r.robotState[robotIndex].leg1Pos.y*r.voxelSpacing[robotIndex];///r.robotScale[robotIndex]*1;
		this.z = r.robotState[robotIndex].leg1Pos.z*r.voxelSpacing[robotIndex];///r.robotScale[robotIndex]*2;

		this.j1 = 0.0;
		this.j2 = 0.0;
		this.j3 = 0.0;
		this.j4 = 0.0;
		this.j5 = 0.0;
		this.leg1 =   r.robotGeometry.leg1    *r.robotScale[robotIndex];
		this.leg2 =   r.robotGeometry.leg2    *r.robotScale[robotIndex];
		this.offset = r.robotGeometry.offset  *r.robotScale[robotIndex];

		// this.leg1 =   r.robotGeometry.leg1   ;//for hierachy demo
		// this.leg2 =   r.robotGeometry.leg2   ;//for hierachy demo
		// this.offset = r.robotGeometry.offset ;//for hierachy demo
		this.targetEnd="end 1";
		this.step=0;
	};

	if(this.showGUI){
		var gui = new dat.GUI();
		var button={
			'download csv': function() {
				download_csv();
			},
			'start movement':function(){
				if(!recursiveSwarms.hierarchical && recursiveSwarms.buildType=="directions"){
					recursiveSwarms.startMovementDirections(0);
				}
			}
		};

		this.geometryGui = gui.addFolder('Robot Geometry');
		this.geometryParams=[];
		this.geometryParams.push(this.geometryGui.add(this.guiControls[robotIndex], 'leg1', 1.00, 10.0).step(0.1).listen());
		this.geometryParams.push(this.geometryGui.add(this.guiControls[robotIndex], 'leg2', 1.00, 10.0).step(0.1).listen());
		this.geometryParams.push(this.geometryGui.add(this.guiControls[robotIndex], 'offset', 1.00, 10.0).step(0.1).listen());

		this.jointsGui = gui.addFolder('Robot Joints');
		this.jointsParams=[];
		this.jointsParams.push(this.jointsGui.add(this.guiControls[robotIndex], 'j1', -180.0, 180.0).step(0.1).listen());
		this.jointsParams.push(this.jointsGui.add(this.guiControls[robotIndex], 'j2', -180.0, 180.0).step(0.1).listen());
		this.jointsParams.push(this.jointsGui.add(this.guiControls[robotIndex], 'j3', -180.0, 180.0).step(0.1).listen());
		this.jointsParams.push(this.jointsGui.add(this.guiControls[robotIndex], 'j4', -180.0, 180.0).step(0.1).listen());
		this.jointsParams.push(this.jointsGui.add(this.guiControls[robotIndex], 'j5', -180.0, 180.0).step(0.1).listen());

		this.targetGui = gui.addFolder('Target');
		this.targetParams=[];
		this.targetParams.push(this.targetGui.add(this.guiControls[robotIndex], 'x', -10.0*this.voxelSpacing, 10.0*this.voxelSpacing).step(0.1).listen());
		this.targetParams.push(this.targetGui.add(this.guiControls[robotIndex], 'y', -10.0*this.voxelSpacing, 10.0*this.voxelSpacing).step(0.1).listen());
		this.targetParams.push(this.targetGui.add(this.guiControls[robotIndex], 'z', -10.0*this.voxelSpacing, 10.0*this.voxelSpacing).step(0.1).listen());

		var endtarget= gui.addFolder('Target end');
		this.end=endtarget.add(this.guiControls[robotIndex],'targetEnd',["end 1","end 2"]).listen();

		// entStep=gui.add(this.guiControls[robotIndex], 'step', 0, this.path[robotIndex].number).step(1.0).listen();
		gui.add(button,"start movement");
		gui.add(button,"download csv");

	}

	
	
}

Swarm.prototype.updateGUI= function(robotIndex){
	for (var i=0;i<this.targetParams.length;i++) {
			this.targetParams[i].onChange(function(value) {
				recursiveSwarms.updateAngles(robotIndex);
				recursiveSwarms.control[robotIndex].position.x = recursiveSwarms.guiControls[robotIndex].x;
				recursiveSwarms.control[robotIndex].position.y = recursiveSwarms.guiControls[robotIndex].y;
				recursiveSwarms.control[robotIndex].position.z = recursiveSwarms.guiControls[robotIndex].z;
				recursiveSwarms.target[robotIndex].position.x = recursiveSwarms.guiControls[robotIndex].x;
				recursiveSwarms.target[robotIndex].position.y = recursiveSwarms.guiControls[robotIndex].y;
				recursiveSwarms.target[robotIndex].position.z = recursiveSwarms.guiControls[robotIndex].z;
		});
	}

	for (var i=0;i<this.jointsParams.length;i++) {
		this.jointsParams[i].onChange(function(value) {
			// console.log(value)
			// console.log(recursiveSwarms)
			if(recursiveSwarms.leg[robotIndex]==1)
			{
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,0,recursiveSwarms.guiControls[robotIndex].j1*recursiveSwarms.DEG_TO_RAD);
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,1,recursiveSwarms.guiControls[robotIndex].j2*recursiveSwarms.DEG_TO_RAD);
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,2,recursiveSwarms.guiControls[robotIndex].j3*recursiveSwarms.DEG_TO_RAD);
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,3,recursiveSwarms.guiControls[robotIndex].j4*recursiveSwarms.DEG_TO_RAD);
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,4,recursiveSwarms.guiControls[robotIndex].j5*recursiveSwarms.DEG_TO_RAD);

			}else
			{
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,4,recursiveSwarms.guiControls[robotIndex].j1*recursiveSwarms.DEG_TO_RAD);
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,3,recursiveSwarms.guiControls[robotIndex].j2*recursiveSwarms.DEG_TO_RAD);
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,2,recursiveSwarms.guiControls[robotIndex].j3*recursiveSwarms.DEG_TO_RAD);
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,1,recursiveSwarms.guiControls[robotIndex].j4*recursiveSwarms.DEG_TO_RAD);
				recursiveSwarms.VisualRobot[robotIndex].setAngle(robotIndex,0,recursiveSwarms.guiControls[robotIndex].j5*recursiveSwarms.DEG_TO_RAD);

			}
			
			recursiveSwarms.updateTarget(robotIndex);
		});
	}
	// console.log(this.geometryParams)
	// console.log(this.targetParams)

	for (var i=0 ;i<this.geometryParams.length ;i++) {
		this.geometryParams[i].onChange(function(value) {
			recursiveSwarms.updateRobotGeometry(robotIndex);
		});
	}

	// this.currentStep.onChange(function(value) {
	// 	this.step(robotIndex,this.guiControls[robotIndex].step);
	// });

	this.end.onChange(function(value) {
		
		recursiveSwarms.changeEnd(robotIndex);
	});


}

////////////////////////Target Control////////////////////////////
Swarm.prototype.targetControl= function(robotIndex){
	this.target[robotIndex] = new THREE.Group();
	if(this.showGUI){
		this.scene.add(this.target[robotIndex]);
	}

	this.control[robotIndex] = new THREE.TransformControls(this.camera, this.renderer.domElement);
	this.target[robotIndex].position.x = this.guiControls[robotIndex].x;
	this.target[robotIndex].position.y = this.guiControls[robotIndex].y;
	this.target[robotIndex].position.z = this.guiControls[robotIndex].z;

	this.control[robotIndex].size=0.25;
	this.control[robotIndex].space = "local";
	this.target[robotIndex].rotation.y=180*this.DEG_TO_RAD;
	this.target[robotIndex].rotation.z=90*this.DEG_TO_RAD;
	// this.control[robotIndex].setSpace( this.control[robotIndex].space === "local" ? "world" : "local" );
	this.control[robotIndex].addEventListener('change', () => {
		// robotIndex=0;
		// console.log(recursiveSwarms)
		recursiveSwarms.guiControls[robotIndex].x= recursiveSwarms.target[robotIndex].position.x;
		recursiveSwarms.guiControls[robotIndex].y= recursiveSwarms.target[robotIndex].position.y;
		recursiveSwarms.guiControls[robotIndex].z= recursiveSwarms.target[robotIndex].position.z;
		recursiveSwarms.updateAngles(robotIndex);
	});
	this.control[robotIndex].attach(this.target[robotIndex]);

	if(this.showGUI){
		this.scene.add(this.control[robotIndex]);
		// this.control[robotIndex].visible = false;

	}
	
}

Swarm.prototype.updateTarget= function(robotIndex){
	var tempPosition=new THREE.Vector3(0,0,0);

	// parent.updateMatrixWorld();

	// var vector = new THREE.Vector3();
	// vector.setFromMatrixPosition( child.matrixWorld );


	// var object=this.THREE1[robotIndex].children[0].children[2].children[2].children[2].children[2];
	// object.updateMatrixWorld();
	// var vector = object.geometry.vertices[i].clone();
	// vector.applyMatrix4( object.matrixWorld );
	

	// tempPosition.x=this.THREE1[robotIndex].parent.parent.children[0].position.x/this.robotScale[robotIndex];
	// tempPosition.y=this.THREE1[robotIndex].parent.parent.children[0].position.y/this.robotScale[robotIndex];
	// tempPosition.z=this.THREE1[robotIndex].parent.parent.children[0].position.z/this.robotScale[robotIndex];

	tempPosition.x=this.THREE1[robotIndex].parent.parent.children[5].position.x/this.robotScale[robotIndex];
	tempPosition.y=this.THREE1[robotIndex].parent.parent.children[5].position.y/this.robotScale[robotIndex];
	tempPosition.z=this.THREE1[robotIndex].parent.parent.children[5].position.z/this.robotScale[robotIndex];





	this.guiControls[robotIndex].x=tempPosition.x;
	this.guiControls[robotIndex].y=tempPosition.y;
	this.guiControls[robotIndex].z=tempPosition.z;

	this.control[robotIndex].position.x = this.guiControls[robotIndex].x;
	this.control[robotIndex].position.y = this.guiControls[robotIndex].y;
	this.control[robotIndex].position.z = this.guiControls[robotIndex].z;

	this.target[robotIndex].position.x = this.guiControls[robotIndex].x;
	this.target[robotIndex].position.y = this.guiControls[robotIndex].y;
	this.target[robotIndex].position.z = this.guiControls[robotIndex].z;
}


Swarm.prototype.screenshotSaver=function(){
	function downloadURI(uri, name) {
		var link = document.createElement('a');
		link.download = name;
		link.href = uri;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		delete link;
	}
	var button={
		"Save Image":function(){
			// var cnvs = document.getElementById('graph').children[0].children[0].children[0].children[2];
			// console.log(cnvs)
			// var ctx = cnvs.getContext('2d');
			// var cnvs = document.getElementById('mynetwork').children[0].children[0];
			// console.log(cnvs)
			// var dataURL = cnvs.toDataURL({ pixelRatio: 10 });
			recursiveSwarms.renderer.render(recursiveSwarms.scene, recursiveSwarms.camera);
			var dataURL = recursiveSwarms.renderer.domElement.toDataURL({ pixelRatio: 10 });

			downloadURI(dataURL, 'recursiveSwarms.png');

			

		}
	}
	const gui = new dat.GUI();
	gui.add(button,"Save Image");
}
///////////////////////////////////////////////////////////////////////////////////////////////////
function download_csv(){
	var csv = 'j1,j2,j3,j4,j5\n';
	recursiveSwarms.dataAngles.forEach(function(row) {
			csv += row.join(',');
			csv += "\n";
	});


	var hiddenElement = document.createElement('a');
	hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
	hiddenElement.target = '_blank';
	hiddenElement.download = 'angles.csv';
	//hiddenElement.click();

	document.body.append(hiddenElement);
	hiddenElement.click();
  	document.body.removeChild(hiddenElement);


}
