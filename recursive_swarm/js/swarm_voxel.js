// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

//////////////////////////load Voxels////////////////////////////
Swarm.prototype.loadVoxel= function(robotIndex){
    var robotSize=this.robotScale[robotIndex];

	if(this.robotScale[robotIndex]===undefined ||this.robotScale[robotIndex]==1){
		this.voxel.push(this.singleVoxel.clone());
	}else if(this.robotScale[robotIndex]==2){
		var group = new THREE.Group();
		for (var j=0; j<this.voxelIndexList[robotSize].list.length;j++){
			var object1=this.singleVoxel.clone();
			object1.position.x=this.voxelIndexList[robotSize].list[j].x*this.spacing;
			object1.position.y=(this.voxelIndexList[robotSize].list[j].y)*this.spacing;
			object1.position.z=(this.voxelIndexList[robotSize].list[j].z-2)*this.spacing;
			group.add(object1);
		}
		this.voxel.push(group);
	}else if(this.robotScale[robotIndex]==4){
		var group = new THREE.Group();
		for (var j=0; j<this.voxelIndexList[robotSize].list.length;j++){
			var object1=this.singleVoxel.clone();
			object1.position.x=this.voxelIndexList[robotSize].list[j].x*this.spacing;
			object1.position.y=(this.voxelIndexList[robotSize].list[j].y)*this.spacing;
			object1.position.z=(this.voxelIndexList[robotSize].list[j].z-4)*this.spacing;
			group.add(object1);
		}
		this.voxel.push(group);
	}
	
};

Swarm.prototype.loadSingleVoxel= function(){
	
	var geometry = new THREE.BufferGeometry();
	// create a simple square shape. We duplicate the top left and bottom right
	// vertices because each vertex needs to appear once per triangle.
	var vertices = voxelData;
	var normals = voxelNormalData;
	var uv = voxelUVData;

	// itemSize = 3 because there are 3 values (components) per vertex
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'normal', new THREE.BufferAttribute( normals, 3 ) );
    geometry.addAttribute( 'uv', new THREE.BufferAttribute( uv, 2 ) );
    
    if(this.reducedViz){
        geometry=new THREE.BoxGeometry(this.spacing, this.spacing, this.spacing);
        
    }

	// var material = new THREE.MeshLambertMaterial( { color: 0xbbc3ce } );
	var material = new THREE.MeshBasicMaterial( { color: new THREE.Color(0,0,0) } );

	
	var object = new THREE.Mesh( geometry, material );
	// object.scale.x=0.04;
	// object.scale.y=0.04;
	// object.scale.z=0.04;
    // object.position.z=-1.5;
    if(!this.reducedViz){
        object.scale.x=0.5;
        object.scale.y=0.5;
        object.scale.z=0.5;
        object.position.x=-15;
        object.position.y=-15;

    }
	
    
	this.singleVoxel=(object);
	
};

Swarm.prototype.buildGrid= function(){
	//this.build this.grid
	for(var i=0;i<this.gridSize;i++){
		var t=[];
		this.grid.push(t)
		for(var j=0;j<this.gridSize;j++)
		{
			var tt=[];
			this.grid[i].push(tt);
			for(var k=0;k<this.gridSize;k++)
			{
				this.grid[i][j].push(false);
			}	
		}
	}
	//this.build first layer
	for(var i=0;i<this.gridSize;i++)
	{
		for(var j=0;j<this.gridSize;j++)
		{
			this.buildSingleVoxelAt(new THREE.Vector3(i*this.spacing,j*this.spacing,0));
			this.grid[i][j][0]=true;	
		}
	}

	// for(var i=8;i<this.gridSize-8;i++)
	// {
	// 	for(var j=8;j<this.gridSize-8;j++)
	// 	{
	// 		for(var k=1;k<this.gridSize-16;k++)
	// 		{	
	// 			this.buildSingleVoxelAt1(new THREE.Vector3(i*this.spacing,j*this.spacing,k*this.spacing));
	// 		}	
	// 	}
	// }


	
	
};

