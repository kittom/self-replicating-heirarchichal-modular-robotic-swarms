// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

Bille.prototype.generatePath= function(stepsDirection){
    this.goHome=false;
    this.stepsDirection=stepsDirection;
	this.resetPath();
	this.getStepsFromDirections();
	this.generatePoints();
};

Bille.prototype.startMovementDirections= function(stepsDirection){
	this.stepsDirection=stepsDirection;
	this.resetPath();
    this.startMovement();
	//if generated path
	if(this.steps.length>0){
		for(var i=0;i<this.steps.length;i++){
			this.step(i);
		}
	}
};

///////////////////high level steps///////////////////////
Bille.prototype.getStepsFromDirections= function(){
	// var leg1Pos=new THREE.Vector3(1,0,0);
	// var leg2Pos=new THREE.Vector3(0,0,0);
	// var up=new THREE.Vector3(0,0,1);
	// var forward=new THREE.Vector3(1,0,0);
	
	for(var i=0;i<this.stepsDirection.length;i++){

		switch(this.stepsDirection[i]){

			case 0:
				
				this.robotState.leg2Pos=this.robotState.leg1Pos.clone();
				this.robotState.leg1Pos.add(this.robotState.forward);
				this.steps.push([this.robotState.leg1Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.leg2Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.up]);
				break;
			case 1:
				this.robotState.forward=new THREE.Vector3(0,0,0).sub(this.robotState.forward);
				// var temp=leg2Pos.clone();
				// leg2Pos=leg1Pos.clone();
				this.robotState.leg1Pos=this.robotState.leg2Pos.clone().add(this.robotState.forward);
				this.steps.push([this.robotState.leg1Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.leg2Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.up]);
				break;
			case 2:
				this.robotState.leg2Pos=this.robotState.leg1Pos.clone();
				this.robotState.leg1Pos.add(this.robotState.forward.clone().add(this.robotState.up));
				this.steps.push([this.robotState.leg1Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.leg2Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.up]);
				break;
			case 3:
				this.robotState.leg2Pos=this.robotState.leg1Pos.clone();
				this.robotState.leg1Pos.add(this.robotState.forward.clone().sub(this.robotState.up));
				this.steps.push([this.robotState.leg1Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.leg2Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.up]);
				break;
			case 4:
				this.robotState.leg2Pos=this.robotState.leg1Pos.clone();
				if(this.robotState.forward.x==1) {
					this.robotState.forward.y=1;
					this.robotState.forward.x=0;
				}else if(this.robotState.forward.x==-1) {
					this.robotState.forward.y=-1;
					this.robotState.forward.x=0;
				}else if(this.robotState.forward.y==1) {
					this.robotState.forward.x=-1;
					this.robotState.forward.y=0;
				}else if(this.robotState.forward.y==-1) {
					this.robotState.forward.x=1;
					this.robotState.forward.y=0;
				}
				this.robotState.leg1Pos=this.robotState.leg2Pos.clone().add(this.robotState.forward);
				this.steps.push([this.robotState.leg1Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.leg2Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.up]);
				break;
			case 5:
				this.robotState.leg2Pos=this.robotState.leg1Pos.clone();

				if(this.robotState.forward.x==1) {
					this.robotState.forward.y=-1;
					this.robotState.forward.x=0;
				}else if(this.robotState.forward.x==-1) {
					this.robotState.forward.y=1;
					this.robotState.forward.x=0;
				}else if(this.robotState.forward.y==1) {
					this.robotState.forward.x=1;
					this.robotState.forward.y=0;
				}else if(this.robotState.forward.y==-1) {
					this.robotState.forward.x=-1;
					this.robotState.forward.y=0;
				}

				this.robotState.leg1Pos=this.robotState.leg2Pos.clone().add(this.robotState.forward);
				this.steps.push([this.robotState.leg1Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.leg2Pos.clone().multiplyScalar(this.voxelSpacing),this.robotState.up]);
				break;
			
		}

	}
	this.stepsDirection=[];

};

