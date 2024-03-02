// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

////////////////////Change Fixed end////////////////////////////
Swarm.prototype.changeEnd= function(robotIndex){
	//TODO: send fix end and unfix end to code
	if(this.leg[robotIndex]==2)
	{
		//later output package
		console.log("unfix leg 1, fix leg 2");
		this.leg[robotIndex]=1;
		this.guiControls[robotIndex].targetEnd="end 1";
		if(this.carriedVoxel[robotIndex][0].visible||this.carriedVoxel[robotIndex][1].visible){
			this.carriedVoxel[robotIndex][1].visible=true;
			this.carriedVoxel[robotIndex][0].visible=false;

		}

	}else
	{
		//later output package
		// console.log("unfix leg 2, fix leg 1");
		this.leg[robotIndex]=2;
		this.guiControls[robotIndex].targetEnd="end 2";
		if(this.carriedVoxel[robotIndex][0].visible||this.carriedVoxel[robotIndex][1].visible){
			this.carriedVoxel[robotIndex][0].visible=true;
			this.carriedVoxel[robotIndex][1].visible=false;
		}
	}

	var tempPosition=new THREE.Vector3(0,0,0);
	tempPosition.x=this.THREE1[robotIndex].position.x;
	tempPosition.y=this.THREE1[robotIndex].position.y;
	tempPosition.z=this.THREE1[robotIndex].position.z;

	this.THREE1[robotIndex].position.x=this.target[robotIndex].position.x;
	this.THREE1[robotIndex].position.y=this.target[robotIndex].position.y;
	this.THREE1[robotIndex].position.z=this.target[robotIndex].position.z;
	

	this.guiControls[robotIndex].x=tempPosition.x;
	this.guiControls[robotIndex].y=tempPosition.y;
	this.guiControls[robotIndex].z=tempPosition.z;

	this.control[robotIndex].position.x = this.guiControls[robotIndex].x;
	this.control[robotIndex].position.y = this.guiControls[robotIndex].y;
	this.control[robotIndex].position.z = this.guiControls[robotIndex].z;
	this.target[robotIndex].position.x = this.guiControls[robotIndex].x;
	this.target[robotIndex].position.y = this.guiControls[robotIndex].y;
	this.target[robotIndex].position.z = this.guiControls[robotIndex].z;

	if(this.saveAngleData){
		this.updateAngles(robotIndex,true);
		this.dataAngles.push(["Lock end",this.leg[robotIndex]]);


	}else{
		this.updateAngles(robotIndex);
	}
	

}

Swarm.prototype.rotateRobot= function(robotIndex,dir){

	
	if(dir===undefined){

		

		var temp=parseInt((recursiveSwarms.path[robotIndex].currentPoint-recursiveSwarms.path[robotIndex].number)/recursiveSwarms.path[robotIndex].number/2);
		if(temp>=recursiveSwarms.path[robotIndex].changeRotation.length){
			temp=recursiveSwarms.path[robotIndex].changeRotation.length-1;
		}
		dir=recursiveSwarms.path[robotIndex].changeRotation[temp];
		


		console.log("try to fix errrrooorrr")

	}else{
		var newRotation=this.getRotation(dir).clone();
		this.THREE1[robotIndex].rotation.x=newRotation.x;
		this.THREE1[robotIndex].rotation.y=newRotation.y;
		this.THREE1[robotIndex].rotation.z=newRotation.z;

		this.voxelNormal[robotIndex]=this.path[robotIndex].normals[this.path[robotIndex].currentPoint+1];
		this.normalAdjustmentVector[robotIndex]=this.path[robotIndex].normalAdjustments[this.path[robotIndex].currentPoint+1];
		// if(this.saveAngleData){
		// 	this.updateAngles(robotIndex,true);

		// }else{
			this.updateAngles(robotIndex);
		// }

	}
		


	
	
}

Swarm.prototype.getRotation= function(dir){
	var tempRot=new THREE.Vector3();
	if(dir.equals(new THREE.Vector3(0,0,1)) )
	{
		tempRot=new THREE.Vector3(0,0,0);
	}
	else if (dir.equals( new THREE.Vector3(0,0,-1)))
	{
		tempRot=new THREE.Vector3(180*this.DEG_TO_RAD,0,0);
	}
	else if (dir.equals( new THREE.Vector3(0,-1,0)))
	{
		tempRot=new THREE.Vector3(90*this.DEG_TO_RAD,0,0);
	}
	else if (dir.equals( new THREE.Vector3(0,1,0)))
	{
		tempRot=new THREE.Vector3(-90*this.DEG_TO_RAD,0,0);
	}
	else if (dir.equals(new THREE.Vector3(-1,0,0)))
	{
		tempRot=new THREE.Vector3(0,-90*this.DEG_TO_RAD,0);
	}
	else if (dir.equals( new THREE.Vector3(1,0,0)))
	{
		tempRot=new THREE.Vector3(0,90*this.DEG_TO_RAD,0);
	}
	return tempRot;
}