Swarm.prototype.frepCube= function(){
	// string function= "Math.min(Math.min(Math.min(Math.min(X-(-1),(1)-X),Math.min(Y-(-1),(1)-Y)),Math.min(Z-(-1),(1)-Z)),-(Math.min(Math.min(Math.min(X-(-0.8),(0.8)-X),Math.min(Y-(-0.8),(0.8)-Y)),Math.min(Z-(-0.8),(0.8)-Z))))";
	var maxZslices=[];
	var tempVoxelSlices=[];
	for (var Z=0;Z<this.gridSize;Z++){
		this.voxelSlices.push([]);
		tempVoxelSlices.push([]);
		this.voxelSlicesCount.push([]);
		var max=- Infinity;
		var maxIndex=new THREE.Vector3(0,0,0);
		for (var Y=0;Y<this.gridSize;Y++)
		{
			for (var X=0;X<this.gridSize;X++)
			{
				var func= this.frep(X,Y,Z);

				if(func>=0 && !this.grid[X][Y][Z])
				{
					if(func>max)
					{
						max=func;
						maxIndex=new THREE.Vector3(X*this.spacing,Y*this.spacing, Z*this.spacing);

					}
					var loc=new THREE.Vector3(X*this.spacing,Y*this.spacing,Z*this.spacing);
					tempVoxelSlices[Z].push(loc);
					this.voxelNum++;
				}
			}
		}
		maxZslices.push(maxIndex);//check if right later
	}

	for (var Z=0;Z<this.gridSize;Z++){
		
		for(var i=0;i<tempVoxelSlices[Z].length;i++)
		{
			var rank = Math.ceil(maxZslices[Z].distanceTo(tempVoxelSlices[Z][i]) /this.spacing);
			while(this.voxelSlices[Z].length<=rank)
			{
				this.voxelSlicesCount[Z].push([]);

				this.voxelSlices[Z].push([]);

				this.voxelSlicesCount[Z][this.voxelSlices[Z].length-1]=0;

				this.voxelSlices[Z][this.voxelSlices[Z].length-1]=[];
			}
			this.voxelSlices[Z][rank].push(tempVoxelSlices[Z][i]);
		}
	}
	//////////
	// for(var i=0; i<this.numberOfRobots;i++)
	// {
	// 	this.buildHelperMeshes(i);
	// }
	
};

Swarm.prototype.frep= function(X,Y,Z){
	// return (3*3-((X-(5))*(X-(5))+(Y-(5))*(Y-(5))+(Z-(3))*(Z-(3)))); //sphere FIX!!
	// return Math.min(Math.min(Math.min(Math.min(X-(2),(7)-X),Math.min(Y-(2),(7)-Y)),Math.min(Z-(1),(5)-Z)),-(Math.min(Math.min(Math.min(X-(4),(8)-X),Math.min(Y-(4),(8)-Y)),Math.min(Z-(0),(4)-Z))));
	// return Math.min(Math.min(Math.min(Math.min(X-(2),(5)-X),Math.min(Y-(2),(5)-Y)),Math.min(Z-(1),(5)-Z)),-(Math.min(Math.min(Math.min(X-(3),(6)-X),Math.min(Y-(3),(6)-Y)),Math.min(Z-(0),(4)-Z))));
	// return Math.min(Math.min(Math.min(Math.min(X-(2),(7)-X),Math.min(Y-(2),(7)-Y)),Math.min(Z-(1),(6)-Z)),-(Math.min(Math.min(Math.min(X-(3),(6)-X),Math.min(Y-(3),(6)-Y)),Math.min(Z-(0),(7)-Z))));//empty cube
	// return Math.min(((6)-Z),(Math.min((Z-(1)),(((3*(5-(Z-(1)))/5)*(3*(5-(Z-(1)))/5)-((X-(5))*(X-(5))+(Y-(5))*(Y-(5))))))));//CONE
	return Math.min(Math.min(Math.min(X-(2),((this.gridSize-3))-X),Math.min(Y-(2),((this.gridSize-3))-Y)),Math.min(Z-(1),((this.gridSize-4))-Z)); //CUBE
};

Swarm.prototype.buildSingleVoxelAt= function(loc){
	var object1=this.singleVoxel.clone();
	object1.position.x=loc.x;
	object1.position.y=loc.y;
	object1.position.z=loc.z-this.spacing/2.0;

	var color1= new THREE.Color( 0.8, 0.8, 0.8 );//0.6
	var material  = new THREE.MeshPhysicalMaterial( { metalness: 0.00,reflectivity: 1.0,roughness: 0.5,color: new THREE.Color( 0.9, 0.9, 0.9 ) } );


	var material = new THREE.MeshLambertMaterial( { color: color1 } );

	// // var color = new THREE.Color( 1/this.globalRank, 0, 0 );
	
	object1.material=material.clone();
    object1.material.color=color1;
    
    if(this.reducedViz){
        object1.visible=false;
	}
	// object1.visible=false;
	


	this.scene.add( object1 );
};

Swarm.prototype.buildSingleVoxelAt1= function(loc){
	var object1=this.singleVoxel.clone();
	object1.position.x=loc.x;
	object1.position.y=loc.y;
	object1.position.z=loc.z-this.spacing/2.0;

	var color1= new THREE.Color( 0, 0, 0 );

	var material = new THREE.MeshLambertMaterial( { color: 0xbbc3ce } );

	// // var color = new THREE.Color( 1/this.globalRank, 0, 0 );
	
	object1.material=material.clone();
	object1.material.transparent=true;
	object1.material.opacity=0.4;
    // object1.material.color=color1;
    
    if(this.reducedViz){
        object1.visible=false;
    }


	this.scene.add( object1 );
};