Bille.prototype.generatePoints= function(){
	for (var i=0; i<this.steps.length ; i++)
	{
		var s=this.billeStep(this.steps[i][0],this.steps[i][1],this.steps[i][2]);
		this.path.changeLegs.push(s[0]);
		this.path.changeRotation.push(s[1]);
	}
};

Bille.prototype.billeStep= function(stepLeg1,stepLeg2,legsNormal){
	
	var changeLegBefore=false;
	var leg1Pos=new THREE.Vector3(0,0,0);
	var leg2Pos=new THREE.Vector3(0,0,0);

	var pos1=new THREE.Vector3(0,0,0);
	var pos2=new THREE.Vector3(0,0,0);

	if(this.path.points.length==0)
	{	
		// pos1.copy(this.target.position);
		// pos2.copy(this.THREE1.position);
		// console.log(this.targetBille)
        pos1.copy(this.targetBille.position);
		pos2.copy(this.bille.position);
	}else{
		pos1.copy(this.path.points[this.path.points.length-1-1-this.path.number]);
		pos2.copy(this.path.points[this.path.points.length-1]);
		
	}

	//check starting leg based on distance to target 
	if(pos2.distanceTo(stepLeg1)<pos1.distanceTo(stepLeg1))
	{
		changeLegBefore=true;
		this.flipped=!this.flipped;
		var temp=new THREE.Vector3(0,0,0);
		temp.copy(pos1);
		pos1.copy(pos2);
		pos2.copy(temp);
	}

	leg1Pos.copy(pos1);
	leg2Pos.copy(pos2);

	// var robotUp=this.billeDirection.clone();
	var robotUp=this.billeDirection.clone();
	var robotLocation=this.billePosition.clone();

	// console.log(tempV);
	var znormal=0;

	var tempV=pos2.clone().sub(pos1);
	var tempV1=stepLeg2.clone().sub(stepLeg1);
	var tempV2=tempV.clone().sub(tempV1);
	// console.log(tempV2);

	if(tempV2.x!=0&&tempV2.y!=0){
		if(tempV2.x<0&&tempV2.y<0 ){
			znormal=-90;
		}else if(tempV2.x>0&&tempV2.y>0){
			znormal=90;
		}else if(tempV2.x<0&&tempV2.y>0){
			znormal=-90;
		}else if(tempV2.x>0&&tempV2.y<0){
			znormal=90;
		}
	}
	// console.log(changeLegBefore)
	if(this.flipped){
		znormal=-znormal;
		// console.log(znormal)
		// console.log(stepLeg1)
		// console.log(stepLeg2)
		// console.log(legsNormal)
	}
	

	// if(tempV.x!=0&&tempV.y!=0){
	// 	if(tempV.x<0&&tempV.y<0 ){
	// 		znormal=-90;
	// 	}else if(tempV.x>0&&tempV.y>0){
	// 		znormal=-90;
	// 	}else if(tempV.x<0&&tempV.y>0){
	// 		znormal=90;
	// 	}else if(tempV.x>0&&tempV.y<0){
	// 		znormal=90;
	// 	}
	// }

	
	this.createPath(leg1Pos,stepLeg1,this.billeDirection,legsNormal,znormal,robotUp,robotLocation);

	robotUp=legsNormal;
	robotLocation=stepLeg1;
	this.createPath(leg2Pos,stepLeg2,this.billeDirection,legsNormal,znormal,robotUp,robotLocation);

	//update previous locations/pos
	this.billeDirection = legsNormal.clone();
	this.billePosition=stepLeg2.clone();

	return [changeLegBefore,legsNormal];
};

