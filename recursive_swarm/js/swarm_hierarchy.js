// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

function loadBilles(fileName,pos,carrying=true,rz=0){
    function meshToThreejs(mesh, material) {
        let loader = new THREE.BufferGeometryLoader();
        var geometry = loader.parse(mesh.toThreejsJSON());
        return new THREE.Mesh(geometry, material);
    }
    
    let fetchPromise = fetch(fileName);
    
    rhino3dm().then(async m => {
        let rhino = m;
    
        let res = await fetchPromise;
        let buffer = await res.arrayBuffer();
        let arr = new Uint8Array(buffer);
        let doc = rhino.File3dm.fromByteArray(arr);
    
        THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1)
        // init();
        // let material = new THREE.MeshNormalMaterial();
        
        
        // let material = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.8, 0.8, 0.8 ) } );
        // let material1 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.3, 0.3, 0.3 ) } );
        // let material2 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.6, 0.6, 0.6 ) } );
        // let material3 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0, 0.2, 0 ) } );
        // let material4 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.5, 0.5, 0 ) } );
        // let material5 = new THREE.MeshLambertMaterial( { color: new THREE.Color( 0.1, 0.1, 0.1 ) } );
        var material5  = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,color: new THREE.Color( 1.0, 1.0, 1.0 ) } );

        var material  = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,color: new THREE.Color( 1.0, 1.0, 1.0 ) } );
        var material1 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,color: new THREE.Color( 0.3, 0.3, 0.3 ) } );
        var material2 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,color: new THREE.Color( 0.6, 0.6, 0.6 ) } );
        var material3 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,color: new THREE.Color( 0, 0.2, 0 ) } );
        var material4 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,color: new THREE.Color( 0.5, 0.5, 0 ) } );
        var material5 = new THREE.MeshPhysicalMaterial( { metalness: 0.4,reflectivity: 0.5,roughness: 0.5,color: new THREE.Color( 0.1, 0.1, 0.1 ) } );

        // var color= new THREE.Color( 0.5, 0.5, 0.5 );
        // var color= new THREE.Color( 0.5, 0.5, 0.5 );
        
        let r=new THREE.Group();
    
        let objects = doc.objects();
        for (let i = 0; i < objects.count; i++) {
            let mesh = objects.get(i).geometry();
            let layer=objects.get(i).attributes().layerIndex;
            // console.log(objects.get(i).attributes())
            if(mesh instanceof rhino.Mesh) {
                // convert all meshes in 3dm model into threejs objects
                
                let threeMesh=new THREE.Group(); 
                // if(layer==7||layer==2||layer==5){
                //     threeMesh = meshToThreejs(mesh, material1);
    
                // }else{
                //     threeMesh = meshToThreejs(mesh, material);
    
                // }
    
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
                }else{
                    if(layer==8){
                        if(carrying){
                            threeMesh = meshToThreejs(mesh, material);

                        }
                    
                    }else{
                        threeMesh = meshToThreejs(mesh, material);
                    }
                    
                }
                // console.log(layer)
                
                
    
                r.add(threeMesh);
            }
        }
        console.log("loaded bille");
    
        // for (let i = 0; i < billeGroupsTemp.length; i++) {
        //     billeGroupsTemp[i].name="Group:"+i;
        // }
        // this.bille.add(billeGroupsTemp[0].clone().add(billeGroupsTemp[1].clone().add(billeGroupsTemp[2].clone().add(billeGroupsTemp[3].clone().add(billeGroupsTemp[4].clone().add(billeGroupsTemp[5].clone()))))));
    
        // this.bille.children[0].add(billeGroupsTemp[6].clone());
        // r.rotation.z=rz;

        r.rotation.z=rz;
        r.position.x+=pos.x;
        r.position.y+=pos.y;
        r.position.z+=pos.z;
        
        // r.name=""+name;
        // name++;

        recursiveSwarms.scene.add(r);



        
        // recursiveSwarms.render();
        // recursiveSwarms.renderer.render(recursiveSwarms.scene, recursiveSwarms.camera)
    
        
    
    });

}