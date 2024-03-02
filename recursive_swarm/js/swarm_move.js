// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

//////////////////////////commands stack////////////////////////////

Swarm.prototype.startMovement= function(robotIndex,home){
	if(!this.hierarchical && this.buildType=="frepCube"){
		this.startMovementIROS(robotIndex,home);
	}else if(this.hierarchical && this.buildType=="sdfList"){
		this.startMovementHierarchicalSDF(robotIndex,home);
	}else if(this.hierarchical && this.buildType=="sdfList1"){
		this.startMovementHierarchicalSDF1(robotIndex,home);
	}else if(this.hierarchical && (this.buildType=="list"||this.buildType=="recursion")){
		this.startMovementList(robotIndex,home);
	}

}

Swarm.prototype.startMovementList= function(robotIndex,home){
    // console.log("robot:"+robotIndex+" home:"+home);
	
	//if not home
	if(!home){
		this.resetPath(robotIndex);
		this.voxelBuilderList(
			robotIndex,this.robotState[robotIndex].leg1Pos, 
			this.robotState[robotIndex].leg2Pos, 
			this.robotState[robotIndex].up,
			this.robotState[robotIndex].forward,
			this.voxelList[robotIndex].list
			); 
		this.generatePoints(robotIndex);
		
		//if generated path
		if(this.steps[robotIndex].length>0){
			for(var i=0;i<this.steps[robotIndex].length;i++){
				this.step(robotIndex,i);
			}
			if(this.voxelList[robotIndex].pickupList!==undefined){
				this.startLocations[robotIndex]=this.depositLocations[this.voxelList[robotIndex].pickupList[0]];
				this.voxelList[robotIndex].pickupList.shift();
			}
			this.goHome[robotIndex]=true;
		}else{
			// console.log("done")
			// this.bille.visible=true;
			// for(var i=0;i<9;i++){
			// 	var joint = this.scene.getObjectByName( "bille" +i);
			// 	joint.visible=false;

			// }
			next();
			
			
		}

		

	}
	//go home
	else{
		this.resetPath(robotIndex);
		this.reloadVoxel(
			robotIndex,
			this.robotState[robotIndex].leg1Pos, 
			this.robotState[robotIndex].leg2Pos, 
			this.robotState[robotIndex].up,
			this.robotState[robotIndex].forward);
		this.generatePoints(robotIndex);

		for(var i=0;i<this.steps[robotIndex].length;i++){
			this.step(robotIndex,i);
		}

		this.goHome[robotIndex]=false;

		if(this.steps[robotIndex].length==0){
			// console.log("nn st")
			this.startMovement(robotIndex,false);
		}

	}
				
}

Swarm.prototype.voxelBuilderList= function(robotIndex,leg1Pos, leg2Pos, up ,forward,availableVoxels){
	// var availableVoxels=this.voxelSlices[this.robotState[robotIndex].Z];
	
	var start=leg1Pos.clone();
	var state;
	var succeeded;
	var count=0;

	var min=Infinity;
	var minIndex= new THREE.Vector3(0,0,0);
    var minIndex1= 0;
    var robotSize=this.robotScale[robotIndex];


	//if there is still voxels in this layer
	if(availableVoxels !== undefined){
		if(availableVoxels.length>0){ 
			minIndex= availableVoxels[minIndex1].clone().multiplyScalar(this.voxelSpacing[robotIndex]);
			minIndex.x=minIndex.x/this.robotScale[robotIndex];
			minIndex.y=minIndex.y/this.robotScale[robotIndex];
			minIndex.z=minIndex.z/this.robotScale[robotIndex];
			//for all available voxels
			// for(var i=0;i<availableVoxels[this.robotState[robotIndex].rank].length;i++){
			// 	//if no voxel 
			// 	if(!this.voxelAt(availableVoxels[this.robotState[robotIndex].rank][i].clone().multiplyScalar(1/this.voxelSpacing[robotIndex]))){
			// 		//find min distance
			// 		if(start.distanceTo(availableVoxels[this.robotState[robotIndex].rank][i])<min){
			// 			min=start.distanceTo(availableVoxels[this.robotState[robotIndex].rank][i]);
			// 			minIndex=availableVoxels[this.robotState[robotIndex].rank][i];
			// 		}
			// 	}
			// }
			//change occupancy
			//change occupancy
			if(this.robotScale[robotIndex]>1){//todo change to accommodate for more sizes
				//todo check if
				minIndex.z=(availableVoxels[minIndex1].z+(robotSize-1))*this.voxelSpacing[robotIndex]/this.robotScale[robotIndex];
				
				
				for (var j=0; j<this.voxelIndexList[robotSize].list.length;j++){
					this.grid[availableVoxels[minIndex1].x+this.voxelIndexList[robotSize].list[j].x]
							[availableVoxels[minIndex1].y+this.voxelIndexList[robotSize].list[j].y]
							[availableVoxels[minIndex1].z+this.voxelIndexList[robotSize].list[j].z-1]=true;
				}

			}else{
				this.grid[availableVoxels[minIndex1].x][availableVoxels[minIndex1].y][availableVoxels[minIndex1].z]=true;

			}
			//remove from list 
			this.voxelList[robotIndex].list.shift();
			// this.voxelList[robotIndex].list = availableVoxels.slice(0, minIndex1).concat(availableVoxels.slice(minIndex1 + 1, availableVoxels.length));
			// this.voxelList[robotIndex].list.shift();

			this.showTargetPosition(robotIndex,minIndex,true);

			state= this.pathPlan(robotIndex,leg1Pos, leg2Pos, up ,forward,minIndex);

			this.robotState[robotIndex].leg1Pos=state[0].clone();
			this.robotState[robotIndex].leg2Pos=state[1].clone();
			this.robotState[robotIndex].up=state[2].clone();
			this.robotState[robotIndex].forward=state[3].clone();
			succeeded=state[4];

			if(succeeded)
			{
				return [state[0],state[1],state[2],state[3]];

			}else
			{
				// console.log("COULDN'T FIND PATH!!!");
				return false;
			}

		}else{
			return false;
		}
	}else{
		console.log("DONEE!!!");
		return false;
	}

}

