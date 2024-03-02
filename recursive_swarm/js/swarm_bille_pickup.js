// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020


Bille.prototype.loadBilleRecursion= function(fileName){

	function meshToThreejs(mesh, material) {
		var loader = new THREE.BufferGeometryLoader();
		var geometry = loader.parse(mesh.toThreejsJSON());
		return new THREE.Mesh(geometry, material);
    }
    
    var fetchPromise = fetch(fileName);
    
	rhino3dm().then(async m => {
		var rhino = m;

		let res = await fetchPromise;
		let buffer = await res.arrayBuffer();
		let arr = new Uint8Array(buffer);
		let doc = rhino.File3dm.fromByteArray(arr);

        
        var voxelSpacing=this.spacing;
        
        this.billePosition=new THREE.Vector3(0,0,0);

        // let material = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.8, 0.8, 0.8 ) } );
        // let material1 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.3, 0.3, 0.3 ) } );
        // let material2 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.6, 0.6, 0.6 ) } );
        // let material3 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0, 0.2, 0 ) } );
        // let material4 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.5, 0.5, 0 ) } );
        // let material5 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.1, 0.1, 0.1 ) } );
        
        var material  = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,clearcoat: 0.8,clearcoatRoughness: 0.1,color: new THREE.Color( 1.0, 1.0, 1.0 ) } );
        var material1 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,clearcoat: 0.8,clearcoatRoughness: 0.1,color: new THREE.Color( 0.3, 0.3, 0.3 ) } );
        var material2 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,clearcoat: 0.8,clearcoatRoughness: 0.1,color: new THREE.Color( 0.6, 0.6, 0.6 ) } );
        var material3 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,clearcoat: 0.8,clearcoatRoughness: 0.1,color: new THREE.Color( 0, 0.2, 0 ) } );
        var material4 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,clearcoat: 0.8,clearcoatRoughness: 0.1,color: new THREE.Color( 0.5, 0.5, 0 ) } );
        var material5 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,clearcoat: 0.8,clearcoatRoughness: 0.1,color: new THREE.Color( 0.1, 0.1, 0.1 ) } );

        var wrist=0.188;
        var billePos=[
            new THREE.Vector3(0.0   ,0.0               ,-this.spacing/2.0- this.spacing -wrist ),//"g1",
            new THREE.Vector3(0.0   ,0.0               ,-this.spacing/2.0- this.spacing-1*wrist),//"c1",
            new THREE.Vector3(0.0   ,0.0               ,-this.spacing/2.0- 2*this.spacing-1*wrist),//"w1",
            new THREE.Vector3(0.0   ,0.0               ,-this.spacing/2.0- 2*this.spacing-2*wrist),//"e1",
        
            new THREE.Vector3(0.0   ,0.0               ,-this.spacing/2.0- 3*this.spacing-2*wrist  ),//"v1",
            new THREE.Vector3(0.0   ,0.0               ,-this.spacing/2.0- 4*this.spacing-2*wrist  ),//"v11",
            new THREE.Vector3(0.0   ,0.0               ,-this.spacing/2.0- 4*this.spacing-2*wrist  ),//"w2",
            new THREE.Vector3(0.0   , this.spacing+wrist  ,-this.spacing/2.0- 4*this.spacing-2*wrist  ),//"v2",
            new THREE.Vector3(0.0   , this.spacing+wrist  ,-this.spacing/2.0- 5*this.spacing-2*wrist  ),//"v22",
            new THREE.Vector3(0.0   , this.spacing+wrist  ,-this.spacing/2.0- 6*this.spacing-2*wrist  ),//"e2",
            new THREE.Vector3(0.0   , this.spacing+wrist  ,-this.spacing/2.0- 7*this.spacing-2*wrist  ),//"w3",
            new THREE.Vector3(0.0   , this.spacing+wrist  ,-this.spacing/2.0- 7*this.spacing-4*wrist  ),//"v3",
            new THREE.Vector3(0.0   , this.spacing+wrist  ,-this.spacing/2.0- 8*this.spacing-5*wrist  ),//"g2",
            new THREE.Vector3(0.0   ,-this.spacing+wrist ,-this.spacing/2.0 - this.spacing -2*wrist ),//"e3",
            new THREE.Vector3(0.0   ,-this.spacing+wrist ,-this.spacing/2.0 - this.spacing -2*wrist ),//"g3",
            

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
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
            new THREE.Group(),
        ];
        this.partNames=[
            "g1",
            "c1",
            "w1",
            "e1",
            "v1",
            "v11",
            "w2",
            "v2",
            "v22",
            "e2",
            "w3",
            "v3",
            "g2",
            "e3",
            "g3",

        ];
        
        
		

		let objects = doc.objects();
		for (let i = 0; i < objects.count; i++) {
			let mesh = objects.get(i).geometry();
			let layer=objects.get(i).attributes().layerIndex;
			if(mesh instanceof rhino.Mesh) {
				// convert all meshes in 3dm model into threejs objects
				let threeMesh; 

                if(objects.get(i).attributes().name=='grey'||objects.get(i).attributes().name=='grey1'||objects.get(i).attributes().name=='grey2'||objects.get(i).attributes().name=='pcb'){
                    threeMesh = meshToThreejs(mesh, material1);

                }else if(objects.get(i).attributes().name=='motors'){
                    threeMesh = meshToThreejs(mesh, material2);
                }else if(objects.get(i).attributes().name=='controller'){
                    threeMesh = meshToThreejs(mesh, material3);
                }else if(objects.get(i).attributes().name=='connectors'){
                    threeMesh = meshToThreejs(mesh, material4);
                }else if(objects.get(i).attributes().name=='battery'){
                    threeMesh = meshToThreejs(mesh, material5);
                    console.log(objects.get(i).attributes())
                }else{
                    threeMesh = meshToThreejs(mesh, material);
                }
				// console.log(layer)
				threeMesh.position.x+=billePos[layer-1].x;
				threeMesh.position.y+=billePos[layer-1].y;
				threeMesh.position.z+=billePos[layer-1].z;
                this.billeParts[layer-1].add(threeMesh);
                
            }
        }

        console.log("Loaded Parts!");
        this.partsInit();

		
    });

};