/////////////////PATH///////////////////////////
//todo change to path class
Bille.prototype.resetPath= function(){
	//////////////////////
	this.steps=[];
	this.path.curve=null;
	this.path.points=[];
	this.path.normals=[];
	this.path.changeRotation=[];
	this.path.normalAdjustments=[];
	this.path.currentPoint=0;
	this.path.timeout=0;
	this.path.j0=[];
	this.path.rotations=[];
	this.path.changeLegs=[]
	// this.flipped=false;
};

Bille.prototype.createPath= function(start,end,snormal,enormal,znormal,robotUp,robotLocation){

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
	nor.multiplyScalar(this.path.cHeight);


	temp1.addVectors(start,dir.multiplyScalar(1/3));
	temp2.addVectors(start,dir.multiplyScalar(2));


	p2.addVectors(nor,temp1);
	p3.addVectors(nor,temp2);

	//create bezier curve
	this.path.curve= new THREE.CubicBezierCurve3 (
		p1,
		p2,
		p3,
		p4
	);

	this.dividePath(snormal.clone(),enormal.clone(),znormal,robotUp,robotLocation);
};

Bille.prototype.dividePath= function(snormal,enormal,znormal,robotUp,robotLocation){

	// console.log(this.robotState.forward)
	// console.log(snormal)
	// console.log(enormal)
	
	//points
	var d=1/this.path.number;
	var tempPoints=this.path.curve.getSpacedPoints(this.path.number);
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
	var p2=tempPoints[this.path.number];
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
	var dn=(vnormal2-vnormal1)/(this.path.number+1);

	
	
	for (var i=0;i<=this.path.number;i++)
	{
		this.path.normals.push(vnormal1+i*dn);
		this.path.normalAdjustments.push(this.getNormalAdjustment(vnormal1+i*dn,robotUp,forward));
		this.path.points.push(tempPoints[i].clone());
		this.path.rotations.push((i % (this.path.number+1))/(this.path.number+1)*znormal);		
		this.path.j0.push(0);
		
		if(this.path.showPath)
		{
			var material = new THREE.MeshLambertMaterial({ color:0xff7171,});
			var geometry = new THREE.SphereGeometry(0.05, 0.05, 0.05);
			var mesh = new THREE.Mesh(geometry, material);
			mesh.position.x=tempPoints[i].x;
			mesh.position.y=tempPoints[i].y;
			mesh.position.z=tempPoints[i].z;
			this.swarm.scene.add(mesh);
		}
	}
	
};


///////////////step///////////////////
Bille.prototype.step= function(i){
	this.totalNumberofSteps++;

	if(this.path.changeLegs[i])
	{
		setTimeout(function(){ changeEnd(); }, this.path.timeout);
	}

	this.moveLeg();//leg1

	//rotate bill-e
	if(i>0 && !this.path.changeRotation[i].equals(this.path.changeRotation[i-1]))
	{
		
		setTimeout(function(){ rotateRobot(); 
		}, this.path.timeout);
	}

	this.moveLeg();//leg2

}

Bille.prototype.moveLeg= function(){
	var ps= this.path.points.slice();

	for(var i=0;i<=this.path.number;i++)
	{
		setTimeout(function(){ move(); }, this.path.timeout+=this.path.delay);
	}
	setTimeout(function(){ changeEnd(); }, this.path.timeout);
	
}