Swarm.prototype.startMovementHierarchicalSDF1= function(robotIndex,goHome){

	var wait=false;
	var robotSize=this.robotScale[robotIndex];
	var log=false;
	
	//if not home
	if(!goHome && !this.buildList.done){

        //////////////////////////check if task is pending/////////////////

		//if bigger size bill-e at pickup site and ready to delete in situ
		if(robotSize>1&&  this.voxelList[robotIndex].toDelete.robotIndex!=-1){
			// console.log(robotSize)
			// console.log(this.voxelList[robotIndex].toDelete.stockData)

			// console.log(this.startLocations[robotIndex].equals(this.startLocations[this.voxelList[robotIndex].toDelete.robotIndex]))
			if(this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]).equals(this.startLocations[robotIndex])&&this.startLocations[robotIndex].equals(this.startLocations[this.voxelList[robotIndex].toDelete.robotIndex])){
				var pickUp=this.voxelList[robotIndex].toDelete.robotIndex;

				if(this.voxelList[robotIndex].toDelete.stockData.length>1 ){
					//delete voxels from scene
					for (var j=0; j<this.voxelIndexList[2].list.length;j++){
						// var loc=this.voxelIndexList[2].list[j].clone()
						// 			.add(this.startLocations[pickUp].clone().multiplyScalar(1/this.voxelSpacing[pickUp]))
						//             .add(this.inSituAdjustment[pickUp]);
						var loc=this.voxelIndexList[2].list[j].clone()
									.add(this.startLocations[pickUp].clone().multiplyScalar(1/this.voxelSpacing[pickUp]))
									.add(this.inSituAdjustment[pickUp].clone().multiplyScalar(1/this.robotScale[pickUp]));

						this.grid[loc.x][loc.y][loc.z]=false;

						var name='['+loc.x+','+loc.y+','+loc.z+']';
						var obj=this.scene.getObjectByName(name);
						this.scene.remove(obj);

					}

					var indexZ=   this.voxelList[robotIndex].toDelete.stockData[0];
					var indexSize=this.voxelList[robotIndex].toDelete.stockData[1];
					var indexSDF= this.voxelList[robotIndex].toDelete.stockData[2];
					var indexCube=this.voxelList[robotIndex].toDelete.stockData[3];
					//flag that it is picked up
					this.buildList.listSize[indexSize].listZ[indexZ].listSDF[indexSDF].listCubes[indexCube].stockPickedUp=true;
					//make smaller billl-e not busy
					this.voxelList[pickUp].busy=false;
					this.startLocations[robotIndex]=this.depositLocations[robotIndex].clone();
					//remove fag that arrived to pickup
					this.voxelList[robotIndex].toDelete={stockData:[],robotIndex:-1};

					//now get task to build voxel
					this.buildList.listSize[indexSize].listZ[indexZ].listSDF[indexSDF].listCubes[indexCube].done=true;
					//todo make sure that works.. maybe final location is not the one
					this.voxelList[robotIndex].build.list.push({ position:this.buildList.listSize[indexSize].listZ[indexZ].listSDF[indexSDF].listCubes[indexCube].position.clone(),
						stockBuilt:true});

				}else{
					
					var indexBiggerRobot=this.voxelList[robotIndex].toDelete.stockData[0];
					if(indexBiggerRobot==robotIndex){
						//delete voxels from scene
						for (var j=0; j<this.voxelIndexList[2].list.length;j++){
							// var loc=this.voxelIndexList[2].list[j].clone()
							// 			.add(this.startLocations[pickUp].clone().multiplyScalar(1/this.voxelSpacing[pickUp]))
							//             .add(this.inSituAdjustment[pickUp]);
							var loc=this.voxelIndexList[2].list[j].clone()
										.add(this.startLocations[pickUp].clone().multiplyScalar(1/this.voxelSpacing[pickUp]))
										.add(this.inSituAdjustment[pickUp].clone().multiplyScalar(1/this.robotScale[pickUp]));

							this.grid[loc.x][loc.y][loc.z]=false;

							var name='['+loc.x+','+loc.y+','+loc.z+']';
							var obj=this.scene.getObjectByName(name);
						

							this.scene.remove(obj);

						}

						indexBiggerRobot=robotIndex;
						var taskGiven=false;
						for(var i=0;i<this.voxelList[indexBiggerRobot].build.list.length;i++){
							if(!this.voxelList[indexBiggerRobot].build.list[i].stockBuilt && !taskGiven){
								// console.log(i)
								// console.log(indexBiggerRobot)

								taskGiven=true;
								//make smaller bill-e not busy
								this.voxelList[pickUp].busy=false;
								this.startLocations[robotIndex]=this.depositLocations[robotIndex].clone();
								//remove fag that arrived to pickup
								this.voxelList[robotIndex].toDelete={stockData:[],robotIndex:-1};

								this.voxelList[indexBiggerRobot].build.list[i].stockBuilt=true;

								//todo make sure that works.. maybe final location is not the one
								// this.voxelList[robotIndex].build.list.push({ position:this.voxelList[indexBiggerRobot].build.list[i].position.clone(),
								//     stockBuilt:true});


							}

						}
						if(!taskGiven){
							// if(log) 
							if(log) console.log("dcvszv"+robotIndex)

							wait=true;
						}

					}
				}

			}
			
		}

		
		
		//if smaller size bill-e finished building in situ construction and flag available for pickup
		//if voxelList has the flag
		if(this.voxelList[robotIndex].build.stockData.length>0 &&this.voxelList[robotIndex].build.list.length==0){
            if(this.voxelList[robotIndex].build.stockData.length>1){
                var indexZ=this.voxelList[robotIndex].build.stockData[0];
                var indexSize=this.voxelList[robotIndex].build.stockData[1];
                var indexSDF=this.voxelList[robotIndex].build.stockData[2];
                var indexCube=this.voxelList[robotIndex].build.stockData[3];

                this.buildList.listSize[indexSize].listZ[indexZ].listSDF[indexSDF].listCubes[indexCube].stockBuilt=true;

                this.voxelList[robotIndex].build.stockData=[];
                var found=false;
                for(var i=0;i<this.buildList.availablePickup[robotSize*2].length;i++){ //change available pickup from busy to done
                    if(this.buildList.availablePickup[robotSize*2][i]==-1 && !found){
                        this.buildList.availablePickup[robotSize*2][i]={stockData:[indexZ,indexSize,indexSDF,indexCube],robotIndex:robotIndex};
                        found=true;
                    }
                }
                if(log) console.log("dvsv"+robotIndex)

                // wait=true;

            }else{
                var indexBiggerRobot=this.voxelList[robotIndex].build.stockData[0];
                this.voxelList[robotIndex].build.stockData=[];

                var found=false;
                for(var i=0;i<this.buildList.availablePickup[robotSize*2].length;i++){ //change available pickup from busy to done
                    if(this.buildList.availablePickup[robotSize*2][i]==-1 && !found){
                        this.buildList.availablePickup[robotSize*2][i]={stockData:[indexBiggerRobot],robotIndex:robotIndex};
                        found=true;
                    }
                }
                if(log) console.log("xczzc"+robotIndex)

                // wait=true;

            }
			
        }
        
        //if stock needed to be built for intermediate bill-es
        if(!wait && this.voxelList[robotIndex].build.list.length==0 &&this.buildList.listToBuild[robotSize].length>0&&!this.voxelList[robotIndex].busy&&!this.voxelList[robotIndex].busyGoingHome){
            //build in situ
            //hardcoded 2 as it will always be building 8 voxels regardless of the size
            var stockBuilt=false;
            if(robotSize==1){
                stockBuilt=true;
            }
            for (var j=0; j<this.voxelIndexList[2].list.length;j++){
                // this.voxelList[robotIndex].build.list.push({
                //     position:this.voxelIndexList[2].list[j].clone()
                //         .add(this.startLocations[robotIndex].clone().multiplyScalar(1/this.voxelSpacing[robotIndex]))
                //         .add(this.inSituAdjustment[robotIndex]),
                //         stockBuilt:stockBuilt
                // });
                this.voxelList[robotIndex].build.list.push({
                    position:this.voxelIndexList[2].list[j].clone().add(new THREE.Vector3(0,0,-1)).multiplyScalar(robotSize).add(new THREE.Vector3(0,0,1))
                        .add(this.startLocations[robotIndex].clone().multiplyScalar(1/this.voxelSpacing[robotIndex]*robotSize))
                        .add(this.inSituAdjustment[robotIndex].clone().multiplyScalar(1)),
                        stockBuilt:stockBuilt
                });
            }
            this.buildList.availablePickup[robotSize*2].push(-1); //for bigger robot to wait and not go home
			this.voxelList[robotIndex].build.stockData=[this.buildList.listToBuild[robotSize][0]];//push index at the end to flag when it's done
			// console.log(this.buildList.listToBuild[robotSize][0])
			this.voxelList[robotIndex].busy=true;

            this.buildList.listToBuild[robotSize].shift();

        }

        ////////////////check for new tasks//////////////////////////////////////
		//if have no assigned voxels try to assign 
		if( !wait && this.voxelList[robotIndex].build.list.length==0&& !this.voxelList[robotIndex].busy&&!this.voxelList[robotIndex].busyGoingHome&& !this.buildList.done){
			//find current bin
			var binSize=this.buildList.listSize[this.buildList.currentSizeIndex];
			var binZ=binSize.listZ[binSize.currentZIndex];
			var binSDF=binZ.listSDF[binZ.currentSDFIndex];
			
			var indexSize=this.buildList.currentSizeIndex;
			var indexZ=binSize.currentZIndex;
			var indexSDF=binZ.currentSDFIndex;

			var maxIndexSize=this.buildList.maxSizeIndex;
			var maxIndexZ=binSize.maxZIndex;
			var maxIndexSDF=binZ.maxSDFIndex;

			// if robot size smaller than target bin size
			if(robotSize<binSDF.size){
				if(robotSize==binSDF.size/2){
					var gotTask=false;
					for(var i=0;i<binSDF.listCubes.length;i++){
						if(!binSDF.listCubes[i].done&&!binSDF.listCubes[i].stockAssigned &&!gotTask){
							gotTask=true;
							binSDF.listCubes[i].stockAssigned=true;
							this.buildList.listSize[indexSize].listZ[indexZ].listSDF[indexSDF].listCubes[i].stockAssigned=true;
                            //build in situ
                            //hardcoded 2 as it will always be building 8 voxels regardless of the size
                            var stockBuilt=false;
                            if(robotSize==1){
                                stockBuilt=true;
                            }

                            for (var j=0; j<this.voxelIndexList[2].list.length;j++){
								this.voxelList[robotIndex].build.list.push({
                                    position:this.voxelIndexList[2].list[j].clone().add(new THREE.Vector3(0,0,-1)).multiplyScalar(robotSize).add(new THREE.Vector3(0,0,1))
                                        .add(this.startLocations[robotIndex].clone().multiplyScalar(1/this.voxelSpacing[robotIndex]*robotSize))
                                        .add(this.inSituAdjustment[robotIndex].clone().multiplyScalar(1)),
                                        stockBuilt:stockBuilt
                                });
                            }
                            
							this.buildList.availablePickup[binSDF.size].push(-1); //for bigger robot to wait and not go home
							this.voxelList[robotIndex].build.stockData=[indexZ,indexSize,indexSDF,i];//push index at the end to flag when it's done
							this.voxelList[robotIndex].busy=true;

                            //if not size 1 go back later as no stock available
                            // flag for smaller robots to build stocks
                            if(robotSize>1){
                                //add them in list to build
                                if(log) console.log("vdsvs"+robotIndex)

                                wait=true;
                                for(var i=0;i<8;i++){
                                    this.buildList.listToBuild[robotSize/2.0].push(robotIndex); //no need to put robotIndex but why not
                                }
                            }
						}
					}
					if(!gotTask){
                        if(log) console.log("dssvd"+robotIndex)
						wait=true;
					}

				}else{
                    if(log) console.log("awfawf"+robotIndex)
					wait=true;
				}

			}else if(binSDF.size==robotSize){ //if same size
				var gotTask=false;
				var done=true;
				for(var i=0;i<binSDF.listCubes.length;i++){
					if(!binSDF.listCubes[i].done){
						done=false;
					}
					if(!binSDF.listCubes[i].done&&binSDF.listCubes[i].stockBuilt &&!gotTask){
						gotTask=true;
						binSDF.listCubes[i].done=true;
						this.buildList.listSize[indexSize].listZ[indexZ].listSDF[indexSDF].listCubes[i].done=true;
						this.voxelList[robotIndex].build.list.push({position:binSDF.listCubes[i].position.clone(),stockBuilt:true});
					}
				}
				if(!gotTask){
                    if(log) console.log("fefswv"+robotIndex)
					wait=true;
				}

				//update list
				if(done){
					binSDF.done=true;
					this.buildList.listSize[indexSize].listZ[indexZ].listSDF[indexSDF].done=true;
					binZ.currentSDFIndex++;
					console.log("Layer "+(maxIndexZ-indexZ)+", size "+(maxIndexSize-indexSize)+", sdf "+(maxIndexSDF-indexSDF)+" done!");
					if(binZ.currentSDFIndex>=binZ.maxSDFIndex){
						binZ.done=true;
						this.buildList.listSize[indexSize].listZ[indexZ].done=true;
						console.log("Layer "+(maxIndexZ-indexZ)+", size "+(maxIndexSize-indexSize)+" done!");
						binSize.currentZIndex++;
						if(binSize.currentZIndex>=binSize.maxZIndex){
							binSize.done=true;
							this.buildList.listSize[indexSize].done=true;
							console.log("Size "+(maxIndexSize-indexSize)+" done!");
							this.buildList.currentSizeIndex++;
							if(this.buildList.currentSizeIndex>=this.buildList.maxSizeIndex){
								this.buildList.done=true;
								console.log("Simulation Done!!!!!!!!!!!!!!")
							}
						}
					}
				}
			}else{
                if(log) console.log("fdbddfbd"+robotIndex)
				wait=true; //later change for two sizes bigger
			}
        }
        
        //if has task but stock not ready
        if(this.voxelList[robotIndex].build.list.length> 0&& !this.voxelList[robotIndex].build.list[0].stockBuilt){
            if(log) console.log("bhhbj"+robotIndex)
            wait=true;
        }

        ///////////////////////////if there is task go on/////////////////
		//if have assigned voxel
		if(!wait && this.voxelList[robotIndex].build.list.length>0){
			this.resetPath(robotIndex);
			this.voxelBuilderHierarchicalSDF(
				robotIndex,this.robotState[robotIndex].leg1Pos, 
				this.robotState[robotIndex].leg2Pos, 
				this.robotState[robotIndex].up,
				this.robotState[robotIndex].forward,
				this.voxelList[robotIndex].build.list
			); 
			this.generatePoints(robotIndex);

			//if generated path
			if(this.steps[robotIndex].length>0){
				for(var i=0;i<this.steps[robotIndex].length;i++){
					this.step(robotIndex,i);
				}
				this.goHome[robotIndex]=true;
			}else{
                if(log) console.log("gbdfgd "+robotIndex)

				wait=true;
			}

		}else if(this.voxelList[robotIndex].build.list.length==0&&!wait){
			if(!this.buildList.done){
                // console.log("jbhb"+robotIndex)
				// this.goHome[robotIndex]=true;
				setTimeout(function(){ _startMovement(robotIndex,true); }, this.path[robotIndex].timeout+=(this.path[robotIndex].delay*this.waitTime));
            }
            // return;
		}

		if(this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]).equals(this.startLocations[robotIndex])){
			this.voxelList[robotIndex].busyGoingHome=false;
		}

		//if you have to wait we tigui bokra
		if(wait){
			setTimeout(function(){ _startMovement(robotIndex,true); }, this.path[robotIndex].timeout+=(this.path[robotIndex].delay*this.waitTime));
        }
		return;

    }else if(goHome){ //go home got get stock

        //////////////////////where to restock? (home or another smaller station)///////////
		var pickUp=-1;

		if(this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]).equals(this.startLocations[robotIndex])){
			this.voxelList[robotIndex].busyGoingHome=false;
		}
		if(this.voxelList[robotIndex].busyGoingHome){
			console.log(this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]));
			console.log(this.startLocations[robotIndex])
		}

		if(robotSize>1&&this.buildList.availablePickup[robotSize].length>0){
			if(this.buildList.availablePickup[robotSize][0]==-1){
                if(log) console.log("sscs"+robotIndex)
				wait=true;
				this.startLocations[robotIndex]=this.depositLocations[robotIndex].clone();
				this.voxelList[robotIndex].busyGoingHome=true;
			}else{
				var taskTaken=false;
				for(var i=0;i<this.buildList.availablePickup[robotSize].length;i++){
					if(!taskTaken&&this.buildList.availablePickup[robotSize][i]!=-1){
						pickUp=this.buildList.availablePickup[robotSize][i];
						if(pickUp.stockData.length==1){
							if(robotIndex==pickUp.stockData[0]){
								taskTaken=true;
								this.startLocations[robotIndex]=this.startLocations[this.buildList.availablePickup[robotSize][i].robotIndex].clone();
								this.buildList.availablePickup[robotSize]=this.buildList.availablePickup[robotSize].slice(0, i).concat(this.buildList.availablePickup[robotSize].slice(i + 1, this.buildList.availablePickup[robotSize].length));
								// this.buildList.availablePickup[robotSize].shift();
								this.voxelList[robotIndex].toDelete=pickUp;
							}
						}else{
							taskTaken=true;
							this.startLocations[robotIndex]=this.startLocations[this.buildList.availablePickup[robotSize][i].robotIndex].clone();
							this.buildList.availablePickup[robotSize]=this.buildList.availablePickup[robotSize].slice(0, i).concat(this.buildList.availablePickup[robotSize].slice(i + 1, this.buildList.availablePickup[robotSize].length));
							// this.buildList.availablePickup[robotSize].shift();
							this.voxelList[robotIndex].toDelete=pickUp;
						}
					}
				}
				
			}
		}else if(robotSize>1){ //no one is busy making smaller bill-es get out of the way
			this.startLocations[robotIndex]=this.depositLocations[robotIndex].clone();
		}
		// if(wait){
		// 	setTimeout(function(){ _startMovement(robotIndex,true); }, this.path[robotIndex].timeout+=(this.path[robotIndex].delay*10));
		// 	return;

		// }

		// if(!wait){
			this.resetPath(robotIndex);
			this.reloadVoxel(
				robotIndex,
				this.robotState[robotIndex].leg1Pos, 
				this.robotState[robotIndex].leg2Pos, 
				this.robotState[robotIndex].up,
				this.robotState[robotIndex].forward);
			this.generatePoints(robotIndex);

			for(var i=0;i<this.steps[robotIndex].length;i++){
                
				this.step(robotIndex,i);
			}

			this.goHome[robotIndex]=false;

			if(this.steps[robotIndex].length==0){
                
				// console.log("nn st")
				this.startMovement(robotIndex,false);
			}


		// }else{
		// 	// console.log("here")

		// 	setTimeout(function(){ _startMovement(robotIndex,false); }, this.path[robotIndex].timeout+=(this.path[robotIndex].delay*10));
		// }

		return;

	}else{
		console.log("Great job, simulation done!!")
		return;
	}

	console.log("shouldn't be here");
}