Bille.prototype.partsInit=function(){
    this.counter=0;
    var stage1=new THREE.Vector3(1,1,1);
    var stage2=new THREE.Vector3(1,2,2+0);

    this.createStage(stage1);
    this.createStage(stage2);
    this.currentPart=[];

    this.partsPickupLocations=[ //3 accessories, 1 main
        new THREE.Vector3(-0+stage2.x,stage2.y,1+stage2.z),//"g1",
        new THREE.Vector3(-0+stage1.x,stage1.y,1+stage1.z),//"c1",

        new THREE.Vector3(-5+stage2.x,stage2.y,1+stage2.z),//"w1",
        new THREE.Vector3(-5+stage1.x,stage1.y,1+stage1.z),//"e1",

        new THREE.Vector3(-6+stage1.x,stage1.y,1+stage1.z),//"v1",

        new THREE.Vector3(-7+stage1.x,stage1.y,1+stage1.z),//"v11",
        new THREE.Vector3(-3+stage2.x,stage2.y,1+stage2.z),//"w2",

        new THREE.Vector3(-2+stage1.x,stage1.y,1+stage1.z),//"v2",
        new THREE.Vector3(-3+stage1.x,stage1.y,1+stage1.z),//"v22",

        new THREE.Vector3(-1+stage1.x,stage1.y,1+stage1.z),//"e2",
        new THREE.Vector3(-1+stage2.x,stage2.y,1+stage2.z),//"w3",

        new THREE.Vector3(-4+stage1.x,stage1.y,1+stage1.z),//"v3",
        new THREE.Vector3(-4+stage2.x,stage2.y,1+stage2.z),//"g2",

        new THREE.Vector3(-8+stage1.x,stage1.y,1+stage1.z),//"e3",
        new THREE.Vector3(-8+stage2.x,stage2.y,1+stage2.z),//"g3",
    ];


    
    for(var i=0;i<this.billeParts.length;i++){
        // this.partsPickupLocations.push(new THREE.Vector3(-i,1,1));
        this.placeParts(i);
    }

    this.partsOrder=[
        "c1","g1",//0
        "e2","w3",//1
        "v2","",//2
        "v22","w2",//3

        "v3","g2",//4
        "e1","w1",//5
        "v1","",//6
        "v11","",//7
        
        "e3","g3",

    ];
    

    //pickup c1 
    //accessorize with g1
    //place at location

    

    this.startMovementPickup();

};