////////////////////////////////Path////////////////////////////
Swarm.prototype._createPath= function(robotIndex,start,end,snormal,enormal,robotUp,robotLocation){

	var p1=start.clone();
	// p1.add(snormal.clone().multiplyScalar(1)); //add if you want to change voxel Location
	var p2=new THREE.Vector3(0,0,0);
	var p3=new THREE.Vector3(0,0,0);
	var p4=end.clone();
	// p4.add(enormal.clone().multiplyScalar(1)); //add if you want to change voxel Location

	var nor = snormal.clone();
	nor.add(enormal);
	nor.normalize();

	var dir=end.clone().sub(start);

	var temp1=new THREE.Vector3(0,0,0);
	var temp2=new THREE.Vector3(0,0,0);
	nor.multiplyScalar(this.path[robotIndex].cHeight);


	temp1.addVectors(start,dir.multiplyScalar(1/3));
	temp2.addVectors(start,dir.multiplyScalar(2));


	p2.addVectors(nor,temp1);
	p3.addVectors(nor,temp2);

	//create bezier curve
	this.path[robotIndex].curve= new THREE.CubicBezierCurve3 (
		p1,
		p2,
		p3,
		p4
	);

	this._dividePath(robotIndex,snormal.clone(),enormal.clone(),robotUp,robotLocation);
}

Swarm.prototype._dividePath= function(robotIndex,snormal,enormal,robotUp,robotLocation){
	
	//points
	var d=1/this.path[robotIndex].number;
	var tempPoints=this.path[robotIndex].curve.getSpacedPoints(this.path[robotIndex].number);
	// console.log(tempPoints)

	var forward=new THREE.Vector3(0,0,0);
	var tempV=tempPoints[0].clone().sub(robotLocation);
	if(tempV.x!=0 && robotUp.x==0)
	{
		forward.x=tempV.x;
	}else if(tempV.y!=0 && robotUp.y==0)
	{
		forward.y=tempV.y;
	}else if(tempV.z!=0 && robotUp.z==0)
	{
		forward.z=tempV.z;
	}
	forward.normalize();

	var p1=tempPoints[0];
	var p2=tempPoints[this.path[robotIndex].number];
	var diff=p2.clone().sub(p1);
	diff.multiply(snormal);
	
	//normals
	var vnormal1=180;
	var vnormal2=180;
	if(!snormal.equals(enormal))
	{

		if(diff.x>0||diff.y>0||diff.z>0)
		{
			if(robotUp.equals(snormal))
			{
				vnormal1=180;
				vnormal2=90;

			}else
			{
				vnormal2=180;
				vnormal1=90;

			}
				
		}else if(diff.x<0||diff.y<0||diff.z<0)
		{
			if(robotUp.equals(snormal))
			{
				vnormal1=180;
				vnormal2=180+90;

			}else
			{
				vnormal2=180;
				vnormal1=180+90;

			}
		}
	}
	var dn=(vnormal2-vnormal1)/(this.path[robotIndex].number+1);

	

	for (var i=0;i<=this.path[robotIndex].number;i++)
	{
		this.path[robotIndex].normals.push(vnormal1+i*dn);
		this.path[robotIndex].normalAdjustments.push(this.getNormalAdjustment(robotIndex,vnormal1+i*dn,robotUp,forward));
		this.path[robotIndex].points.push(tempPoints[i].clone());
		
		
		if(this.path[robotIndex].showPath)
		{
			var material = new THREE.MeshLambertMaterial({ color:0xff7171,});
			var geometry = new THREE.SphereGeometry(0.05, 0.05, 0.05);
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.x=tempPoints[i].x;
			mesh.position.y=tempPoints[i].y;
			mesh.position.z=tempPoints[i].z;
			this.scene.add(mesh);
		}
	}
	
}