Swarm.prototype.voxelBuilderHierarchicalSDF= function(robotIndex,leg1Pos, leg2Pos, up ,forward,availableVoxels){

	var start=leg1Pos.clone();
	var state;
	var succeeded;
	var count=0;

	//get point with minimum distance
	var min=Infinity;
	var minIndex= new THREE.Vector3(0,0,0);
    var minIndex1= 0;
    var robotSize=this.robotScale[robotIndex];

	//if there is still voxels in this layer
	if(availableVoxels.length>0){ 
		minIndex= availableVoxels[minIndex1].position.clone().multiplyScalar(this.voxelSpacing[robotIndex]);
		minIndex.x=minIndex.x/this.robotScale[robotIndex];
		minIndex.y=minIndex.y/this.robotScale[robotIndex];
		minIndex.z=minIndex.z/this.robotScale[robotIndex];
		
		
		//change occupancy
        if(this.robotScale[robotIndex]>1){//todo change to accommodate for more sizes
            //todo check if
            minIndex.z=(availableVoxels[minIndex1].position.z+(robotSize-1))*this.voxelSpacing[robotIndex]/this.robotScale[robotIndex];
            
            
			for (var j=0; j<this.voxelIndexList[robotSize].list.length;j++){
				this.grid[availableVoxels[minIndex1].position.x+this.voxelIndexList[robotSize].list[j].x]
						 [availableVoxels[minIndex1].position.y+this.voxelIndexList[robotSize].list[j].y]
						 [availableVoxels[minIndex1].position.z+this.voxelIndexList[robotSize].list[j].z-1]=true;
			}

		}else{
			this.grid[availableVoxels[minIndex1].position.x][availableVoxels[minIndex1].position.y][availableVoxels[minIndex1].position.z]=true;

		}

		//remove from list 
		// this.voxelList[robotIndex].build.list = availableVoxels.slice(0, minIndex1).concat(availableVoxels.slice(minIndex1 + 1, availableVoxels.length));
		this.voxelList[robotIndex].build.list.shift();
		// console.log(this.voxelList[robotIndex])


		this.showTargetPosition(robotIndex,minIndex,true);

		state= this.pathPlan(robotIndex,leg1Pos, leg2Pos, up ,forward,minIndex);

		this.robotState[robotIndex].leg1Pos=state[0].clone();
		this.robotState[robotIndex].leg2Pos=state[1].clone();
		this.robotState[robotIndex].up=state[2].clone();
		this.robotState[robotIndex].forward=state[3].clone();
		succeeded=state[4];

		if(succeeded)
		{
			return [state[0],state[1],state[2],state[3]];

		}else
		{
			console.log("COULDN'T FIND PATH!!!");
			return false;
		}

	}else{
		// this.voxelList[robotIndex].assembled=true;
		console.log("ROBOT "+robotIndex+" DONEE!!!");
		return false;
	}

	console.log("shouldn't be here");
	

}

