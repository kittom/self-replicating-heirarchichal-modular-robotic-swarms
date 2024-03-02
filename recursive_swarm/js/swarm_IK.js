// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020


///////////////////////Inverse Kinematics////////////////////////
Swarm.prototype.updateAngles= function(robotIndex,saveAngleData=false){

	this.THREE1[robotIndex].updateMatrixWorld();
	var matrix = new THREE.Matrix4();
	matrix.extractRotation( this.THREE1[robotIndex].matrix );

	//check rotation
	
	var vector = this.THREE1[robotIndex].position.clone().sub(this.target[robotIndex].position.clone().add(this.normalAdjustmentVector[robotIndex].clone()));
	vector.applyMatrix4(matrix);

	

	if(this.THREE1[robotIndex].rotation.x!=0&&this.THREE1[robotIndex].rotation.x!=180*this.DEG_TO_RAD)
	{
		vector.x = -vector.x;
		vector.add(this.THREE1[robotIndex].position.clone());
	}else if(this.THREE1[robotIndex].rotation.y!=0&&this.THREE1[robotIndex].rotation.y!=180*this.DEG_TO_RAD)
	{
		vector.y = -vector.y;
		vector.add(this.THREE1[robotIndex].position.clone());
			
	}else
	{
		vector = new THREE.Vector3(0,0,0).sub(vector.clone());
		vector.add(this.THREE1[robotIndex].position.clone());
	}
	
	var origin= new THREE.Vector3(this.THREE1[robotIndex].position.x, this.THREE1[robotIndex].position.y, vector.z);

	var a=this.ik_2d( vector.z-this.THREE1[robotIndex].position.z ,origin.distanceTo(vector) , this.guiControls[robotIndex].leg1, this.guiControls[robotIndex].leg2);
	
	this.VisualRobot[robotIndex].setAngle(robotIndex,0,Math.atan2( vector.y-this.THREE1[robotIndex].position.y , vector.x-this.THREE1[robotIndex].position.x));
	this.VisualRobot[robotIndex].setAngle(robotIndex,1,a.theta1);
	this.VisualRobot[robotIndex].setAngle(robotIndex,2,a.theta2-a.theta1);
	this.VisualRobot[robotIndex].setAngle(robotIndex,3,(this.voxelNormal[robotIndex]*this.DEG_TO_RAD)-(a.theta2));
	this.VisualRobot[robotIndex].setAngle(robotIndex,4,Math.atan2( vector.y-this.THREE1[robotIndex].position.y , vector.x-this.THREE1[robotIndex].position.x));

	if(this.leg[robotIndex]==1)
	{
		this.guiControls[robotIndex].j1=this.angles[robotIndex][0]*this.RAD_TO_DEG;
		this.guiControls[robotIndex].j2=this.angles[robotIndex][1]*this.RAD_TO_DEG;
		this.guiControls[robotIndex].j3=this.angles[robotIndex][2]*this.RAD_TO_DEG;
		this.guiControls[robotIndex].j4=this.angles[robotIndex][3]*this.RAD_TO_DEG;
		this.guiControls[robotIndex].j5=this.angles[robotIndex][4]*this.RAD_TO_DEG;
		//later output package
		// console.log(this.angles[robotIndex][0]+","+this.angles[robotIndex][1]+","+this.angles[robotIndex][2]+","+this.angles[robotIndex][3]+","+this.angles[robotIndex][4]);
	}else
	{
		this.guiControls[robotIndex].j1=this.angles[robotIndex][4]*this.RAD_TO_DEG;
		this.guiControls[robotIndex].j2=this.angles[robotIndex][3]*this.RAD_TO_DEG;
		this.guiControls[robotIndex].j3=this.angles[robotIndex][2]*this.RAD_TO_DEG;
		this.guiControls[robotIndex].j4=this.angles[robotIndex][1]*this.RAD_TO_DEG;
		this.guiControls[robotIndex].j5=this.angles[robotIndex][0]*this.RAD_TO_DEG;
		//later output package
		// console.log(this.angles[robotIndex][4]+","+this.angles[robotIndex][3]+","+this.angles[robotIndex][2]+","+this.angles[robotIndex][1]+","+this.angles[robotIndex][0]);
	}


	if(saveAngleData)
	{
		this.fillOutputAngles(robotIndex);
	}
};

Swarm.prototype.ik_2d= function(x, y, d1, d2) {
	let dist = Math.sqrt(x ** 2 + y ** 2);
	let theta1 = Math.atan2(y, x) - Math.acos((dist ** 2 + d1 ** 2 - d2 ** 2) / (2 * d1 * dist));
	let theta2 = Math.atan2(y - d1 * Math.sin(theta1), x - d1 * Math.cos(theta1));
	return {theta1, theta2};
};