Bille.prototype.startMovementPickup= function(){

    var inputState=[new THREE.Vector3(1,0,0),new THREE.Vector3(2,0,0),2];

    console.log(this.billeDirection)
    this.robotState={
        leg1Pos:inputState[1].clone(),
        leg2Pos:inputState[0].clone(),
        up:new THREE.Vector3(0,0,1),
        forward:new THREE.Vector3(1,0,0), //todo change to make it parametric from inputState
    };

    this.resetPath();

    this.pickup(true);
    
    setTimeout(function(){ changeEnd(); }, this.path.timeout);
    // if(this.leg==1){
    //     setTimeout(function(){ changeEnd(); }, this.path.timeout);

    // }

    this.moveLeg();

    
    setTimeout(function(){ changeEnd(); }, this.path.timeout);
    setTimeout(function(){ pickupPart(); }, this.path.timeout+=this.path.number/2.0*this.path.delay);
    
    this.moveLeg();

    setTimeout(function(){ changeEnd(); }, this.path.timeout);
    setTimeout(function(){ pickupPart(); }, this.path.timeout+=this.path.number/2.0*this.path.delay);

    this.moveLeg();

    for(var i=0;i<this.path.number;i++){
        setTimeout(function(){ recursiveBille.beltAnimation();}, this.path.timeout+i*this.path.delay*2.0);
    }

    if(this.counter!=0){
        setTimeout(function(){ changeEnd(); }, this.path.timeout);
    }

    setTimeout(function(){ recursiveBille.startMovementDirections([0,4,0,0]); }, this.path.timeout);
    setTimeout(function(){ recursiveBille.startMovementDropOff(); },  this.path.timeout+=(this.path.number+2)*this.path.delay*4*2);

    

};

Bille.prototype.startMovementDropOff=function(){
    this.resetPath();

    if(this.counter==0){
        this.createPickupDropOff0(this.bille.position.clone(),false); 
        this.createPickupDropOff0(this.bille.position.clone(),true);
        
        
    }else if(this.counter==1){
        this.createPickupDropOff1(this.bille.position.clone(),false); 
        this.createPickupDropOff1(this.bille.position.clone(),true); 
        
    }else if(this.counter==2){
        this.createPickupDropOff2(this.bille.position.clone(),false); 
        this.createPickupDropOff2(this.bille.position.clone(),true); 
        
    }else if(this.counter==3){
        this.createPickupDropOff3(this.bille.position.clone(),false); 
        this.createPickupDropOff3(this.bille.position.clone(),true); 
        
    }else if(this.counter==4){
        this.createPickupDropOff00(this.bille.position.clone(),false); 
        this.createPickupDropOff00(this.bille.position.clone(),true);
        
        
    }else if(this.counter==5){
        this.createPickupDropOff11(this.bille.position.clone(),false); 
        this.createPickupDropOff11(this.bille.position.clone(),true); 
        
    }else if(this.counter==6){
        this.createPickupDropOff22(this.bille.position.clone(),false); 
        this.createPickupDropOff22(this.bille.position.clone(),true); 
        
    }else if(this.counter==7){
        this.createPickupDropOff33(this.bille.position.clone(),false); 
        this.createPickupDropOff33(this.bille.position.clone(),true); 
        
    }

    setTimeout(function(){ changeEnd(); }, this.path.timeout);
    this.moveLeg();
    setTimeout(function(){ recursiveBille.dropPart(); }, this.path.timeout+=this.path.number/2.0*this.path.delay);
    setTimeout(function(){ changeEnd(); }, this.path.timeout);
    this.moveLeg();

    
    

    if(this.counter!=7){

        if(this.counter==0){
            this.path.delay=this.path.delay/4.0;
        }
    
        setTimeout(function(){ recursiveBille.startMovementDirections([1,0,5,0]); }, this.path.timeout+=this.path.delay);
        setTimeout(function(){ changeEnd();},  this.path.timeout+=(this.path.number+2)*this.path.delay*4*2);
        

        
        
        setTimeout(function(){ recursiveBille.startMovementPickup(); },  this.path.timeout);
    }else{
        this.path.delay=this.path.delay*4.0;
        setTimeout(function(){ recursiveBille.startMovementDirections([1,0]); }, this.path.timeout+=this.path.delay);
        // setTimeout(function(){ recursiveBille.startMovementDirections([0,0,1]); }, this.path.timeout+=this.path.delay);
        setTimeout(function(){ recursiveBille.magic()},  this.path.timeout+(this.path.number+2)*this.path.delay*2*2);

    }

    

    this.counter++;
    ///////////////////////////////////////////////////////////////////////////////////////

};