Swarm.prototype.startMovementIROS= function(robotIndex,home){
    // console.log("robot:"+robotIndex+" home:"+home);
	
	//if not home
	if(!home){
		this.resetPath(robotIndex);
		this.voxelBuilderIROS(
			robotIndex,this.robotState[robotIndex].leg1Pos, 
			this.robotState[robotIndex].leg2Pos, 
			this.robotState[robotIndex].up,
			this.robotState[robotIndex].forward,
			this.voxelSlices[this.robotState[robotIndex].Z]
			); 
		this.generatePoints(robotIndex);
		
		//if generated path
		if(this.steps[robotIndex].length>0){
			for(var i=0;i<this.steps[robotIndex].length;i++){
				this.step(robotIndex,i);
			}
			this.goHome[robotIndex]=true;
		}

		//update z and rank
		if(this.robotState[robotIndex].Z>this.globalZ){
			this.globalZ=this.robotState[robotIndex].Z;
			this.globalRank=this.robotState[robotIndex].rank;
		}else if(this.robotState[robotIndex].Z<this.globalZ)
		{
			this.robotState[robotIndex].Z=this.globalZ;
			this.robotState[robotIndex].rank=this.globalRank;
		}else{
			if(this.robotState[robotIndex].rank>this.globalRank){
				this.globalRank=this.robotState[robotIndex].rank;
			}else if(this.robotState[robotIndex].rank<this.globalRank)
			{
				this.robotState[robotIndex].rank=this.globalRank;
			}
		}
		//if no other z levels
		if(this.voxelSlices[this.robotState[robotIndex].Z]!==undefined){
			//if there are voxels
			if(this.voxelSlices[this.robotState[robotIndex].Z].length>0){
				if(this.voxelSlicesCount[this.robotState[robotIndex].Z][this.robotState[robotIndex].rank] <this.voxelSlices[this.robotState[robotIndex].Z][this.robotState[robotIndex].rank].length-1){
					this.voxelSlicesCount[this.robotState[robotIndex].Z][this.robotState[robotIndex].rank]++;	
					// console.log("robot:"+robotIndex+" f"+" home:"+home);
					if(!this.goHome[robotIndex]){
						this.startMovement(robotIndex,true);
					}
				}
				else{
					if(this.robotState[robotIndex].rank<this.voxelSlicesCount[this.robotState[robotIndex].Z].length-1){
						this.robotState[robotIndex].rank++;
						// this.globalRank++;
						// console.log("robot:"+robotIndex+" ff"+" home:"+home);
						if(!this.goHome[robotIndex]){
							this.startMovement(robotIndex,true);
						}
					}
					else
					{
						if(this.robotState[robotIndex].Z<this.voxelSlicesCount.length-1){
							this.robotState[robotIndex].Z++;
							this.robotState[robotIndex].rank=0;

							// this.globalZ++;
							// this.globalRank=0;

							// console.log("robot:"+robotIndex+" fff"+" home:"+home);
							if(!this.goHome[robotIndex]){
								this.startMovement(robotIndex,true);
							}
							
						}else{
							console.log("DONEEE!!!");

						}
					}
				}
			}
			else if(this.robotState[robotIndex].Z<this.voxelSlices.length){
				// console.log("robot:"+robotIndex+" fffff"+" home:"+home);
				this.robotState[robotIndex].Z++;
				this.robotState[robotIndex].rank=0;
				
				// this.globalZ++;
				// this.globalRank=0;
				// console.log("ss");
				this.startMovement(robotIndex,false);
			}
		}else{
			console.log("DONEE!!!");
		}

	}
	//go home
	else{
		this.resetPath(robotIndex);
		this.reloadVoxel(
			robotIndex,
			this.robotState[robotIndex].leg1Pos, 
			this.robotState[robotIndex].leg2Pos, 
			this.robotState[robotIndex].up,
			this.robotState[robotIndex].forward);
		this.generatePoints(robotIndex);

		for(var i=0;i<this.steps[robotIndex].length;i++){
			this.step(robotIndex,i);
		}

		this.goHome[robotIndex]=false;

		if(this.steps[robotIndex].length==0){
			// console.log("nn st")
			this.startMovement(robotIndex,false);
		}

	}
				
}

