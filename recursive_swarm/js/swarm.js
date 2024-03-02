// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020



///////////////////////////TODO///////////////////////////////
//- change robot to prototype not list
//- change path/steps to class
// you have name the swarm object recursiveSwarms for some functions to work (i'll change that later)


///////////////////////////globals///////////////////////////////

// The swarm setup
function Swarm(setup){
	///////////////////////////THREE///////////////////////////////
	// this.container =three.this.container;
	// this.camera    =three.this.camera;    
	// this.scene     =three.this.scene  ;   
	// this.renderer  =three.this.renderer ;


	this.setup=setup;
	console.log("setup", setup)
	this.container =null;
	this.camera    =null;
	this.scene     =null;
	this.renderer  =null;
	this.cameraControls=null;
	this.three=setup.three;


	this.geometryGui; //todo needed?
	this.targetGui;//todo needed?
	this.jointsGui;//todo needed?
	this.jointsParams;//todo needed?
	this.targetParams;//todo needed?
	this.geometryParams;//todo needed?
	this.end;//todo needed?


	this.currentStep;
	this.DEG_TO_RAD = Math.PI / 180;
	this.RAD_TO_DEG = 180 / Math.PI;
	// this.color2=GLOBALS.color2;//kohly
	// this.color3=GLOBALS.color3;///*teal*/
	// this.color4= GLOBALS.color4; //red/orange
	
	///////////////////////////this.voxels///////////////////////////////
	this.voxel=[];
	this.singleVoxel=null;
	this.spacing=setup.voxelSpacing;
	this.voxelSpacing=[];
	this.voxelLocations=[];
	this.voxelSlices=[];
	this.voxelSlicesCount=[];

	this.currentVoxelCount=0;
	this.build=[];

	this.globalZ=0;
	this.globalRank=0;

	this.voxelNum=0;
	this.gridSize=setup.gridSize;

	this.stepsCap=500; //change with very big simulations

	this.grid=[];

	this.dataAngles=[];


	///////////////////////////robot///////////////////////////////
	this.numberOfRobots=setup.robotLocations.length; //change number of robots
	// this.numberOfRobots=4;
	this.numberOfStartLocations=setup.depositLocations.length;
	// this.numberOfStartLocations=4;
	this.speed=setup.viz.speed; //change to speed up the simulation
	this.reducedViz=false;
	this.renderInterval=1;
	this.renderCounter=0;

	this.THREE1=[];
	this.robotBones = [];
	this.joints = [];
	this.angles = [];

	this.robotState=[];

	this.THREERobot;
	this.VisualRobot= [];
	this.THREESimulationRobot= [];
	this.defaultRobotState= [];
	this.target = [];
	this.control= [];
	this.leg= [];

	this.voxelNormal= [];
	this.normalAdjustmentVector= [];

	this.startLocations= [];
	this.depositLocations= [];

	this.THREE1dir= [];
	this.THREE1Pos= [];

	//path
	this.targetPositionMesh= [];
	this.carriedVoxel= [];

	this.goHome= [];
	this.robotScale=[];
	this.labelRenderer=[]

	if(setup.path !== undefined){
		this.pathParams={
			showPath:setup.path.showPath,
			cHeight:setup.path.cHeight,
			number:setup.path.number

		}
	}else{
		this.pathParams={
			showPath:false,
			showPath:1.4,
			number:20

		}

	}

	this.waitTime=10;

	if(setup.robotGeometry !== undefined){
		this.robotGeometry={
			leg1: setup.robotGeometry.leg1,
			leg2: 	setup.robotGeometry.leg2,
			offset:	setup.robotGeometry.offset

		}
	}else{
		this.robotGeometry={
			leg1:5,
			leg2:5,
			offset:2

		}

	}

	//////////////////////

	this.steps=[];
	this.path= [];

	this.totalNumberofSteps=[];
	this.guiControls=[];
	this.showGUI= setup.viz.showGUI;

	if(this.showGUI){
		this.saveAngleData=setup.viz.saveAngleData;
	}else{
		this.saveAngleData=false;
	}

	this.buildType=setup.buildType;
	this.hierarchical=setup.hierarchical;

	if(this.buildType=="directions"){
		this.stepsDir=setup.stepsDir;

	}

	for (var i=0; i<this.numberOfRobots;i++){
		this.robotScale.push(setup.robotLocations[i][2]);
		this.voxelSpacing.push(setup.voxelSpacing*this.robotScale[i]);

	}

	///////////////////////function calls///////////////////////////////
	this.declareGlobals();

	for (var i=0; i<this.numberOfRobots;i++){
		this.robotState[i].leg1Pos=setup.robotLocations[i][0].multiplyScalar(1/this.robotScale[i]);
		this.robotState[i].leg2Pos=setup.robotLocations[i][1].multiplyScalar(1/this.robotScale[i]);

	}
	for (var i=0; i<this.numberOfStartLocations;i++){
		if(setup.depositLocations[i][0]!=-1){
			this.startLocations[i]=setup.depositLocations[i][0].clone().multiplyScalar(this.spacing);
			this.depositLocations[i]=setup.depositLocations[i][0].clone().multiplyScalar(this.spacing);
		}else{
			this.startLocations[i]=setup.depositLocations[i][0].clone();
			this.depositLocations[i]=setup.depositLocations[i][0].clone();
		}
	}

	this.init();
	this.buildGrid(); //build grid and first sacrificial layer

	//IROS PAPER FREP
	if(this.buildType=="frepCube"){
		this.frepCube();//later change string for frep
	}
	

	if(this.hierarchical&& (this.buildType=="sdfList"||this.buildType=="sdfList1")){
		this.buildList=setup.buildList;
		this.buildList.availablePickup=[];
		this.buildList.listToBuild=[];
		this.voxelList=[];
		for (var i=0; i<this.numberOfRobots;i++){
			this.voxelList.push({
				build:{
					list:[],
					stockData:[]
				},
				toDelete:{
					stockData:[],
					robotIndex:-1

				},
				busy:false,
				busyGoingHome:false
			});
		}
		
		this.createHierarchalSDFVoxelList();
		this.inSituAdjustment=[];
		for (var i=0; i<this.numberOfStartLocations;i++){
			this.inSituAdjustment.push(setup.depositLocations[i][1]);
		}
	}

	if(this.buildType=="list"){

		this.voxelList=[];
		this.createHierarchalVoxelList();

	}else if(this.buildType=="recursion"){

		this.voxelList=[];
		this.createRecursionVoxelList();

	}

	for( i=0;i<this.numberOfRobots;i++){
		this.loadVoxel(i);
		if( this.buildType != "directions"){
			this.buildHelperMeshes(i);
		}
		
		this.setupGUI(i);
		this.THREERobotCall(i);
		this.defaultRobot(i);
		if( this.buildType != "recursion" &&this.buildType != "list"){
			this.startMovement(i,true);
		}
	}
	this.screenshotSaver();
}

///////////////////////////////////////////////////////////////////////////////////////////////////
function _move(robotIndex){
	recursiveSwarms.move(robotIndex);
}

function _changeEnd(robotIndex){
	recursiveSwarms.changeEnd(robotIndex);
}

function _rotateRobot (robotIndex){
	recursiveSwarms.rotateRobot(robotIndex,recursiveSwarms.path[robotIndex].changeRotation[parseInt((recursiveSwarms.path[robotIndex].currentPoint-recursiveSwarms.path[robotIndex].number)/recursiveSwarms.path[robotIndex].number/2)]);
}

function onWindowResize() {
	recursiveSwarms.camera.aspect = window.innerWidth / window.innerHeight;
	recursiveSwarms.camera.updateProjectionMatrix();

	recursiveSwarms.renderer.setSize(window.innerWidth, window.innerHeight);
	recursiveSwarms.renderer.render(recursiveSwarms.scene, recursiveSwarms.camera);
	// recursiveSwarms.labelRenderer.setSize( window.innerWidth, window.innerHeight );
}

function _startMovement(robotIndex,home){

	recursiveSwarms.startMovement(robotIndex,home);
}