Swarm.prototype.getNormalAdjustment= function(robotIndex,n,vnormal,forward){//n is normal degree{
	var result=new THREE.Vector3(0,0,0);
	if(n==180)
	{
		return result;
	}
	var theta=Math.abs(180-n);
	var base=2*Math.sin(theta/2*this.DEG_TO_RAD)*this.guiControls[robotIndex].offset;
	var x= Math.sin(((180-theta)/2)*this.DEG_TO_RAD)*base;
	var y= Math.cos(((180-theta)/2)*this.DEG_TO_RAD)*base;

	result= vnormal.clone().multiplyScalar(-y);

	if(n > 180)
	{
		var tempV=forward.clone().multiplyScalar(x);
		result.add(tempV);
		return result;
	}else
	{
		var tempV=forward.clone().multiplyScalar(-x);
		result.add(tempV);
		return result;
	}

};

Swarm.prototype.fillOutputAngles=function(robotIndex){
	var restAngles,outputAngles;
	restAngles=[0, 0.4934693946333222, 2.1546538643231488, 0.4934693946333222, 0];
	restAngles=[0, 0, 0, 0, 0];

	outputAngles=[(this.angles[robotIndex][0]-restAngles[0])*this.RAD_TO_DEG, -(this.angles[robotIndex][1]-restAngles[1])*this.RAD_TO_DEG, (this.angles[robotIndex][2]-restAngles[2])*this.RAD_TO_DEG, -(this.angles[robotIndex][3]- restAngles[3])*this.RAD_TO_DEG,(this.angles[robotIndex][0]-restAngles[0])*this.RAD_TO_DEG];


	if(this.leg[robotIndex]==1)
	{

		// outputAngles=[ -(angles[1]-restAngles[1])*RAD_TO_DEG, (angles[2]-restAngles[2])*RAD_TO_DEG, -(angles[3]- restAngles[3])*RAD_TO_DEG];
		outputAngles=[(this.angles[robotIndex][0]-restAngles[0])*this.RAD_TO_DEG, (this.angles[robotIndex][1]-restAngles[1])*this.RAD_TO_DEG, (this.angles[robotIndex][2]-restAngles[2])*this.RAD_TO_DEG, (this.angles[robotIndex][3]- restAngles[3])*this.RAD_TO_DEG,(this.angles[robotIndex][0]-restAngles[0])*this.RAD_TO_DEG];
		if(outputAngles[0]>=90)
		{
			outputAngles[0]=90-outputAngles[0];
		}
		if(outputAngles[4]>=90)
		{
			outputAngles[4]=90-outputAngles[4];
		}
		if(outputAngles[0]<=-90)
		{
			outputAngles[0]=90+outputAngles[0];
		}
		if(outputAngles[4]<=-90)
		{
			outputAngles[4]=90+outputAngles[4];
		}

		
	}else
	{

		outputAngles=[(this.angles[robotIndex][0]-restAngles[0])*this.RAD_TO_DEG, (this.angles[robotIndex][3]-restAngles[1])*this.RAD_TO_DEG, (this.angles[robotIndex][2]-restAngles[2])*this.RAD_TO_DEG, (this.angles[robotIndex][1]- restAngles[3])*this.RAD_TO_DEG,(this.angles[robotIndex][0]-restAngles[0])*this.RAD_TO_DEG];
		// outputAngles[0]=180-outputAngles[0]-90;
		// outputAngles[4]=180-outputAngles[4]-90;

		if(outputAngles[0]>0)
		{
			outputAngles[0]-=180;
		}
		if(outputAngles[4]>0)
		{
			outputAngles[4]-=180;
		}

		if(outputAngles[0]<0)
		{
			outputAngles[0]+=180-90;
			outputAngles[0]=-outputAngles[0];
		}
		if(outputAngles[4]<0)
		{
			outputAngles[4]+=180-90;
			outputAngles[4]=-outputAngles[4];
		}
		// if(outputAngles[0]<=-90)
		// {
		// 	outputAngles[0]=90+outputAngles[0];
		// }
		// if(outputAngles[4]<=-90)
		// {
		// 	outputAngles[4]=90+outputAngles[4];
		// }


		// if(outputAngles[0]==180||outputAngles[0]==-180)
		// {
		// 	outputAngles[0]=0;
		// }
		// if(outputAngles[4]==180||outputAngles[4]==-180)
		// {
		// 	outputAngles[4]=0;
		// }
		// if (outputAngles[0]<0){
		// 	outputAngles[0]+=90;
		// 	outputAngles[0]=-outputAngles[0];

		// }
		// if (outputAngles[4]<0){
		// 	outputAngles[4]+=90;
		// 	outputAngles[4]=-outputAngles[4];

		// }
		
		// else if (outputAngles[0]>0) 
		// {
		// 	outputAngles[0]=-outputAngles[0]+90.0;
		// }else
		// {
		// 	outputAngles[0]=-outputAngles[0]-90.0;
		// }

		// outputAngles[4]=2.0*outputAngles[0];
	}
	this.dataAngles.push(outputAngles); //todo change later to multiple robots
	this.guiControls[robotIndex].j1=outputAngles[0];
	this.guiControls[robotIndex].j2=outputAngles[1];
	this.guiControls[robotIndex].j3=outputAngles[2];
	this.guiControls[robotIndex].j4=outputAngles[3];
	this.guiControls[robotIndex].j5=outputAngles[4];

};