Swarm.prototype.buildSingleVoxelAt2= function(loc){
	var object1=this.singleVoxel.clone();
	object1.position.x=loc.x;
	object1.position.y=loc.y;
	object1.position.z=loc.z-this.spacing/2.0;

	var color1= new THREE.Color( 0.7, 0.7, 0.7 );
	// var color1= new THREE.Color( 0.0, 0.0, 0.0 );
	var material = new THREE.MeshLambertMaterial( { color: color1 } );
	
	object1.material=material.clone();
    
    if(this.reducedViz){
        object1.visible=false;
    }

	this.scene.add( object1 );
};

Swarm.prototype.buildVoxelAt= function(robotIndex,loc){
	var object1=this.voxel[robotIndex].clone();
	object1.name='['+loc.x/this.spacing+','+loc.y/this.spacing+','+loc.z/this.spacing+']';

    object1.name='['+loc.x/this.voxelSpacing[robotIndex]+','+loc.y/this.voxelSpacing[robotIndex]+','+loc.z/this.voxelSpacing[robotIndex]+']';


	if(this.buildType=="recursion"){
		// console.log(this.voxelList[robotIndex].pickupList)
		object1=this.billeParts[this.voxelList[robotIndex].pickupList[0]].clone();
		object1.name='bille'+this.voxelList[robotIndex].pickupList[0];

	}
	object1.position.x=loc.x;
	object1.position.y=loc.y;
	object1.position.z=loc.z-this.spacing/2.0;
    

	// var color1= new THREE.Color( 1/this.globalRank, 0, 0 )

	// var material = new THREE.MeshLambertMaterial( { color: 0xbbc3ce } );

	// var color = new THREE.Color( 255, 0, 0 );
	
	// object1.material=material.clone();
	// object1.material.color=color;


	this.scene.add( object1 );
};

Swarm.prototype.deleteVoxelAt= function(robotIndex,loc){ //loc is index
	// var object1=this.voxel[robotIndex].clone();
	// object1.name='['+loc.x/this.spacing+','+loc.y/this.spacing+','+loc.z/this.spacing+']';

    var object1=this.scene.getObjectByName('['+loc.x+','+loc.y+','+loc.z+']');

	this.scene.remove( object1 );
	this.grid[loc.x][loc.y][loc.z]=false;

	

	
};

Swarm.prototype.createHierarchalSDFVoxelList=function(){
	this.voxelIndexList=[
        null,
        {
            size:1,
            list:[
                new THREE.Vector3(0,0,0),

            ]
        },
        {
            size:2,
            list:[
                new THREE.Vector3(0,0,1),
                new THREE.Vector3(0,1,1),
                new THREE.Vector3(1,0,1),
                new THREE.Vector3(1,1,1),
                new THREE.Vector3(0,0,2),
                new THREE.Vector3(0,1,2),
                new THREE.Vector3(1,0,2),
                new THREE.Vector3(1,1,2)
            ]

        },
        null,
        {
            size:4,
            list:[
                // new THREE.Vector3(0,0,1),
                // new THREE.Vector3(0,1,1),
                // new THREE.Vector3(0,2,1),
                // new THREE.Vector3(0,3,1),

                // new THREE.Vector3(1,0,1),
                // new THREE.Vector3(1,1,1),
                // new THREE.Vector3(1,2,1),
                // new THREE.Vector3(1,3,1),

                // new THREE.Vector3(2,0,1),
                // new THREE.Vector3(2,1,1),
                // new THREE.Vector3(2,2,1),
                // new THREE.Vector3(2,3,1),

                // new THREE.Vector3(3,0,1),
                // new THREE.Vector3(3,1,1),
                // new THREE.Vector3(3,2,1),
                // new THREE.Vector3(3,3,1),


                // new THREE.Vector3(0,0,2),
                // new THREE.Vector3(0,1,2),
                // new THREE.Vector3(0,2,2),
                // new THREE.Vector3(0,3,2),

                // new THREE.Vector3(1,0,2),
                // new THREE.Vector3(1,1,2),
                // new THREE.Vector3(1,2,2),
                // new THREE.Vector3(1,3,2),

                // new THREE.Vector3(2,0,2),
                // new THREE.Vector3(2,1,2),
                // new THREE.Vector3(2,2,2),
                // new THREE.Vector3(2,3,2),

                // new THREE.Vector3(3,0,2),
                // new THREE.Vector3(3,1,2),
                // new THREE.Vector3(3,2,2),
                // new THREE.Vector3(3,3,2),

                // new THREE.Vector3(0,0,3),
                // new THREE.Vector3(0,1,3),
                // new THREE.Vector3(0,2,3),
                // new THREE.Vector3(0,3,3),

                // new THREE.Vector3(1,0,3),
                // new THREE.Vector3(1,1,3),
                // new THREE.Vector3(1,2,3),
                // new THREE.Vector3(1,3,3),

                // new THREE.Vector3(2,0,3),
                // new THREE.Vector3(2,1,3),
                // new THREE.Vector3(2,2,3),
                // new THREE.Vector3(2,3,3),

                // new THREE.Vector3(3,0,3),
                // new THREE.Vector3(3,1,3),
                // new THREE.Vector3(3,2,3),
                // new THREE.Vector3(3,3,3),


                // new THREE.Vector3(0,0,4),
                // new THREE.Vector3(0,1,4),
                // new THREE.Vector3(0,2,4),
                // new THREE.Vector3(0,3,4),

                // new THREE.Vector3(1,0,4),
                // new THREE.Vector3(1,1,4),
                // new THREE.Vector3(1,2,4),
                // new THREE.Vector3(1,3,4),

                // new THREE.Vector3(2,0,4),
                // new THREE.Vector3(2,1,4),
                // new THREE.Vector3(2,2,4),
                // new THREE.Vector3(2,3,4),

                // new THREE.Vector3(3,0,4),
                // new THREE.Vector3(3,1,4),
                // new THREE.Vector3(3,2,4),
                // new THREE.Vector3(3,3,4),
                
            ]

        }

    ];

    for(var i=0;i<this.voxelIndexList[2].list.length;i++){
        for(var j=0;j<this.voxelIndexList[2].list.length;j++){
            this.voxelIndexList[4].list.push(
                    this.voxelIndexList[2].list[i].clone().add(new THREE.Vector3(0,0,-1)).multiplyScalar(2).add(this.voxelIndexList[2].list[j].clone())
                );
        }
    }

    this.buildList.availablePickup=[
        null,
        [],
        [],
        null,
        []
    ];
    this.buildList.listToBuild=[
        null,
        [],
        [],
        null,
        []
    ];
};