Swarm.prototype.startMovementDirections= function(robotIndex){
	this.goHome[robotIndex]=false;
	this.resetPath(robotIndex);
	this.getStepsFromDir(robotIndex);
	this.generatePoints(robotIndex);
	// console.log(this.path[robotIndex].points)
	
	//if generated path
	if(this.steps[robotIndex].length>0){
		for(var i=0;i<this.steps[robotIndex].length;i++){
			this.step(robotIndex,i);
		}
	}

}

Swarm.prototype.closestStartLocation= function(robotPosition){
	robotPosition.x=robotPosition.x*this.spacing;
	robotPosition.y=robotPosition.y*this.spacing;
	robotPosition.z=robotPosition.z*this.spacing;
	var closest=0;
	var min=robotPosition.distanceTo(this.startLocations[0]);
	for (var i=0;i< this.startLocations.length;i++){
		if(robotPosition.distanceTo(this.startLocations[i])<min)
		{
			min=robotPosition.distanceTo(this.startLocations[i]);
			closest=i;
		}
	}
	return closest;
}

Swarm.prototype.reloadVoxel= function(robotIndex,leg1Pos, leg2Pos, up ,forward){ //go home
	var succeeded;

	this.showTargetPosition(robotIndex,leg1Pos.clone(),false); 
	

	if(this.robotScale[robotIndex]==2&&this.buildType!="sdfList"&&this.buildType!="sdfList1"){ //if rank 2 pickup from predefined places
		// state= this.pathPlan(robotIndex,leg1Pos, leg2Pos, up ,forward,this.voxelList[robotIndex].pickupList[0].clone());
		// this.voxelList[robotIndex].pickupList.shift(); //remove defined location
		state= this.pathPlan(robotIndex,leg1Pos, leg2Pos, up ,forward,this.startLocations[robotIndex]);

	}else{
        state= this.pathPlan(robotIndex,leg1Pos, leg2Pos, up ,forward,this.startLocations[robotIndex]);
		//closest:
		// state= this.pathPlan(robotIndex,leg1Pos, leg2Pos, up ,forward,this.startLocations[this.closestStartLocation(leg1Pos.clone())]);
    }
	

	this.robotState[robotIndex].leg1Pos=state[0].clone();
	this.robotState[robotIndex].leg2Pos=state[1].clone();
	this.robotState[robotIndex].up=state[2].clone();
	this.robotState[robotIndex].forward=state[3].clone();
	succeeded=state[4];
	
	if(succeeded)
	{
		return [state[0],state[1],state[2],state[3]];

	}else
	{
		// console.log("COULDN'T FIND PATH!!!");
		return false;
	}
	 

}

