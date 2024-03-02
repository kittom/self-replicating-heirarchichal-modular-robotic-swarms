// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

//////////////////////////path planing///////////////////////////
Swarm.prototype.pathPlan= function(robotIndex,leg1Pos, leg2Pos, up ,forward,targetPos){
    // console.log(targetPos)


    // if(this.robotScale[robotIndex]==2){
    //     console.log(leg1Pos);
    //     console.log(targetPos);
    // }
	if(this.voxelAt(robotIndex,targetPos.clone().multiplyScalar(1/this.voxelSpacing[robotIndex]))){
		var succeded=false;
		var p0=this.findShortestPath(robotIndex,leg1Pos.clone(), leg2Pos.clone(), up.clone(),forward.clone(), targetPos);
		succeded=p0[4];
		this.steps[robotIndex]=this.steps[robotIndex].concat(p0[5]);
		if(!succeded){
            
            console.log("Robot "+robotIndex+" stuck!!!!!")
            console.log(targetPos)
		}
		return [p0[0] , p0[1] , p0[2] , p0[3] , true];
		if(!succeded)
		{
			// console.log("see path from neighbours");
			var neighbours=this.getNeighbors(targetPos);
			
			for(var i=0;i<neighbours.length;i++)
			{	
				var p=this.findShortestPath(robotIndex,leg1Pos.clone(), leg2Pos.clone(), up.clone(),forward.clone(),neighbours[i]);
				succeded=p[4];
				if(succeded)
				{
					var stepsFirst=p[5].slice();
					var p1=this.findShortestPath(robotIndex,p[0], p[1], p[2],p[3],targetPos);
					succeded=p[4];
					if(succeded)
					{
						for(var j=0;j<this.steps[robotIndex].length;j++)
						{
							stepsFirst.push(p1[5][j]);
						}

						this.steps[robotIndex]=this.steps[robotIndex].concat(stepsFirst.slice());
						return [p[0] , p[1] , p[2] , p[3] , true];
					}
				}
			}
			return [leg1Pos, leg2Pos, up ,forward , false];
		}

	}
	else
	{
		console.log("TARGET VOXEL DOESN'T EXIST!");
		console.log(targetPos)
		return [leg1Pos, leg2Pos, up ,forward , false];

	}
	console.log("Shouldn't be here");
	
	
}

Swarm.prototype.findShortestPath= function(robotIndex,leg1Pos, leg2Pos, up,forward, targetPos){
	var stepsTemp=[];
	var stepsAlternative=[];
	var orderAlternatives=[[0,1,2],[0,2,1],[1,2,0],[1,0,2],[2,1,0],[2,0,1]];
	for(var i=0;i<orderAlternatives.length;i++)
	{
		stepsAlternative.push(this.findPath(robotIndex,leg1Pos.clone(), leg2Pos.clone(), up.clone(),forward.clone(), targetPos, orderAlternatives[i]).slice());
	}
	stepsAlternative.sort(function(a, b){
		// ASC  -> a.length - b.length
		// DESC -> b.length - a.length
		return a[4].length - b[4].length;
	});
	stepsTemp=stepsAlternative[0][4].slice();
	if(stepsTemp.length>this.stepsCap)
	{
		stepsTemp=[];
		console.log("CAN'T FIND ANY PATH TO THIS POINT");
		return [stepsAlternative[0][0],stepsAlternative[0][1],stepsAlternative[0][2],stepsAlternative[0][3],false,stepsTemp];
	}else
	{
		return [stepsAlternative[0][0],stepsAlternative[0][1],stepsAlternative[0][2],stepsAlternative[0][3],true,stepsTemp];
	}
}