Bille.prototype.move= function(){

	this.billeTarget.x=this.path.points[this.path.currentPoint].x;
	this.billeTarget.y=this.path.points[this.path.currentPoint].y;
	this.billeTarget.z=this.path.points[this.path.currentPoint].z;
	this.voxelNormal=this.path.normals[this.path.currentPoint];
	this.normalAdjustmentVector=this.path.normalAdjustments[this.path.currentPoint];
	if(this.swarm.CubicBezierCurve3saveAngleData){
		// this.dataAngles.push([this.path.currentPoint,this.path.points[this.path.currentPoint].x,this.path.points[this.path.currentPoint].y,this.path.points[this.path.currentPoint].z]);
		this.updateAngles();

	}else{
		this.updateAngles();
	}

	this.controlBille.position.x = this.billeTarget.x;
	this.controlBille.position.y = this.billeTarget.y;
	this.controlBille.position.z = this.billeTarget.z;

	this.targetBille.position.x = this.billeTarget.x;
	this.targetBille.position.y = this.billeTarget.y;
	this.targetBille.position.z = this.billeTarget.z;
	
	this.path.currentPoint++;

	if(this.path.currentPoint==this.path.points.length){
		// if(this.goHome){
			
		// 	this.buildVoxelAt(this.robotState.leg1Pos.clone().multiplyScalar(this.voxelSpacing));
		// 	//go Home
		// 	this.startMovement(true);

		// }else{
		// 	//go to new Voxel
		// 	this.startMovement(false);
		// }
	}
	
}

Bille.prototype.changeEnd= function(){
	//TODO: send fix end and unfix end to code
	if(this.leg==2)
	{
		//later output package
		// console.log("unfix leg 1, fix leg 2");
		this.leg=1;
		this.billeTarget.targetEnd="end 1";
		// if( this.carriedVoxel[0].visible||this.carriedVoxel[1].visible){
		// 	this.carriedVoxel[1].visible=true;
		// 	this.carriedVoxel[0].visible=false;

		// }

	}else
	{
		//later output package
		// console.log("unfix leg 2, fix leg 1");
		this.leg=2;
		this.billeTarget.targetEnd="end 2";
		// if(this.carriedVoxel[0].visible||this.carriedVoxel[1].visible){
		// 	this.carriedVoxel[0].visible=true;
		// 	this.carriedVoxel[1].visible=false;
		// }
	}

	var tempPosition=new THREE.Vector3(this.billeTarget.x,
		                               this.billeTarget.y,
		                               this.billeTarget.z);
	var tempPosition1=new THREE.Vector3(this.bille.position.x,
									    this.bille.position.y,
									    this.bille.position.z);
	this.billeTarget.x=tempPosition1.x;
	this.billeTarget.y=tempPosition1.y;
	this.billeTarget.z=tempPosition1.z;       

	this.bille.position.x=tempPosition.x;
	this.bille.position.y=tempPosition.y;
	this.bille.position.z=tempPosition.z;

	this.targetBille.position.x =  this.billeTarget.x;
	this.targetBille.position.y =  this.billeTarget.y;
	this.targetBille.position.z =  this.billeTarget.z;
	this.controlBille.position.x = this.billeTarget.x;
	this.controlBille.position.y = this.billeTarget.y;
	this.controlBille.position.z = this.billeTarget.z;
	
	this.bille.position.rz=this.swarm.scene.getObjectByName( "Group:"+0 ).rotation.z;

	if(this.saveAngleData){
		this.updateAngles();
		this.dataAngles.push(["Lock end",this.leg]);


	}else{
		this.updateAngles();
	}
	

}

Bille.prototype.rotateRobot= function(dir){
	console.log("rotate")

	
	if(dir===undefined){

		

		var temp=parseInt((this.path.currentPoint-this.path.number)/this.path.number/2);
		if(temp>=this.path.changeRotation.length){
			temp=this.path.changeRotation.length-1;
		}
		dir=this.path.changeRotation[temp];
		


		console.log("try to fix errrrooorrr")

	}else{
		var newRotation=this.getRotation(dir).clone();
		this.bille.rotation.x=newRotation.x;
		this.bille.rotation.y=newRotation.y;
		this.bille.rotation.z=newRotation.z;

		this.voxelNormal=this.path.normals[this.path.currentPoint+1];
		this.normalAdjustmentVector=this.path.normalAdjustments[this.path.currentPoint+1];
		// if(this.saveAngleData){
		// 	this.updateAngles(true);

		// }else{
			this.updateAngles();
		// }

	}
		


	
	
}

Bille.prototype.getRotation= function(dir){
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