Swarm.prototype.voxelBuilderIROS= function(robotIndex,leg1Pos, leg2Pos, up ,forward,availableVoxels){
	// var availableVoxels=this.voxelSlices[this.robotState[robotIndex].Z];
	
	var start=leg1Pos.clone();
	var state;
	var succeeded;
	var count=0;

	//get point with minimum distance
	var min=Infinity;
	var minIndex= new THREE.Vector3(0,0,0);

	//if there is still voxels in this layer
	if(availableVoxels !== undefined){
		if(availableVoxels.length>0){ 
			//for all available voxels
			for(var i=0;i<availableVoxels[this.robotState[robotIndex].rank].length;i++){
				//if no voxel 
				if(!this.voxelAt(availableVoxels[this.robotState[robotIndex].rank][i].clone().multiplyScalar(1/this.voxelSpacing[robotIndex]))){
					//find min distance
					if(start.distanceTo(availableVoxels[this.robotState[robotIndex].rank][i])<min){
						min=start.distanceTo(availableVoxels[this.robotState[robotIndex].rank][i]);
						minIndex=availableVoxels[this.robotState[robotIndex].rank][i];
					}
				}
			}
			//change occupancy
			this.grid[minIndex.x/this.voxelSpacing[robotIndex]][minIndex.y/this.voxelSpacing[robotIndex]][minIndex.z/this.voxelSpacing[robotIndex]]=true;

			this.showTargetPosition(robotIndex,minIndex,true);

			state= this.pathPlan(robotIndex,leg1Pos, leg2Pos, up ,forward,minIndex);

			this.robotState[robotIndex].leg1Pos=state[0].clone();
			this.robotState[robotIndex].leg2Pos=state[1].clone();
			this.robotState[robotIndex].up=state[2].clone();
			this.robotState[robotIndex].forward=state[3].clone();
			succeeded=state[4];

			if(succeeded)
			{
				return [state[0],state[1],state[2],state[3]];

			}else
			{
				// console.log("COULDN'T FIND PATH!!!");
				return false;
			}

		}else{
			return false;
		}
	}else{
		console.log("DONEE!!!");
		return false;
	}

}