Swarm.prototype.createHierarchalVoxelList=function(){
	this.voxelIndexList=[
		new THREE.Vector3(0,0,1),
		new THREE.Vector3(0,1,1),
		new THREE.Vector3(1,0,1),
		new THREE.Vector3(1,1,1),
		new THREE.Vector3(0,0,2),
		new THREE.Vector3(0,1,2),
		new THREE.Vector3(1,0,2),
		new THREE.Vector3(1,1,2)
	];
	// this.voxelIndexList=[
	//     new THREE.Vector3(0,0,1),
    //     new THREE.Vector3(0,1,1),
    //     new THREE.Vector3(0,2,1),
    //     new THREE.Vector3(0,3,1),
    //     new THREE.Vector3(0,4,1),

    //     new THREE.Vector3(-1,0,1),
    //     new THREE.Vector3(-2,0,1),
    //     new THREE.Vector3(-3,0,1),

    //     new THREE.Vector3(1,0,1),
    //     new THREE.Vector3(2,0,1),
    //     new THREE.Vector3(3,0,1),

    //     new THREE.Vector3(-1,4,1),
    //     new THREE.Vector3(-2,4,1),
    //     new THREE.Vector3(-3,4,1),

    //     new THREE.Vector3(1,4,0),
    //     new THREE.Vector3(2,4,0),
	// 	new THREE.Vector3(3,4,0)
	// ];
	i=0;
	this.voxelList.push({rank:this.robotScale[i],list:[],originalList:[],assembled:false,pickedUp:false})
	for (var j=0; j<this.voxelIndexList.length;j++){
		this.voxelList[i].list.push(
			this.voxelIndexList[j].clone()
			.add(this.startLocations[i].clone().multiplyScalar(1/this.voxelSpacing[i]))
			.add(new THREE.Vector3(-2,-2,0))
		);
		this.voxelList[i].originalList.push(this.voxelList[i].list[j].clone());
	}
	i=1;
	this.voxelList.push({rank:this.robotScale[i],list:[],originalList:[],assembled:false,pickedUp:false})
	for (var j=0; j<this.voxelIndexList.length;j++){
		this.voxelList[i].list.push(
			this.voxelIndexList[j].clone()
			.add(this.startLocations[i].clone().multiplyScalar(1/this.voxelSpacing[i]))
			.add(new THREE.Vector3(-2,2,0))
		);
		this.voxelList[i].originalList.push(this.voxelList[i].list[j].clone());
	}
	i=2;
	this.voxelList.push({rank:this.robotScale[i],list:[],originalList:[],assembled:false,pickedUp:false})
	for (var j=0; j<this.voxelIndexList.length;j++){
		this.voxelList[i].list.push(
			this.voxelIndexList[j].clone()
			.add(this.startLocations[i].clone().multiplyScalar(1/this.voxelSpacing[i]))
			.add(new THREE.Vector3(2,-2,0))
		);
		this.voxelList[i].originalList.push(this.voxelList[i].list[j].clone());
	}
	// i=3;
	// this.voxelList.push({rank:this.robotScale[i],list:[],originalList:[],assembled:false,pickedUp:false})
	// for (var j=0; j<this.voxelIndexList.length;j++){
	// 	this.voxelList[i].list.push(
	// 		this.voxelIndexList[j].clone()
	// 		.add(this.startLocations[i].clone().multiplyScalar(1/this.voxelSpacing[i]))
	// 		.add(new THREE.Vector3(2,2,0))
	// 	);
	// 	this.voxelList[i].originalList.push(this.voxelList[i].list[j].clone());
	// }
	// this.voxelIndexList1=[
	// 	new THREE.Vector3(0,0,1),
	// 	new THREE.Vector3(0,1,1),

	// 	new THREE.Vector3(1,0,1),
	// 	new THREE.Vector3(1,1,1),

	// 	new THREE.Vector3(0,0,2),
	// 	new THREE.Vector3(0,1,2),

	// 	new THREE.Vector3(1,0,2),
	// 	new THREE.Vector3(1,1,2),

	// 	new THREE.Vector3(2,1,1),
	// 	new THREE.Vector3(2,0,1),

	// 	new THREE.Vector3(2,1,2),
	// 	new THREE.Vector3(2,0,2),

	// 	new THREE.Vector3(1,1,3),
	// 	new THREE.Vector3(1,0,3),

	// 	new THREE.Vector3(1,2,1),
	// 	new THREE.Vector3(1,-1,1),

	// 	new THREE.Vector3(3,1,1),
	// 	new THREE.Vector3(-1,1,1),

	// 	new THREE.Vector3( 3,0,1),
	// 	new THREE.Vector3(-1,0,1),

	// 	// new THREE.Vector3(0,2,1),
	// 	// new THREE.Vector3(2,2,1),

	// 	// new THREE.Vector3(0,-1,1),
	// 	// new THREE.Vector3(2,-1,1),

	// 	// new THREE.Vector3(1,3,1),
	// 	// new THREE.Vector3(1,-2,1),
		
		
	// ];
	// i=4;
	// this.voxelList.push({rank:this.robotScale[i],list:[],assembled:false,pickedUp:false,pickupList:[]})
	// for (var j=0; j<this.voxelIndexList1.length;j++){
	// 	var loc=new THREE.Vector3(5,5,0);
	// 	this.voxelList[i].list.push(
	// 		this.voxelIndexList1[j].clone()
	// 		.add(loc)
	// 		.add(new THREE.Vector3(0,0,0))
	// 	);

	// }

	this.voxelIndexList=[
        null,
        {
            size:1,
            list:[
                new THREE.Vector3(0,0,0),

            ]
        },
        {
            size:2,
            list:[
                new THREE.Vector3(0,0,1),
                new THREE.Vector3(0,1,1),
                new THREE.Vector3(1,0,1),
                new THREE.Vector3(1,1,1),
                new THREE.Vector3(0,0,2),
                new THREE.Vector3(0,1,2),
                new THREE.Vector3(1,0,2),
                new THREE.Vector3(1,1,2)
            ]

        },
        null,
        {
            size:4,
            list:[
                // new THREE.Vector3(0,0,1),
                // new THREE.Vector3(0,1,1),
                // new THREE.Vector3(0,2,1),
                // new THREE.Vector3(0,3,1),

                // new THREE.Vector3(1,0,1),
                // new THREE.Vector3(1,1,1),
                // new THREE.Vector3(1,2,1),
                // new THREE.Vector3(1,3,1),

                // new THREE.Vector3(2,0,1),
                // new THREE.Vector3(2,1,1),
                // new THREE.Vector3(2,2,1),
                // new THREE.Vector3(2,3,1),

                // new THREE.Vector3(3,0,1),
                // new THREE.Vector3(3,1,1),
                // new THREE.Vector3(3,2,1),
                // new THREE.Vector3(3,3,1),


                // new THREE.Vector3(0,0,2),
                // new THREE.Vector3(0,1,2),
                // new THREE.Vector3(0,2,2),
                // new THREE.Vector3(0,3,2),

                // new THREE.Vector3(1,0,2),
                // new THREE.Vector3(1,1,2),
                // new THREE.Vector3(1,2,2),
                // new THREE.Vector3(1,3,2),

                // new THREE.Vector3(2,0,2),
                // new THREE.Vector3(2,1,2),
                // new THREE.Vector3(2,2,2),
                // new THREE.Vector3(2,3,2),

                // new THREE.Vector3(3,0,2),
                // new THREE.Vector3(3,1,2),
                // new THREE.Vector3(3,2,2),
                // new THREE.Vector3(3,3,2),

                // new THREE.Vector3(0,0,3),
                // new THREE.Vector3(0,1,3),
                // new THREE.Vector3(0,2,3),
                // new THREE.Vector3(0,3,3),

                // new THREE.Vector3(1,0,3),
                // new THREE.Vector3(1,1,3),
                // new THREE.Vector3(1,2,3),
                // new THREE.Vector3(1,3,3),

                // new THREE.Vector3(2,0,3),
                // new THREE.Vector3(2,1,3),
                // new THREE.Vector3(2,2,3),
                // new THREE.Vector3(2,3,3),

                // new THREE.Vector3(3,0,3),
                // new THREE.Vector3(3,1,3),
                // new THREE.Vector3(3,2,3),
                // new THREE.Vector3(3,3,3),


                // new THREE.Vector3(0,0,4),
                // new THREE.Vector3(0,1,4),
                // new THREE.Vector3(0,2,4),
                // new THREE.Vector3(0,3,4),

                // new THREE.Vector3(1,0,4),
                // new THREE.Vector3(1,1,4),
                // new THREE.Vector3(1,2,4),
                // new THREE.Vector3(1,3,4),

                // new THREE.Vector3(2,0,4),
                // new THREE.Vector3(2,1,4),
                // new THREE.Vector3(2,2,4),
                // new THREE.Vector3(2,3,4),

                // new THREE.Vector3(3,0,4),
                // new THREE.Vector3(3,1,4),
                // new THREE.Vector3(3,2,4),
                // new THREE.Vector3(3,3,4),
                
            ]

        }

    ];

    for(var i=0;i<this.voxelIndexList[2].list.length;i++){
        for(var j=0;j<this.voxelIndexList[2].list.length;j++){
            this.voxelIndexList[4].list.push(
                    this.voxelIndexList[2].list[i].clone().add(new THREE.Vector3(0,0,-1)).multiplyScalar(2).add(this.voxelIndexList[2].list[j].clone())
                );
        }
	}
	console.log(this.voxelList)
	


};