Swarm.prototype.findPath= function(robotIndex,leg1Pos, leg2Pos, up, forward, targetPos, order){
	var logg=false;
	if (logg) console.log(order);
	var stepsTemp=[];
	// leg1Pos.multiplyScalar(1/this.voxelSpacing[robotIndex]);
	// leg2Pos.multiplyScalar(1/this.voxelSpacing[robotIndex]);
	var difference=this.getDifference(robotIndex,leg1Pos, targetPos);
	var forwardAlt=new THREE.Vector3(0,0,0);
	var pos=leg1Pos.clone();
	var error=1000;
	var counts=0;
	

	while(difference[0]!=0||difference[1]!=0||difference[2]!=0 &&counts<error){
		for(var count=0;count<3;count++){
			var i= order[count];
			var startingLeg1Pos=leg1Pos.clone();
			var startingLeg2Pos=leg2Pos.clone();
			var exit=false;
			var previousDifference=Math.pow(10, 1000);//infinity
			
			if(i==0)
			{
				forwardAlt=new THREE.Vector3(-difference[0],0,0);
				forwardAlt.normalize();
				if(up.x==0)
				{
					forward=forwardAlt.clone();
				}
			}else if(i==1)
			{
				forwardAlt=new THREE.Vector3(0,-difference[1],0);
				forwardAlt.normalize();
				if(up.y==0)
				{
					forward=forwardAlt.clone();
				}
			}else if(i==2)
			{
				forwardAlt=new THREE.Vector3(0,0,-difference[2]);
				forwardAlt.normalize();
				if(up.z==0)
				{
					forward=forwardAlt.clone();
				}
			}
			var counts2=0;

			while (Math.abs(difference[i])>0 && !exit && counts2<error){
				
				if(this.voxelAt(robotIndex,pos.clone().add(forward.clone().add(up))))
				{
					if( this.voxelAt(robotIndex, pos.clone().add( forward.clone().add(up.clone().add(up)) )))
					{
						//step there //rotate convex
						if (logg) console.log("rotate convex");
						leg1Pos=pos.clone().add( forward.clone().add(up.clone().add(up)));
						leg2Pos=pos.clone().add(forward.clone().add(up));
						var temp=up.clone();
						up= new THREE.Vector3(0,0,0).sub(forward);
						forward=temp.clone();
						stepsTemp.push([leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),up]);
						difference=this.getDifference(robotIndex,leg1Pos, targetPos);
						pos=leg1Pos.clone();
					}
					else //if pos+forward+up+up empty 
					{
						//step there //step up
						if (logg) console.log("step up");
						leg2Pos=leg1Pos.clone();
						leg1Pos=pos.clone().add(forward.clone().add(up));
						stepsTemp.push([leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),up]);
						difference=this.getDifference(robotIndex,leg1Pos, targetPos);
						pos=leg1Pos.clone();
					}
				}
				else //if(pos +foward +up) empty
				{
					if (this.voxelAt(robotIndex,pos.clone().add(forward.clone())))
					{
						//step there //step forward
						if (logg) console.log("step forward");
						leg2Pos=leg1Pos.clone();
						leg1Pos=pos.clone().add(forward.clone());
						stepsTemp.push([leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),up]);
						difference=this.getDifference(robotIndex,leg1Pos, targetPos);
						pos=leg1Pos.clone();
					}
					else //if pos+forward empty
					{
						if(this.voxelAt(robotIndex,pos.clone().add(forward.clone().sub(up))))
						{
							//step there //step down
							if (logg) console.log("step down");
							leg2Pos=leg1Pos.clone();
							leg1Pos=pos.clone().add(forward.clone().sub(up));
							stepsTemp.push([leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),up]);
							difference=this.getDifference(robotIndex,leg1Pos, targetPos);
							pos=leg1Pos.clone();
						}
						else if (this.voxelAt(robotIndex,pos.clone().sub(up))) //pos-up full
						{
							if (logg) console.log("rotate concave");
							leg2Pos=leg1Pos.clone();
							leg1Pos=pos.clone().sub(up);
							var temp=up.clone();
							up= forward.clone();
							forward=new THREE.Vector3(0,0,0).sub(temp);
							stepsTemp.push([leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),leg2Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]),up]);
							difference=this.getDifference(robotIndex,leg1Pos, targetPos);
							pos=leg1Pos.clone();
						}
						else 
						{
							if (logg) console.log("fail");
							exit=true;
						}
					}
				}

				if( previousDifference<0 &&difference[i]<=0 )
				{
					
					if(Math.abs(previousDifference)<Math.abs(difference[i]))
					{
						exit=true;
						if (logg) console.log("exit");
					}

				}
				else
				{
					if(previousDifference<Math.abs(difference[i]))
					{
						exit=true;
						if (logg) console.log("exit");
					}

				}
				previousDifference=difference[i];
				if(stepsTemp.length>this.stepsCap)//cap number of steps in case of failure // change later based on complexity of the model
				{
					exit=true;
					if (logg) console.log("Too many steps,choose another alternative");
				}	
				counts2++;
				if(counts2>=error){
					console.log("errrooooorrr robot "+robotIndex+"!!!");
				}

			}

			
		}
		if(stepsTemp.length>this.stepsCap)//cap number of steps in case of failure // change later based on complexity of the model
		{
			difference[0]=0;
			difference[1]=0;
			difference[2]=0;
			if (logg) console.log("Too many steps,choose another alternative");
		}
		counts++;
		if(counts>=error){
			difference[0]=0;
			difference[1]=0;
			difference[2]=0;
			console.log("errrooooorrr robot "+robotIndex+"!!!");
		}

	}
	return [leg1Pos, leg2Pos, up,forward,stepsTemp];

}