Swarm.prototype._BilleStep= function(robotIndex,stepLeg1,stepLeg2,legsNormal){
	
	var changeLegBefore=false;
	var leg1Pos=new THREE.Vector3(0,0,0);
	var leg2Pos=new THREE.Vector3(0,0,0);

	var pos1=new THREE.Vector3(0,0,0);
	var pos2=new THREE.Vector3(0,0,0);

	if(this.path[robotIndex].points.length==0)
	{	
		pos1.copy(this.target[robotIndex].position);
		pos2.copy(this.THREE1[robotIndex].position);
	}else{
		pos1.copy(this.path[robotIndex].points[this.path[robotIndex].points.length-1-1-this.path[robotIndex].number]);
		pos2.copy(this.path[robotIndex].points[this.path[robotIndex].points.length-1]);
		
	}

	//check starting leg based on distance to target 
	if(pos2.distanceTo(stepLeg1)<pos1.distanceTo(stepLeg1))
	{
		changeLegBefore=true;
		var temp=new THREE.Vector3(0,0,0);
		temp.copy(pos1);
		pos1.copy(pos2);
		pos2.copy(temp);
	}

	leg1Pos.copy(pos1);
	leg2Pos.copy(pos2);

	// var robotUp=this.THREE1dir[robotIndex].clone();
	var robotUp=this.THREE1dir[robotIndex].clone();
	var robotLocation=this.THREE1Pos[robotIndex].clone();

	
	this._createPath(robotIndex,leg1Pos,stepLeg1,this.THREE1dir[robotIndex],legsNormal,robotUp,robotLocation);

	robotUp=legsNormal;
	robotLocation=stepLeg1;
	this._createPath(robotIndex,leg2Pos,stepLeg2,this.THREE1dir[robotIndex],legsNormal,robotUp,robotLocation);

	//update previous locations/pos
	this.THREE1dir[robotIndex] = legsNormal.clone();
	this.THREE1Pos[robotIndex]=stepLeg2.clone();

	return [changeLegBefore,legsNormal];
}

Swarm.prototype.moveLeg= function(robotIndex){
	var ps= this.path[robotIndex].points.slice();

	for(var i=0;i<=this.path[robotIndex].number;i++)
	{
		setTimeout(function(){ _move(robotIndex); }, this.path[robotIndex].timeout+=this.path[robotIndex].delay);
	}
	setTimeout(function(){ _changeEnd(robotIndex); }, this.path[robotIndex].timeout);
	
}

Swarm.prototype.move= function(robotIndex){

	this.guiControls[robotIndex].x=this.path[robotIndex].points[this.path[robotIndex].currentPoint].x;
	this.guiControls[robotIndex].y=this.path[robotIndex].points[this.path[robotIndex].currentPoint].y;
	this.guiControls[robotIndex].z=this.path[robotIndex].points[this.path[robotIndex].currentPoint].z;
	this.voxelNormal[robotIndex]=this.path[robotIndex].normals[this.path[robotIndex].currentPoint];
	this.normalAdjustmentVector[robotIndex]=this.path[robotIndex].normalAdjustments[this.path[robotIndex].currentPoint];
	if(this.saveAngleData){
		// this.dataAngles.push([this.path[robotIndex].currentPoint,this.path[robotIndex].points[this.path[robotIndex].currentPoint].x,this.path[robotIndex].points[this.path[robotIndex].currentPoint].y,this.path[robotIndex].points[this.path[robotIndex].currentPoint].z]);
		this.updateAngles(robotIndex,true);

	}else{
		this.updateAngles(robotIndex);
	}

	this.control[robotIndex].position.x = this.guiControls[robotIndex].x;
	this.control[robotIndex].position.y = this.guiControls[robotIndex].y;
	this.control[robotIndex].position.z = this.guiControls[robotIndex].z;

	this.target[robotIndex].position.x = this.guiControls[robotIndex].x;
	this.target[robotIndex].position.y = this.guiControls[robotIndex].y;
	this.target[robotIndex].position.z = this.guiControls[robotIndex].z;
	
	this.path[robotIndex].currentPoint++;

	if(this.path[robotIndex].currentPoint==this.path[robotIndex].points.length){
		if(this.goHome[robotIndex]){
			
			this.buildVoxelAt(robotIndex,this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]));
			//go Home
			// console.log("robotIndex:"+robotIndex+" s2s");
			this.startMovement(robotIndex,true);

		}else{
			//go to new Voxel
			// console.log("robotIndex:"+robotIndex+" s2s");
			this.startMovement(robotIndex,false);
		}
	}
	
}

Swarm.prototype.getDirVec= function(direction){
	var vec = new THREE.Vector3(0,0,0);
	
	switch(direction)
	{
		case 0:	
			vec = new THREE.Vector3(1,0,0);
			break;
		case 1:	
			vec = new THREE.Vector3(-1,0,0);
			break;
		case 2:	
			vec = new THREE.Vector3(0,1,0);
			break;
		case 3:	
			vec = new THREE.Vector3(0,-1,0);
			break;
	}
	return vec;

}

Swarm.prototype.resetPath= function(robotIndex){
	//////////////////////
	this.steps[robotIndex]=[];
	this.path[robotIndex].curve=null;
	this.path[robotIndex].points=[];
	this.path[robotIndex].normals=[];
	this.path[robotIndex].changeRotation=[];
	this.path[robotIndex].normalAdjustments=[];
	this.path[robotIndex].currentPoint=0;
	this.path[robotIndex].timeout=0;
}