Bille.prototype.pickup=function(both){
    //got in front of location
    //create path
    this.createPickupPath1(this.bille.position.clone(),false);
    if(both){
        this.createPickupPath2(this.bille.position.clone(),false);
        this.createPickupPathBack(this.bille.position.clone(),true);

    }else{
        this.createPickupPath1(this.bille.position.clone(),true);
    }
    

}

Bille.prototype.createPickupPath1= function(start,reverse){

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,-this.spacing  ,this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(0             ,-this.spacing  ,0.0));
    var p4=p3.clone().add(new THREE.Vector3(-this.spacing ,this.spacing   ,0));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupPath2= function(start,reverse){

    var p1=start.clone().add(new THREE.Vector3(-this.spacing,-this.spacing  ,this.spacing));

    var p2=p1.clone().add(new THREE.Vector3(0               ,0.0           ,this.spacing+0.9*this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(0               ,this.spacing  ,0.0));
    var p4=p3.clone().add(new THREE.Vector3(0               ,0             ,-0.8*this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupPathBack= function(start,reverse){

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0       ,0.0           ,1.5*this.spacing));
    var p3=p2.clone().add(new THREE.Vector3( 0    ,0.0 ,1.5*this.spacing+0.1*this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(-this.spacing               ,0   ,-1.0*this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupPath11= function(start,reverse){

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,0 ,this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(0             ,-this.spacing  ,0.0));
    var p4=p3.clone().add(new THREE.Vector3(0 ,this.spacing   ,0));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupPath22= function(start,reverse){

    var p1=start.clone().add(new THREE.Vector3(0,0  ,this.spacing));

    var p2=p1.clone().add(new THREE.Vector3(0               ,0.0           ,this.spacing+0.9*this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(0               ,this.spacing  ,0.0));
    var p4=p3.clone().add(new THREE.Vector3(0               ,0             ,-0.8*this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupPathBack1= function(start,reverse){

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0       ,-this.spacing          ,1.5*this.spacing));
    var p3=p2.clone().add(new THREE.Vector3( 0    , 0,1.5*this.spacing+0.1*this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(0               ,this.spacing  ,-1.0*this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupDropOff0= function(start,reverse){ //one above

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,this.spacing,0));
    var p3=p2.clone().add(new THREE.Vector3(-this.spacing             ,0 ,this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(0 ,0   ,-this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupDropOff1= function(start,reverse){ //one above

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,this.spacing,this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(-this.spacing            , 0 ,this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(0 ,0   ,-this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupDropOff2= function(start,reverse){ //one above

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,this.spacing ,1.5*this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(-this.spacing            , 0 ,1.5*this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(0 ,0   ,-this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupDropOff3= function(start,reverse){ //one above

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,this.spacing ,2*this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(-this.spacing            , 0 ,1.5*this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(0 ,0   ,-0.5*this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupDropOff00= function(start,reverse){ //one above

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,0,0));
    var p3=p2.clone().add(new THREE.Vector3(-this.spacing             ,0 ,this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(0 ,0   ,-this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupDropOff11= function(start,reverse){ //one above

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,0,this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(-this.spacing            , 0 ,this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(0 ,0   ,-this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupDropOff22= function(start,reverse){ //one above

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,0 ,1.5*this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(-this.spacing            , 0 ,1.5*this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(0 ,0   ,-this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.createPickupDropOff33= function(start,reverse){ //one above

    var p1=start.clone();

    var p2=p1.clone().add(new THREE.Vector3(0             ,0 ,2*this.spacing));
    var p3=p2.clone().add(new THREE.Vector3(-this.spacing            , 0 ,1.5*this.spacing));
    var p4=p3.clone().add(new THREE.Vector3(0 ,0   ,-0.5*this.spacing));
    // var p5=p4.clone().add(new THREE.Vector3(0,0,0));
    
    if(!reverse){
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p1,
            p2,
            p3,
            p4
        );

    }else{
        //create bezier curve
        this.path.curve= new THREE.CubicBezierCurve3 (
            p4,
            p3,
            p2,
            p1
        );
    }
	
	this.dividePickupPath(reverse);
};

Bille.prototype.dividePickupPath= function(reverse){

	//points
	var tempPoints=this.path.curve.getSpacedPoints(this.path.number);
	
	for (var i=0;i<=this.path.number;i++)
	{
		this.path.normals.push(0);
		this.path.normalAdjustments.push(0);
		this.path.points.push(tempPoints[i].clone());
        this.path.rotations.push(0);		
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

Bille.prototype.pickupPart=function(){
    
    if(this.partsOrder[0]!=""){
        this.currentPart.push(this.partsOrder[0]);
        var part=this.swarm.scene.getObjectByName( this.partsOrder[0]);

        part.position.x=0;
        part.position.y=2*this.spacing;
        part.position.z=this.spacing+0.5*this.spacing;


        this.bille.children[0].children[0].add(part);

    }

    this.partsOrder.shift();

    
}

Bille.prototype.pickupPart1=function(){
    
    if(this.partsOrder[0]!=""){
        this.currentPart.push(this.partsOrder[0]);
        var part=this.swarm.scene.getObjectByName( this.partsOrder[0]);

        part.position.x=0;
        part.position.y=1*this.spacing;
        part.position.z=this.spacing+0.5*this.spacing;


        this.bille.children[0].add(part);

    }

    this.partsOrder.shift();

    
}

Bille.prototype.dropPart=function(){

    for(var i=0;i<this.currentPart.length;i++){
        var part=this.swarm.scene.getObjectByName(this.currentPart[i]);

        this.bille.children[0].children[0].remove(part);

        part.position.x=0;
        part.position.y=0;
        part.position.z=0;

        part.rotation.z=Math.PI/2.0;

        part.position.x=this.bille.position.x-2*this.spacing;
        part.position.y=this.bille.position.y+0.2*this.spacing;
        part.position.z=this.bille.position.z+this.spacing+0.5*this.spacing;

        // part.rotation.x=this.bille.rotation.x;
        // part.rotation.y=this.bille.rotation.y;
        // part.rotation.z=this.bille.rotation.z;

        // console.log(part.position);
        // console.log(this.bille.position);
        this.swarm.scene.add(part)

    }
    
    this.currentPart=[];

    
}

Bille.prototype.createStage=function(pos){
    var material = new THREE.MeshLambertMaterial({ color:new THREE.Color(0.1,0.1,0.1)});
    material.transparent=false;
    material.opacity=0.7;
    var geometry = new THREE.BoxGeometry(10*this.spacing, this.spacing, 0.4);
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.x=pos.x*this.spacing-5*this.spacing+0.5*this.spacing;
    mesh.position.y=pos.y*this.spacing;
    mesh.position.z=pos.z*this.spacing-0.2;
    this.swarm.scene.add(mesh);

}

Bille.prototype.placeParts=function(num){
    
    // this.swarm.buildSingleVoxelAt(new THREE.Vector3(
    //     this.partsPickupLocations[num].x*this.spacing,
    //     this.partsPickupLocations[num].y*this.spacing,
    //     this.partsPickupLocations[num].z*this.spacing
    //     ));
    
    // this.swarm.grid[this.partsPickupLocations[num].x][this.partsPickupLocations[num].y][this.partsPickupLocations[num].z]=true;
    // this.swarm.grid[this.partsPickupLocations[num].x][this.partsPickupLocations[num].y][this.partsPickupLocations[num].z+1]=true;

    this.billeParts[num].position.x=(this.partsPickupLocations[num].x)*this.spacing;
    this.billeParts[num].position.y=(this.partsPickupLocations[num].y)*this.spacing;
    this.billeParts[num].position.z=(this.partsPickupLocations[num].z)*this.spacing+0.5*this.spacing;
    this.billeParts[num].name=this.partNames[num];
    this.swarm.scene.add(this.billeParts[num]);

}

Bille.prototype.beltAnimation=function(){
    // console.log(list);
    var list=this.partsOrder;

    for(var i=0;i<list.length;i++){
        if( list[i]!=""){
            var part=this.swarm.scene.getObjectByName( list[i]);
            part.position.x+=this.spacing/this.path.number;
        }
        
    }

}

Bille.prototype.magic=function(){

    for(var i=0;i<this.billeParts.length;i++){
        this.billeParts[i].visible=false;
    }
    var part=this.swarm.scene.getObjectByName( 'e3');
    part.visible=true;
    var part=this.swarm.scene.getObjectByName( 'g3');
    part.visible=true;
    this.swarm.scene.add(this.bille.clone())

    inputState=[new THREE.Vector3(1.5,2,0),new THREE.Vector3(1.5,3,0),2];

    this.billePosition=inputState[0].clone().multiplyScalar(this.voxelSpacing);
    this.bille.position.x=this.billePosition.x;
    this.bille.position.y=this.billePosition.y;
    this.bille.position.z=this.billePosition.z;

    this.bille.children[0].remove(this.bille.children[0].children[this.bille.children[0].children.length-1]);
    

    

    this.billeTarget={
        x:inputState[1].x*this.voxelSpacing,
        y:inputState[1].y*this.voxelSpacing-0.81*this.spacing,
        z:inputState[1].z*this.voxelSpacing,
        rx:0,
        ry:0,
        rz:0,
        targetEnd:"end 1"
    };
    this.robotState={
        leg1Pos:inputState[1].clone(),
        leg2Pos:inputState[0].clone(),
        up:new THREE.Vector3(0,0,1),
        forward:new THREE.Vector3(1,0,0), //todo change to make it parametric from inputState
    };
    this.targetBille.position.x = this.billeTarget.x;
	this.targetBille.position.y = this.billeTarget.y;
    this.targetBille.position.z = this.billeTarget.z;

    this.updateAngles();

    setTimeout(function(){ recursiveBille.startMovementDirections([5,0,0,4,1]); }, this.path.timeout+=2*this.path.delay);

    setTimeout(function(){ changeEnd();},  this.path.timeout+=(this.path.number+2)*this.path.delay*5*2);

    setTimeout(function(){ recursiveBille.finalPickup()},  this.path.timeout+=this.path.delay*2);

    
}

Bille.prototype.finalPickup=function(){

    var inputState=[new THREE.Vector3(1,0,0),new THREE.Vector3(2,0,0),2];

    console.log(this.billeDirection)
    this.robotState={
        leg1Pos:inputState[1].clone(),
        leg2Pos:inputState[0].clone(),
        up:new THREE.Vector3(0,0,1),
        forward:new THREE.Vector3(1,0,0), //todo change to make it parametric from inputState
    };


    this.resetPath();

    this.createPickupPath11(this.bille.position.clone(),false);
    this.createPickupPath22(this.bille.position.clone(),false);
    this.createPickupPathBack1(this.bille.position.clone(),true);

    
    
    setTimeout(function(){ changeEnd(); }, this.path.timeout);

    this.moveLeg();

    
    setTimeout(function(){ changeEnd(); }, this.path.timeout);
    setTimeout(function(){ recursiveBille.pickupPart1(); }, this.path.timeout+=this.path.number/2.0*this.path.delay);

    this.moveLeg();

    setTimeout(function(){ changeEnd(); }, this.path.timeout);
    setTimeout(function(){ recursiveBille.pickupPart1(); }, this.path.timeout+=this.path.number/2.0*this.path.delay);

    this.moveLeg();
}