Swarm.prototype.createRecursionVoxelList=function(){
	// this.voxelIndexList=[
	// 	new THREE.Vector3(0,0,1),
	// 	new THREE.Vector3(0,1,1),
	// 	new THREE.Vector3(1,0,1),
	// 	new THREE.Vector3(1,1,1),
	// 	new THREE.Vector3(0,0,2),
	// 	new THREE.Vector3(0,1,2),
	// 	new THREE.Vector3(1,0,2),
	// 	new THREE.Vector3(1,1,2)
	// ];

	this.voxelIndexList=[
		new THREE.Vector3(7,0,1),

		new THREE.Vector3(6,0,1),
		new THREE.Vector3(6,0,2),
		new THREE.Vector3(6,1,2),
		new THREE.Vector3(6,2,2),

		new THREE.Vector3(5,3,1),
		new THREE.Vector3(5,3,2),
		new THREE.Vector3(5,2,2),
		new THREE.Vector3(5,1,2),
	];

	this.voxelIndexList=[
		new THREE.Vector3(5,2,1),

		new THREE.Vector3(5,1,1),
		new THREE.Vector3(5,1,2),
		new THREE.Vector3(6,1,2),
		new THREE.Vector3(7,1,2),

		new THREE.Vector3(8,0,1),
		new THREE.Vector3(8,0,2),
		new THREE.Vector3(7,0,2),
		new THREE.Vector3(6,0,2),
	];

	
	var pickupList=[
		0,
		0,

		1,
		2,
		3,
		4,

		5,
		6,
		7,
		8,
	];

	i=0;
	var scafoldList=[
		new THREE.Vector3(6,1,1),
		new THREE.Vector3(6,2,1),
		new THREE.Vector3(5,1,1),
		new THREE.Vector3(5,2,1),
	];

	var scafoldList=[
		new THREE.Vector3(5,1,1),
		new THREE.Vector3(6,1,1),
		new THREE.Vector3(5,0,1),
		new THREE.Vector3(6,0,1),
	];

	

	this.voxelList.push({rank:this.robotScale[i],list:[],originalList:[],pickupList:[],assembled:false,pickedUp:false})
	for (var j=0; j<this.voxelIndexList.length;j++){
		this.voxelList[i].list.push(
			this.voxelIndexList[j].clone()
			.add(this.startLocations[i].clone().multiplyScalar(1/this.voxelSpacing[i]))
			.add(new THREE.Vector3(0,0,0))
		);
		this.voxelList[i].originalList.push(this.voxelList[i].list[j].clone());
	}
	this.voxelList[i].pickupList=pickupList.slice();
	for (var j=0; j<scafoldList.length;j++){
		var x=scafoldList[j].x+this.startLocations[i].x/this.voxelSpacing[i];
		var y=scafoldList[j].y+this.startLocations[i].y/this.voxelSpacing[i];
		var z=scafoldList[j].z+this.startLocations[i].z/this.voxelSpacing[i];
		this.buildSingleVoxelAt(new THREE.Vector3(x*this.spacing,y*this.spacing,z*this.spacing));
		this.grid[x][y][z]=true;
	}
	
	this.voxelIndexList=[
        null,
        {
            size:1,
            list:[
                new THREE.Vector3(0,0,0),

            ]
        },
        {
            size:2,
            list:[
                new THREE.Vector3(0,0,1),
                new THREE.Vector3(0,1,1),
                new THREE.Vector3(1,0,1),
                new THREE.Vector3(1,1,1),
                new THREE.Vector3(0,0,2),
                new THREE.Vector3(0,1,2),
                new THREE.Vector3(1,0,2),
                new THREE.Vector3(1,1,2)
            ]

        },
        null,
        {
            size:4,
            list:[
                
            ]

        }

    ];

    for(var i=0;i<this.voxelIndexList[2].list.length;i++){
        for(var j=0;j<this.voxelIndexList[2].list.length;j++){
            this.voxelIndexList[4].list.push(
                    this.voxelIndexList[2].list[i].clone().add(new THREE.Vector3(0,0,-1)).multiplyScalar(2).add(this.voxelIndexList[2].list[j].clone())
                );
        }
	}
	console.log(this.voxelList)


};