Swarm.prototype.startMovementHierarchicalSDF= function(robotIndex,goHome){

	var wait=false;
	var robotSize=this.robotScale[robotIndex];
	var log=false;
	
	//if not home
	if(!goHome && !this.buildList.done){

        //////////////////////////check if task is pending/////////////////

		//if bigger size bill-e at pickup site and ready to delete in situ
		if(robotSize>1&&  this.voxelList[robotIndex].toDelete.robotIndex!=-1){
			// console.log(robotSize)
			// console.log(this.voxelList[robotIndex].toDelete.stockData)

			// console.log(this.startLocations[robotIndex].equals(this.startLocations[this.voxelList[robotIndex].toDelete.robotIndex]))
			if(this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]).equals(this.startLocations[robotIndex])&&this.startLocations[robotIndex].equals(this.startLocations[this.voxelList[robotIndex].toDelete.robotIndex])){
				var pickUp=this.voxelList[robotIndex].toDelete.robotIndex;

				if(this.voxelList[robotIndex].toDelete.stockData.length>1 ){
					//delete voxels from scene
					for (var j=0; j<this.voxelIndexList[2].list.length;j++){
						// var loc=this.voxelIndexList[2].list[j].clone()
						// 			.add(this.startLocations[pickUp].clone().multiplyScalar(1/this.voxelSpacing[pickUp]))
						//             .add(this.inSituAdjustment[pickUp]);
						var loc=this.voxelIndexList[2].list[j].clone()
									.add(this.startLocations[pickUp].clone().multiplyScalar(1/this.voxelSpacing[pickUp]))
									.add(this.inSituAdjustment[pickUp].clone().multiplyScalar(1/this.robotScale[pickUp]));

						this.grid[loc.x][loc.y][loc.z]=false;

						var name='['+loc.x+','+loc.y+','+loc.z+']';
						var obj=this.scene.getObjectByName(name);
						this.scene.remove(obj);

					}

					var indexZ=   this.voxelList[robotIndex].toDelete.stockData[0];
					var indexSize=this.voxelList[robotIndex].toDelete.stockData[1];
					var indexSDF= this.voxelList[robotIndex].toDelete.stockData[2];
					var indexCube=this.voxelList[robotIndex].toDelete.stockData[3];
					//flag that it is picked up
					this.buildList.listZ[indexZ].listSize[indexSize].listSDF[indexSDF].listCubes[indexCube].stockPickedUp=true;
					//make smaller billl-e not busy
					this.voxelList[pickUp].busy=false;
					this.startLocations[robotIndex]=this.depositLocations[robotIndex].clone();
					//remove fag that arrived to pickup
					this.voxelList[robotIndex].toDelete={stockData:[],robotIndex:-1};

					//now get task to build voxel
					this.buildList.listZ[indexZ].listSize[indexSize].listSDF[indexSDF].listCubes[indexCube].done=true;
					//todo make sure that works.. maybe final location is not the one
					this.voxelList[robotIndex].build.list.push({ position:this.buildList.listZ[indexZ].listSize[indexSize].listSDF[indexSDF].listCubes[indexCube].position.clone(),
						stockBuilt:true});

				}else{
					
					var indexBiggerRobot=this.voxelList[robotIndex].toDelete.stockData[0];
					if(indexBiggerRobot==robotIndex){
						//delete voxels from scene
						for (var j=0; j<this.voxelIndexList[2].list.length;j++){
							// var loc=this.voxelIndexList[2].list[j].clone()
							// 			.add(this.startLocations[pickUp].clone().multiplyScalar(1/this.voxelSpacing[pickUp]))
							//             .add(this.inSituAdjustment[pickUp]);
							var loc=this.voxelIndexList[2].list[j].clone()
										.add(this.startLocations[pickUp].clone().multiplyScalar(1/this.voxelSpacing[pickUp]))
										.add(this.inSituAdjustment[pickUp].clone().multiplyScalar(1/this.robotScale[pickUp]));

							this.grid[loc.x][loc.y][loc.z]=false;

							var name='['+loc.x+','+loc.y+','+loc.z+']';
							var obj=this.scene.getObjectByName(name);
						

							this.scene.remove(obj);

						}

						indexBiggerRobot=robotIndex;
						var taskGiven=false;
						for(var i=0;i<this.voxelList[indexBiggerRobot].build.list.length;i++){
							if(!this.voxelList[indexBiggerRobot].build.list[i].stockBuilt && !taskGiven){
								// console.log(i)
								// console.log(indexBiggerRobot)

								taskGiven=true;
								//make smaller bill-e not busy
								this.voxelList[pickUp].busy=false;
								this.startLocations[robotIndex]=this.depositLocations[robotIndex].clone();
								//remove fag that arrived to pickup
								this.voxelList[robotIndex].toDelete={stockData:[],robotIndex:-1};

								this.voxelList[indexBiggerRobot].build.list[i].stockBuilt=true;

								//todo make sure that works.. maybe final location is not the one
								// this.voxelList[robotIndex].build.list.push({ position:this.voxelList[indexBiggerRobot].build.list[i].position.clone(),
								//     stockBuilt:true});


							}

						}
						if(!taskGiven){
							// if(log) 
							if(log) console.log("dcvszv"+robotIndex)

							wait=true;
						}

					}
				}

			}
			
		}

		
		
		//if smaller size bill-e finished building in situ construction and flag available for pickup
		//if voxelList has the flag
		if(this.voxelList[robotIndex].build.stockData.length>0 &&this.voxelList[robotIndex].build.list.length==0){
            if(this.voxelList[robotIndex].build.stockData.length>1){
                var indexZ=this.voxelList[robotIndex].build.stockData[0];
                var indexSize=this.voxelList[robotIndex].build.stockData[1];
                var indexSDF=this.voxelList[robotIndex].build.stockData[2];
                var indexCube=this.voxelList[robotIndex].build.stockData[3];

                this.buildList.listZ[indexZ].listSize[indexSize].listSDF[indexSDF].listCubes[indexCube].stockBuilt=true;

                this.voxelList[robotIndex].build.stockData=[];
                var found=false;
                for(var i=0;i<this.buildList.availablePickup[robotSize*2].length;i++){ //change available pickup from busy to done
                    if(this.buildList.availablePickup[robotSize*2][i]==-1 && !found){
                        this.buildList.availablePickup[robotSize*2][i]={stockData:[indexZ,indexSize,indexSDF,indexCube],robotIndex:robotIndex};
                        found=true;
                    }
                }
                if(log) console.log("dvsv"+robotIndex)

                // wait=true;

            }else{
                var indexBiggerRobot=this.voxelList[robotIndex].build.stockData[0];
                this.voxelList[robotIndex].build.stockData=[];

                var found=false;
                for(var i=0;i<this.buildList.availablePickup[robotSize*2].length;i++){ //change available pickup from busy to done
                    if(this.buildList.availablePickup[robotSize*2][i]==-1 && !found){
                        this.buildList.availablePickup[robotSize*2][i]={stockData:[indexBiggerRobot],robotIndex:robotIndex};
                        found=true;
                    }
                }
                if(log) console.log("xczzc"+robotIndex)

                // wait=true;

            }
			
        }
        
        //if stock needed to be built for intermediate bill-es
        if(!wait && this.voxelList[robotIndex].build.list.length==0 &&this.buildList.listToBuild[robotSize].length>0&&!this.voxelList[robotIndex].busy&&!this.voxelList[robotIndex].busyGoingHome){
            //build in situ
            //hardcoded 2 as it will always be building 8 voxels regardless of the size
            var stockBuilt=false;
            if(robotSize==1){
                stockBuilt=true;
            }
            for (var j=0; j<this.voxelIndexList[2].list.length;j++){
                // this.voxelList[robotIndex].build.list.push({
                //     position:this.voxelIndexList[2].list[j].clone()
                //         .add(this.startLocations[robotIndex].clone().multiplyScalar(1/this.voxelSpacing[robotIndex]))
                //         .add(this.inSituAdjustment[robotIndex]),
                //         stockBuilt:stockBuilt
                // });
                this.voxelList[robotIndex].build.list.push({
                    position:this.voxelIndexList[2].list[j].clone().add(new THREE.Vector3(0,0,-1)).multiplyScalar(robotSize).add(new THREE.Vector3(0,0,1))
                        .add(this.startLocations[robotIndex].clone().multiplyScalar(1/this.voxelSpacing[robotIndex]*robotSize))
                        .add(this.inSituAdjustment[robotIndex].clone().multiplyScalar(1)),
                        stockBuilt:stockBuilt
                });
            }
            this.buildList.availablePickup[robotSize*2].push(-1); //for bigger robot to wait and not go home
			this.voxelList[robotIndex].build.stockData=[this.buildList.listToBuild[robotSize][0]];//push index at the end to flag when it's done
			// console.log(this.buildList.listToBuild[robotSize][0])
			this.voxelList[robotIndex].busy=true;

            this.buildList.listToBuild[robotSize].shift();

        }

        ////////////////check for new tasks//////////////////////////////////////
		//if have no assigned voxels try to assign 
		if( !wait && this.voxelList[robotIndex].build.list.length==0&& !this.voxelList[robotIndex].busy&&!this.voxelList[robotIndex].busyGoingHome&& !this.buildList.done){
			//find current bin
			var binZ=this.buildList.listZ[this.buildList.currentZIndex];
			var binSize=binZ.listSize[binZ.currentSizeIndex];
			var binSDF=binSize.listSDF[binSize.currentSDFIndex];
			
			var indexZ=this.buildList.currentZIndex;
			var indexSize=binZ.currentSizeIndex;
			var indexSDF=binSize.currentSDFIndex;

			var maxIndexZ=this.buildList.maxZIndex;
			var maxIndexSize=binZ.maxSizeIndex;
			var maxIndexSDF=binSize.maxSDFIndex;

			// if robot size smaller than target bin size
			if(robotSize<binSDF.size){
				if(robotSize==binSDF.size/2){
					var gotTask=false;
					for(var i=0;i<binSDF.listCubes.length;i++){
						if(!binSDF.listCubes[i].done&&!binSDF.listCubes[i].stockAssigned &&!gotTask){
							gotTask=true;
							binSDF.listCubes[i].stockAssigned=true;
							this.buildList.listZ[indexZ].listSize[indexSize].listSDF[indexSDF].listCubes[i].stockAssigned=true;
                            //build in situ
                            //hardcoded 2 as it will always be building 8 voxels regardless of the size
                            var stockBuilt=false;
                            if(robotSize==1){
                                stockBuilt=true;
                            }

                            for (var j=0; j<this.voxelIndexList[2].list.length;j++){
								this.voxelList[robotIndex].build.list.push({
                                    position:this.voxelIndexList[2].list[j].clone().add(new THREE.Vector3(0,0,-1)).multiplyScalar(robotSize).add(new THREE.Vector3(0,0,1))
                                        .add(this.startLocations[robotIndex].clone().multiplyScalar(1/this.voxelSpacing[robotIndex]*robotSize))
                                        .add(this.inSituAdjustment[robotIndex].clone().multiplyScalar(1)),
                                        stockBuilt:stockBuilt
                                });
                            }
                            
							this.buildList.availablePickup[binSDF.size].push(-1); //for bigger robot to wait and not go home
							this.voxelList[robotIndex].build.stockData=[indexZ,indexSize,indexSDF,i];//push index at the end to flag when it's done
							this.voxelList[robotIndex].busy=true;

                            //if not size 1 go back later as no stock available
                            // flag for smaller robots to build stocks
                            if(robotSize>1){
                                //add them in list to build
                                if(log) console.log("vdsvs"+robotIndex)

                                wait=true;
                                for(var i=0;i<8;i++){
                                    this.buildList.listToBuild[robotSize/2.0].push(robotIndex); //no need to put robotIndex but why not
                                }
                            }
						}
					}
					if(!gotTask){
                        if(log) console.log("dssvd"+robotIndex)
						wait=true;
					}

				}else{
                    if(log) console.log("awfawf"+robotIndex)
					wait=true;
				}

			}else if(binSDF.size==robotSize){ //if same size
				var gotTask=false;
				var done=true;
				for(var i=0;i<binSDF.listCubes.length;i++){
					if(!binSDF.listCubes[i].done){
						done=false;
					}
					if(!binSDF.listCubes[i].done&&binSDF.listCubes[i].stockBuilt &&!gotTask){
						gotTask=true;
						binSDF.listCubes[i].done=true;
						this.buildList.listZ[indexZ].listSize[indexSize].listSDF[indexSDF].listCubes[i].done=true;
						this.voxelList[robotIndex].build.list.push({position:binSDF.listCubes[i].position.clone(),stockBuilt:true});
					}
				}
				if(!gotTask){
                    if(log) console.log("fefswv"+robotIndex)
					wait=true;
				}

				//update list
				if(done){
					binSDF.done=true;
					this.buildList.listZ[indexZ].listSize[indexSize].listSDF[indexSDF].done=true;
					binSize.currentSDFIndex++;
					console.log("Layer "+(maxIndexZ-indexZ)+", size "+(maxIndexSize-indexSize)+", sdf "+(maxIndexSDF-indexSDF)+" done!");
					if(binSize.currentSDFIndex>=binSize.maxSDFIndex){
						binSize.done=true;
						this.buildList.listZ[indexZ].listSize[indexSize].done=true;
						console.log("Layer "+(maxIndexZ-indexZ)+", size "+(maxIndexSize-indexSize)+" done!");
						binZ.currentSizeIndex++;
						if(binZ.currentSizeIndex>=binZ.maxSizeIndex){
							binZ.done=true;
							this.buildList.listZ[indexZ].done=true;
							console.log("Layer "+(maxIndexZ-indexZ)+" done!");
							this.buildList.currentZIndex++;
							if(this.buildList.currentZIndex>=this.buildList.maxZIndex){
								this.buildList.done=true;
								console.log("Simulation Done!!!!!!!!!!!!!!")
							}
						}
					}
				}
			}else{
                if(log) console.log("fdbddfbd"+robotIndex)
				wait=true; //later change for two sizes bigger
			}
        }
        
        //if has task but stock not ready
        if(this.voxelList[robotIndex].build.list.length> 0&& !this.voxelList[robotIndex].build.list[0].stockBuilt){
            if(log) console.log("bhhbj"+robotIndex)
            wait=true;
        }

        ///////////////////////////if there is task go on/////////////////
		//if have assigned voxel
		if(!wait && this.voxelList[robotIndex].build.list.length>0){
			this.resetPath(robotIndex);
			this.voxelBuilderHierarchicalSDF(
				robotIndex,this.robotState[robotIndex].leg1Pos, 
				this.robotState[robotIndex].leg2Pos, 
				this.robotState[robotIndex].up,
				this.robotState[robotIndex].forward,
				this.voxelList[robotIndex].build.list
			); 
			this.generatePoints(robotIndex);

			//if generated path
			if(this.steps[robotIndex].length>0){
				for(var i=0;i<this.steps[robotIndex].length;i++){
					this.step(robotIndex,i);
				}
				this.goHome[robotIndex]=true;
			}else{
                if(log) console.log("gbdfgd "+robotIndex)

				wait=true;
			}

		}else if(this.voxelList[robotIndex].build.list.length==0&&!wait){
			if(!this.buildList.done){
                // console.log("jbhb"+robotIndex)
				// this.goHome[robotIndex]=true;
				setTimeout(function(){ _startMovement(robotIndex,true); }, this.path[robotIndex].timeout+=(this.path[robotIndex].delay*this.waitTime));
            }
            // return;
		}

		if(this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]).equals(this.startLocations[robotIndex])){
			this.voxelList[robotIndex].busyGoingHome=false;
		}

		//if you have to wait we tigui bokra
		if(wait){
			setTimeout(function(){ _startMovement(robotIndex,true); }, this.path[robotIndex].timeout+=(this.path[robotIndex].delay*this.waitTime));
        }
		return;

    }else if(goHome){ //go home got get stock

        //////////////////////where to restock? (home or another smaller station)///////////
		var pickUp=-1;

		if(this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]).equals(this.startLocations[robotIndex])){
			this.voxelList[robotIndex].busyGoingHome=false;
		}
		if(this.voxelList[robotIndex].busyGoingHome){
			console.log(this.robotState[robotIndex].leg1Pos.clone().multiplyScalar(this.voxelSpacing[robotIndex]));
			console.log(this.startLocations[robotIndex])
		}

		if(robotSize>1&&this.buildList.availablePickup[robotSize].length>0){
			if(this.buildList.availablePickup[robotSize][0]==-1){
                if(log) console.log("sscs"+robotIndex)
				wait=true;
				this.startLocations[robotIndex]=this.depositLocations[robotIndex].clone();
				this.voxelList[robotIndex].busyGoingHome=true;
			}else{
				var taskTaken=false;
				for(var i=0;i<this.buildList.availablePickup[robotSize].length;i++){
					if(!taskTaken&&this.buildList.availablePickup[robotSize][i]!=-1){
						pickUp=this.buildList.availablePickup[robotSize][i];
						if(pickUp.stockData.length==1){
							if(robotIndex==pickUp.stockData[0]){
								taskTaken=true;
								this.startLocations[robotIndex]=this.startLocations[this.buildList.availablePickup[robotSize][i].robotIndex].clone();
								this.buildList.availablePickup[robotSize]=this.buildList.availablePickup[robotSize].slice(0, i).concat(this.buildList.availablePickup[robotSize].slice(i + 1, this.buildList.availablePickup[robotSize].length));
								// this.buildList.availablePickup[robotSize].shift();
								this.voxelList[robotIndex].toDelete=pickUp;
							}
						}else{
							taskTaken=true;
							this.startLocations[robotIndex]=this.startLocations[this.buildList.availablePickup[robotSize][i].robotIndex].clone();
							this.buildList.availablePickup[robotSize]=this.buildList.availablePickup[robotSize].slice(0, i).concat(this.buildList.availablePickup[robotSize].slice(i + 1, this.buildList.availablePickup[robotSize].length));
							// this.buildList.availablePickup[robotSize].shift();
							this.voxelList[robotIndex].toDelete=pickUp;
						}
					}
				}
				
			}
		}else if(robotSize>1){ //no one is busy making smaller bill-es get out of the way
			this.startLocations[robotIndex]=this.depositLocations[robotIndex].clone();
		}
		// if(wait){
		// 	setTimeout(function(){ _startMovement(robotIndex,true); }, this.path[robotIndex].timeout+=(this.path[robotIndex].delay*10));
		// 	return;

		// }

		// if(!wait){
			this.resetPath(robotIndex);
			this.reloadVoxel(
				robotIndex,
				this.robotState[robotIndex].leg1Pos, 
				this.robotState[robotIndex].leg2Pos, 
				this.robotState[robotIndex].up,
				this.robotState[robotIndex].forward);
			this.generatePoints(robotIndex);

			for(var i=0;i<this.steps[robotIndex].length;i++){
                
				this.step(robotIndex,i);
			}

			this.goHome[robotIndex]=false;

			if(this.steps[robotIndex].length==0){
                
				// console.log("nn st")
				this.startMovement(robotIndex,false);
			}


		// }else{
		// 	// console.log("here")

		// 	setTimeout(function(){ _startMovement(robotIndex,false); }, this.path[robotIndex].timeout+=(this.path[robotIndex].delay*10));
		// }

		return;

	}else{
		console.log("Great job, simulation done!!")
		return;
	}

	console.log("shouldn't be here");
}
