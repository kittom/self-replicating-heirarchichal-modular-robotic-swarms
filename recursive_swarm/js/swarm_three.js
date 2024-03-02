// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020


// Based on: https://github.com/glumb/robot-gui

///////////////////////////////scene threejs///////////////////////////////
Swarm.prototype.init=function() {
	this.container = document.getElementById(this.three);// 'webgl' ); //

	////////////
	// this.labelRenderer = new THREE.CSS2DRenderer();
    // this.labelRenderer.setSize( window.innerWidth, window.innerHeight );
    // this.labelRenderer.domElement.style.position = 'absolute';
    // this.labelRenderer.domElement.style.top = '0px';
    // document.body.appendChild( this.labelRenderer.domElement );
	//////////////////

	this.renderer = new THREE.WebGLRenderer({
		alpha: true,//transparent
		antialias: true, // to get smoother output
		preserveDrawingBuffer: false, // no screenshot -> faster?
	  });
	// this.renderer.setClearColor(0x333333);
	// this.renderer.setClearColor(0xffffff);// the default
	this.renderer.setClearColor( 0x000000, 0 ); //transparent
	let width = 3000;
    let height= 2000;
	this.renderer.setSize(window.innerWidth, window.innerHeight)
	// this.renderer.setSize(width, height)
	this.container.appendChild( this.renderer.domElement );

	this.scene = new THREE.Scene();

	this.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000)
	
	this.camera.up.set(0, 0, 0.5);
	
	this.camera.position.set(200*this.gridSize/40, 200*this.gridSize/40, 200*this.gridSize/40);//general

	

  	this.scene.add(this.camera);

	// lights
	var light = new THREE.AmbientLight(0xaaaaaa);
	this.scene.add(light);
	var light2 = new THREE.DirectionalLight(0xaaaaaa);
	light2.position.set(1, 1.3, 1).normalize();
	this.scene.add(light2);

	
  
	this.cameraControls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

	
	this.cameraControls.target.set( 0, 0, -50*this.gridSize/30 );//general
	


	// this.cameraControls.addEventListener('change', () => this.renderer.render(this.scene, this.camera));
	this.cameraControls.addEventListener('change', this.render);

  
	
	window.addEventListener('resize', onWindowResize, false);

	var size = 10;
	var step = 20;

	var gridHelper = new THREE.GridHelper(size, step);
	gridHelper.rotation.x = Math.PI / 2;
	// this.scene.add(gridHelper);

	var axisHelper = new THREE.AxesHelper(5);
	var colors = axisHelper.geometry.attributes.color.array;

	colors.set( [
		0, 1, 0,    0, 1, 0, // x-axis rgb at origin; rgb at end of segment
		1, 0, 0,    1, 0, 0, // y-axis
		0, 0, 1,    0, 0, 1  // z-axis
	] );

	

	// this.scene.add(axisHelper);
	this.animate();

	////////////////////load voxel/////////////////////////
	this.loadSingleVoxel();
	
}

Swarm.prototype.animate=function(){
	requestAnimationFrame(this.animate.bind(this));
	this.render();
}

Swarm.prototype.render= function() {
	if(this.renderCounter>this.renderInterval){
		this.renderer.render(this.scene, this.camera);
		// this.labelRenderer.render( this.scene, this.camera );
		this.cameraControls.update();
		this.renderCounter=0;

	}
	this.renderCounter++;
	
}