Swarm.prototype.getStepsFromDir= function(robotIndex){
	// var leg1Pos=new THREE.Vector3(1,0,0);
	// var leg2Pos=new THREE.Vector3(0,0,0);
	// var up=new THREE.Vector3(0,0,1);
	// var forward=new THREE.Vector3(1,0,0);
	
	for(var i=0;i<this.stepsDir.length;i++){

		switch(this.stepsDir[i]){

			case 0:
				this.robotState[robotIndex].leg2Pos=this.robotState[robotIndex].leg1Pos.clone();
				this.robotState[robotIndex].leg1Pos.add(this.robotState[robotIndex].forward);
				this.steps[robotIndex].push([this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].up]);
				break;
			case 1:
				this.robotState[robotIndex].forward=new THREE.Vector3(0,0,0).sub(this.robotState[robotIndex].forward);
				// var temp=leg2Pos.clone();
				// leg2Pos=leg1Pos.clone();
				this.robotState[robotIndex].leg1Pos=this.robotState[robotIndex].leg2Pos.clone().add(this.robotState[robotIndex].forward);
				this.steps[robotIndex].push([this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].up]);
				break;
			case 2:
				this.robotState[robotIndex].leg2Pos=this.robotState[robotIndex].leg1Pos.clone();
				this.robotState[robotIndex].leg1Pos.add(this.robotState[robotIndex].forward.clone().add(this.robotState[robotIndex].up));
				this.steps[robotIndex].push([this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].up]);
				break;
			case 3:
				this.robotState[robotIndex].leg2Pos=this.robotState[robotIndex].leg1Pos.clone();
				this.robotState[robotIndex].leg1Pos.add(this.robotState[robotIndex].forward.clone().sub(this.robotState[robotIndex].up));
				this.steps[robotIndex].push([this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].up]);
				break;
			case 4:
				this.robotState[robotIndex].leg2Pos=this.robotState[robotIndex].leg1Pos.clone();
				if(this.robotState[robotIndex].forward.x!=0) {
					var temp=this.robotState[robotIndex].forward.x;
					this.robotState[robotIndex].forward.x=0;
					this.robotState[robotIndex].forward.y=temp;
				}else {
					var temp=this.robotState[robotIndex].forward.y;
					this.robotState[robotIndex].forward.y=0;
					this.robotState[robotIndex].forward.x=temp;
				}
				this.robotState[robotIndex].leg1Pos=this.robotState[robotIndex].leg2Pos.clone().add(this.robotState[robotIndex].forward);
				this.steps[robotIndex].push([this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].up]);
				break;
			case 5:
				this.robotState[robotIndex].leg2Pos=this.robotState[robotIndex].leg1Pos.clone();
				if(this.robotState[robotIndex].forward.x!=0) {
					var temp=this.robotState[robotIndex].forward.x;
					this.robotState[robotIndex].forward.x=0;
					this.robotState[robotIndex].forward.y=-temp;
				}else {
					var temp=this.robotState[robotIndex].forward.y;
					this.robotState[robotIndex].forward.y=0;
					this.robotState[robotIndex].forward.x=-temp;
				}
				this.robotState[robotIndex].leg1Pos=this.robotState[robotIndex].leg2Pos.clone().add(this.robotState[robotIndex].forward);
				this.steps[robotIndex].push([this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),this.robotState[robotIndex].up]);
				break;
			
		}

	}
	this.stepsDir=[];

}


Swarm.prototype.generatePoints= function(robotIndex){
	for (var i=0; i<this.steps[robotIndex].length ; i++)
	{
		var s=this._BilleStep(robotIndex,this.steps[robotIndex][i][0],this.steps[robotIndex][i][1],this.steps[robotIndex][i][2]);
		this.path[robotIndex].changeLegs.push(s[0]);
		this.path[robotIndex].changeRotation.push(s[1]);
	}
}

Swarm.prototype.step= function(robotIndex,i){
	this.totalNumberofSteps[robotIndex]++;

	if(this.path[robotIndex].changeLegs[i])
	{
		setTimeout(function(){ _changeEnd(robotIndex); }, this.path[robotIndex].timeout);
	}

	this.moveLeg(robotIndex);//leg1

	//rotate bill-e
	if(i>0 && !this.path[robotIndex].changeRotation[i].equals(this.path[robotIndex].changeRotation[i-1]))
	{
		
		setTimeout(function(){ _rotateRobot(robotIndex); 
		}, this.path[robotIndex].timeout);
	}

	this.moveLeg(robotIndex);//leg2

}