//////////////////////////utilities////////////////////////////
Swarm.prototype.ClosestPointOnLine= function(s ,d ,vPoint ){
	var tempvPoint=new THREE.Vector3(0,0,0);
	tempvPoint.copy(vPoint);
	var tempD=new THREE.Vector3(0,0,0);
	tempD.copy(d);
	var temps=new THREE.Vector3(0,0,0);
	temps.copy(d);


	var vVector1 = tempvPoint.sub(temps) ;
	
	var vVector2 = tempD.normalize();

	var t = vVector2.dot( vVector1);

	if (t <= 0)
	{
		return s;
	}
	
	var vVector3 = vVector2.multiplyScalar(t) ;

	var vClosestPoint = temps.add(vVector3);

	return vClosestPoint;
};

Swarm.prototype.buildHelperMeshes= function(robotIndex){
	var material = new THREE.MeshLambertMaterial({ color:0xff7171,});
	var geometry = new THREE.SphereGeometry(0.5, 0.5, 0.5);
	this.targetPositionMesh[robotIndex] = new THREE.Mesh(geometry, material);
	this.scene.add(this.targetPositionMesh[robotIndex]);

	for (var count=0; count<this.numberOfStartLocations;count++)
	{
		if(this.startLocations[count]!=-1){
			geometry = new THREE.BoxGeometry(this.spacing, this.spacing, this.spacing);
			mesh = new THREE.Mesh(geometry, material);
			mesh.position.x=this.startLocations[count].x;
			mesh.position.y=this.startLocations[count].y;
			mesh.position.z=this.startLocations[count].z-this.spacing/2.0;
			this.scene.add(mesh);

		}
		
	}

	// var material = new THREE.MeshLambertMaterial({ color:0xff7171});
	// material.wireframe=true;

	// count=0
	// geometry = new THREE.BoxGeometry(this.spacing*2, this.spacing*6, this.spacing*6);
	// mesh = new THREE.Mesh(geometry, material);
	// mesh.position.x=this.startLocations[count].x+1*this.spacing;
	// mesh.position.y=this.startLocations[count].y+2*this.spacing;
	// mesh.position.z=this.startLocations[count].z+3*this.spacing;
	// var box = new THREE.BoxHelper( mesh, 0xff7171 );
	// this.scene.add(box);

	// count=1
	// geometry = new THREE.BoxGeometry(this.spacing*2, this.spacing*6, this.spacing*6);
	// mesh = new THREE.Mesh(geometry, material);
	// mesh.position.x=this.startLocations[count].x+1*this.spacing;
	// mesh.position.y=this.startLocations[count].y-2*this.spacing;
	// mesh.position.z=this.startLocations[count].z+3*this.spacing;
	// var box = new THREE.BoxHelper( mesh, 0xff7171 );
	// this.scene.add(box);

	// count=2
	// geometry = new THREE.BoxGeometry(this.spacing*2, this.spacing*6, this.spacing*6);
	// mesh = new THREE.Mesh(geometry, material);
	// mesh.position.x=this.startLocations[count].x-1*this.spacing;
	// mesh.position.y=this.startLocations[count].y+2*this.spacing;
	// mesh.position.z=this.startLocations[count].z+3*this.spacing;
	// var box = new THREE.BoxHelper( mesh, 0xff7171 );
	// this.scene.add(box);

	// count=3
	// geometry = new THREE.BoxGeometry(this.spacing*2, this.spacing*6, this.spacing*6);
	// mesh = new THREE.Mesh(geometry, material);
	// mesh.position.x=this.startLocations[count].x-1*this.spacing;
	// mesh.position.y=this.startLocations[count].y-2*this.spacing;
	// mesh.position.z=this.startLocations[count].z+3*this.spacing;
	// var box = new THREE.BoxHelper( mesh, 0xff7171 );
	// this.scene.add(box);

	// count=4
	// geometry = new THREE.BoxGeometry(this.spacing*3, this.spacing*6, this.spacing*6);
	// mesh = new THREE.Mesh(geometry, material);
	// mesh.position.x=this.startLocations[count].x-3.5*this.spacing;
	// mesh.position.y=this.startLocations[count].y-2*this.spacing;
	// mesh.position.z=this.startLocations[count].z+3*this.spacing;
	// var box = new THREE.BoxHelper( mesh, 0xff7171 );
	// this.scene.add(box);

	// count=5
	// geometry = new THREE.BoxGeometry(this.spacing*2, this.spacing*6, this.spacing*6);
	// mesh = new THREE.Mesh(geometry, material);
	// mesh.position.x=this.startLocations[count].x-1*this.spacing;
	// mesh.position.y=this.startLocations[count].y-2*this.spacing;
	// mesh.position.z=this.startLocations[count].z+3*this.spacing;
	// var box = new THREE.BoxHelper( mesh, 0xff7171 );
	// this.scene.add(box);

	// count=6
	// geometry = new THREE.BoxGeometry(this.spacing*3, this.spacing*6, this.spacing*6);
	// mesh = new THREE.Mesh(geometry, material);
	// mesh.position.x=this.startLocations[count].x-0.5*this.spacing;
	// mesh.position.y=this.startLocations[count].y+2*this.spacing;
	// mesh.position.z=this.startLocations[count].z+3*this.spacing;
	// var box = new THREE.BoxHelper( mesh, 0xff7171 );
	// this.scene.add(box);

	// count=7
	// geometry = new THREE.BoxGeometry(this.spacing*3, this.spacing*6, this.spacing*6);
	// mesh = new THREE.Mesh(geometry, material);
	// mesh.position.x=this.startLocations[count].x-0.5*this.spacing;
	// mesh.position.y=this.startLocations[count].y+2*this.spacing;
	// mesh.position.z=this.startLocations[count].z+3*this.spacing;
	// var box = new THREE.BoxHelper( mesh, 0xff7171 );
	// this.scene.add(box);
		

};