Swarm.prototype.voxelAt= function(location){
	if(location.x<0||location.y<0||location.z<0||location.x>=this.gridSize||location.y>=this.gridSize||location.z>=this.gridSize)
	{
		return false;
	}
	return this.grid[location.x][location.y][location.z];
}

Swarm.prototype.voxelAt= function(robotIndex,loc){
	var location=loc.clone();
	location.x=location.x*this.robotScale[robotIndex];
	location.y=location.y*this.robotScale[robotIndex];
	location.z=location.z*this.robotScale[robotIndex];
	// location.z=(location.z-1)*this.robotScale[robotIndex]+1;
	
	
	// console.log(location.z);

	if(location.x<0||location.y<0||location.z<0||location.x>=this.gridSize||location.y>=this.gridSize||location.z>=this.gridSize)
	{
		return false;
	}
	if(this.robotScale[robotIndex]>1){
		
		// location.z=loc.z*this.robotScale[robotIndex];
		// if(location.z<0){
		// 	location.z=0;
		// }
		// if(!this.grid[location.x][location.y][location.z]){
		// 	console.log(location);
		// }

	}
	return this.grid[location.x][location.y][location.z];
}

Swarm.prototype.getDifference= function(robotIndex,location, targetPos){
	var diff=[];
	diff.push(location.x-targetPos.x/this.voxelSpacing[robotIndex]);//0
	diff.push(location.y-targetPos.y/this.voxelSpacing[robotIndex]);//1
	diff.push(location.z-targetPos.z/this.voxelSpacing[robotIndex]);//2
	return diff.slice();
}

Swarm.prototype.getNeighbors= function(targetPos){
	var n=[];
	var t=targetPos.clone().multiplyScalar(1/this.spacing);
	// for(var i=-1;i<2;i++)
	// {
	// 	for(var j=-1;j<2;j++)
	// 	{
	// 		for(var k=-1;k<2;k++)
	// 		{
	// 			var tt=new THREE.Vector3(t.x+i,t.y+j,t.z+k);
	// 			if(!(tt.equals(t)) && this.voxelAt(tt) )
	// 			{
	// 				n.push(new THREE.Vector3(tt*this.spacing,tt*this.spacing,tt*this.spacing));
	// 			}
	// 		}
	// 	}
	// }
	var tt=new THREE.Vector3(t.x+1,t.y,t.z);
	if(this.voxelAt(tt))
	{
		n.push(new THREE.Vector3(tt.x*this.spacing,tt.y*this.spacing,tt.z*this.spacing));
	}
	tt=new THREE.Vector3(t.x-1,t.y,t.z);
	if(this.voxelAt(tt))
	{
		n.push(new THREE.Vector3(tt.x*this.spacing,tt.y*this.spacing,tt.z*this.spacing));
	}
	tt=new THREE.Vector3(t.x,t.y+1,t.z);
	if(this.voxelAt(tt))
	{
		n.push(new THREE.Vector3(tt.x*this.spacing,tt.y*this.spacing,tt.z*this.spacing));
	}
	tt=new THREE.Vector3(t.x,t.y-1,t.z);
	if(this.voxelAt(tt))
	{
		n.push(new THREE.Vector3(tt.x*this.spacing,tt.y*this.spacing,tt.z*this.spacing));
	}
	tt=new THREE.Vector3(t.x,t.y,t.z+1);
	if(this.voxelAt(tt))
	{
		n.push(new THREE.Vector3(tt.x*this.spacing,tt.y*this.spacing,tt.z*this.spacing));
	}
	tt=new THREE.Vector3(t.x,t.y,t.z-1);
	if(this.voxelAt(tt))
	{
		n.push(new THREE.Vector3(tt.x*this.spacing,tt.y*this.spacing,tt.z*this.spacing));
	}
	return n;
}