Swarm.prototype.showTargetPosition= function(robotIndex,targetPos,show){
	if(show){
		this.targetPositionMesh[robotIndex].position.x=targetPos.x;
		this.targetPositionMesh[robotIndex].position.y=targetPos.y;
		this.targetPositionMesh[robotIndex].position.z=targetPos.z;
		this.carriedVoxel[robotIndex][1].visible=true;
		this.targetPositionMesh[robotIndex].visible=true;
		
	}else{
		this.carriedVoxel[robotIndex][0].visible=false;
		this.carriedVoxel[robotIndex][1].visible=false;
		this.targetPositionMesh[robotIndex].visible=false;
	}
};


///////////////////bille///////////////
Swarm.prototype.loadBilleRecursion= function(fileName){
	function meshToThreejs(mesh, material) {
		var loader = new THREE.BufferGeometryLoader();
		var geometry = loader.parse(mesh.toThreejsJSON());
		return new THREE.Mesh(geometry, material);
    }
    
    var fetchPromise = fetch(fileName);
    
	rhino3dm().then(async m => {
		console.log('Loaded rhino3dm.');
		var rhino = m;

		var res = await fetchPromise;
		var buffer = await res.arrayBuffer();
		var arr = new Uint8Array(buffer);
		var doc = rhino.File3dm.fromByteArray(arr);

		THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);
		// init();
        // let material = new THREE.MeshNormalMaterial();
        
        var voxelSpacing=this.spacing;
        
        this.billePosition=new THREE.Vector3(0,0,0);

		var material = new THREE.MeshLambertMaterial( { color: 0xbbc3ce } );
		

		var billePos=[
            new THREE.Vector3(0,-voxelSpacing,-(1*voxelSpacing)+voxelSpacing/2.0),
            
			new THREE.Vector3(0,0,-(1*voxelSpacing)+voxelSpacing/2.0),
			new THREE.Vector3(0,0,-(2*voxelSpacing)+voxelSpacing/2.0),
            new THREE.Vector3(0,0,-(3*voxelSpacing)+voxelSpacing/2.0),
            new THREE.Vector3(0,0,-(4*voxelSpacing)+voxelSpacing/2.0),

            new THREE.Vector3(0,(1*voxelSpacing),-(7*voxelSpacing)+voxelSpacing/2.0),
            new THREE.Vector3(0,(1*voxelSpacing),-(6*voxelSpacing)+voxelSpacing/2.0),
            new THREE.Vector3(0,(1*voxelSpacing),-(5*voxelSpacing)+voxelSpacing/2.0),
            new THREE.Vector3(0,(1*voxelSpacing),-(4*voxelSpacing)+voxelSpacing/2.0),
            

        ];

        this.billeParts=[
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
        ];
        
		

		var objects = doc.objects();
		for (var i = 0; i < objects.count; i++) {
			var mesh = objects.get(i).geometry();
			var layer=objects.get(i).attributes().layerIndex;
			if(mesh instanceof rhino.Mesh) {
				// convert all meshes in 3dm model into threejs objects
				var threeMesh = meshToThreejs(mesh, material);
				// console.log(layer)
				threeMesh.position.x+=billePos[layer-1].x;
				threeMesh.position.y+=billePos[layer-1].y;
				threeMesh.position.z+=billePos[layer-1].z;
                this.billeParts[layer-1].add(threeMesh);
                
            }
        }

        this.startMovement(0,true);

		
    });

};