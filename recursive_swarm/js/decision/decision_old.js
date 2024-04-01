
// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020


var buildList=[];
var voxelIndexList;
var scale,setup;
setup={};
setup.nodes=[];
setup.edges=[];
setup.viz={};
setup.viz.colorMaps=[YlGnBu,coolwarm, winter ,jet];
var colormap=YlGnBu;
var maxOrder;

var Graph,gData;
var Graph1;

var Robots;
var minCost=Infinity;
var maxCost=0;
var minNodePath= "" ;

function decisionTree(){
    Robots=[
        null,
        {
            size:1,
            maxNum:4,
            num:0
        },
        {
            size:2,
            maxNum:2,
            num:0
        },
        null,
        {
            size:4,
            maxNum:1,
            num:0
        }
    ];
    scale=400;


    Robots[1].num++;
    setup.nodes.push({
        path:"",
        name:"["+Robots[4].num +","+ Robots[2].num+","+ Robots[1].num+"]",
        name:"Decision Tree\nR⁴:"+Robots[4].num +", R²:"+ Robots[2].num+", R:"+ Robots[1].num+"",
        size:scale,
        min:false,
        parent:"top",
        c:color66,
        shape:'dot',
        cost:estimateCost(Robots,"")
    });


    // console.log(estimateCost(Robots,""));

    decision(setup,Robots,1,"");

    console.log("Min Node:"+minNodePath+"!!!");

    var node=setup.nodes.filter(n => n.path==minNodePath)[0];
    node.min=true;
    while(node.parent != "top"){
        var edge=setup.edges.filter(e => (e.source==node.parent) &&(e.target==node.path))[0];
        edge.min=true;
        node=setup.nodes.filter(n => n.path==node.parent)[0];
    }

    var nodes=setup.nodes;
    var links=setup.edges;

    Graph(document.getElementById('graph')).graphData({ nodes, links });


}

function decision(setup,robots,size,name){

    var cc=estimateCost(robots,name+"b");
    setup.nodes.push({
        path:name+"b",
        type:"build",
        // name:"expand:"+0,
        // name:"["+robots[4].num +","+ robots[2].num+","+ robots[1].num+"] build cost:"+estimateCost(robots,name+"b"),
        name:"Build \n Time: "+cc,
        size:scale,
        parent:name,
        min:false,
        c:'#56ffcc',
        shape:'square',
        cost:cc
    });

    setup.edges.push({source: name, target: name+"b",min:false});
    

    if(robots[size].num<robots[size].maxNum){
        var r=JSON.parse(JSON.stringify(robots));
        r[size].num++;
        setup.nodes.push({
            path:name+"r",
            type:"reproduce",
            // name:"reproduce: ["+r[4].num +","+ r[2].num+","+ r[1].num+"]",
            name:"Reproduce\nR⁴:"+r[4].num +", R²:"+ r[2].num+", R:"+ r[1].num+"",
            size:scale,
            parent:name,
            min:false,
            c:color88,
            shape:'star'

        });
        setup.edges.push({source: name, target: name+"r",min:false});

        //for each robot here propagate decision
        decision(setup,r,size,name+"r");

    }

    if(size<=2 && robots[size*2].num<robots[size*2].maxNum){
        var r=JSON.parse(JSON.stringify(robots));
        r[size*2].num++;
        setup.nodes.push({
            path:name+"g",
            type:"grow",
            // name:"grow: ["+r[4].num +","+ r[2].num+","+ r[1].num+"]",
            name:"Evolve\nR⁴:"+r[4].num +", R²:"+ r[2].num+", R:"+ r[1].num+"",
            size:scale*0.9,
            parent:name,
            min:false,
            c:color77,
            shape:'diamond'

        });
        setup.edges.push({source: name, target: name+"g",min:false});;
        decision(setup,r,size*2,name+"g")

    }

    
}

function estimateCost(robots,path){
    var cost =0;
    //fisrt add cost of building robots
    cost+=recursionCost(robots);

    var binZ=buildList.listZ[buildList.currentZIndex];
    var binSize=binZ.listSize[binZ.currentSizeIndex];
    var binSDF=binSize.listSDF[binSize.currentSDFIndex];
    
    var indexZ=buildList.currentZIndex;
    var indexSize=binZ.currentSizeIndex;
    var indexSDF=binSize.currentSDFIndex;

    var maxIndexZ=buildList.maxZIndex;
    var maxIndexSize=binZ.maxSizeIndex;
    var maxIndexSDF=binSize.maxSDFIndex;

    for(var i=0;i<buildList.listZ.length;i++){ //for each z layer bin
        binZ=buildList.listZ[i];
        indexZ=i;
        maxIndexSize=binZ.maxSizeIndex;

        for(var j=0;j<binZ.listSize.length;j++){ //for each size bin
            binSize=binZ.listSize[j];
            indexSize=j;
            maxIndexSDF=binSize.maxSDFIndex;

            for(var k=0;k<binSize.listSDF.length;k++){ //for each sdf bin (signed distance field)
                binSDF=binSize.listSDF[k];
                indexSDF=k;
                var cubesToBuild=[];
                var size=binSize.size;

                if(robots[size].num>0){
                    //there is robots same size
                    cubesToBuild=binSDF.listCubes;
                }else if(robots[binSize.size/2].num>0 &&binSize.size>=2 ){
                    
                    //there is no robots same size, divide stock by 2
                    for(var l=0;l<binSDF.listCubes.length;l++){
                        for(var ii=0;ii<voxelIndexList[2].list.length;ii++){
                            var x1=binSDF.listCubes[l].position.x+voxelIndexList[2].list[ii].x;
                            var y1=binSDF.listCubes[l].position.y+voxelIndexList[2].list[ii].y;
                            var z1=binSDF.listCubes[l].position.z+voxelIndexList[2].list[ii].z;
                            var stockBuilt=false;
                            if(buildList.listZ[i].listSize[j].size==1){
                                stockBuilt=true;
                            }
                            cubesToBuild.push({
                                layerZ:buildList.listZ[i].layerZ,
                                size:buildList.listZ[i].listSize[j].size,
                                sdfRank:buildList.listZ[i].listSize[j].listSDF[k].sdfRank,
                                done:false,
                                stockBuilt:stockBuilt,
                                stockAssigned:false,
                                stockPickedUp:false,
                                position:new THREE.Vector3(
                                    x1,
                                    y1,
                                    z1)
                            });
                        }
                    }
                    size=binSize.size/2;

                }else if(robots[binSize.size/4].num>0&&binSize.size>=4){
                    //there is no robots same size, divide stock by 8
                    for(var l=0;l<binSDF.listCubes.length;l++){
                        for(var ii=0;ii<voxelIndexList[4].list.length;ii++){
                            var x1=binSDF.listCubes[l].position.x+voxelIndexList[4].list[ii].x;
                            var y1=binSDF.listCubes[l].position.y+voxelIndexList[4].list[ii].y;
                            var z1=binSDF.listCubes[l].position.z+voxelIndexList[4].list[ii].z;
                            var stockBuilt=false;
                            if(buildList.listZ[i].listSize[j].size==1){
                                stockBuilt=true;
                            }
                            cubesToBuild.push({
                                layerZ:buildList.listZ[i].layerZ,
                                size:buildList.listZ[i].listSize[j].size,
                                sdfRank:buildList.listZ[i].listSize[j].listSDF[k].sdfRank,
                                done:false,
                                stockBuilt:stockBuilt,
                                stockAssigned:false,
                                stockPickedUp:false,
                                position:new THREE.Vector3(
                                    x1,
                                    y1,
                                    z1)
                            });
                        }
                    }
                    size=binSize.size/4;

                }

                //check how many in parallel

                var numRobotParallel= Math.floor(cubesToBuild.length / robots[size].num);
                if((cubesToBuild.length/robots[size].num - Math.floor(cubesToBuild.length/robots[size].num))>0){
                    numRobotParallel++;
                }

                //get furthest robot
                var furthestVoxel=new THREE.Vector3(0,0,0);

                for(var l=0;l<cubesToBuild.length;l++){ //for each cube add location (todo check if int)
                    if( (cubesToBuild[l].position.x+cubesToBuild[l].position.y+cubesToBuild[l].position.z)
                        > (furthestVoxel.x+furthestVoxel.y+furthestVoxel.z)){
                        furthestVoxel=cubesToBuild[l].position.clone();
                    }
                }
                cost+=(numRobotParallel*2*((furthestVoxel.x+furthestVoxel.y+furthestVoxel.z)));

            }
        }
    }

    if(cost<minCost){
        minCost=cost;
        minNodePath=path;
    }
    if(cost>maxCost){
        // if(cost!=12126){
            maxCost=cost;
        //     console.log(maxCost)

        // }
            
    }


    return cost;

}

function recursionCost(robots){
    //todo fix to more accurate estimate
    // return cubeCost(2,2,2)*robots[1].num+cubeCost(4,4,4)*robots[2].num+cubeCost(8,8,8)*robots[4].num;
    return cubeCost(1,1,1)*robots[1].num+cubeCost(2,2,2)*robots[2].num+cubeCost(4,4,4)*robots[4].num;

}

function cubeCost(x,y,z){
    return 2.0*(((x*x+x)/2)*y*z + ((y*y+y)/2)*x*z + ((z*z+z)/2)*y*x);
}

/////////////////////////////////////////////

//the one for vis built sequence no decision tree
function createBuildList(json, setup, scale){
    var offset2=12;
    var offset=offset2+8;
    var buildSize=32;
    var gridSize=buildSize+2*(offset);
    var order=0;

    var voxelIndexList=[
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
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(0,1,0),
                new THREE.Vector3(1,0,0),
                new THREE.Vector3(1,1,0),
                new THREE.Vector3(0,0,1),
                new THREE.Vector3(0,1,1),
                new THREE.Vector3(1,0,1),
                new THREE.Vector3(1,1,1)
            ]
    
        },
        null,
        {
            size:4,
            list:[
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(0,1,0),
                new THREE.Vector3(0,2,0),
                new THREE.Vector3(0,3,0),
    
                new THREE.Vector3(1,0,0),
                new THREE.Vector3(1,1,0),
                new THREE.Vector3(1,2,0),
                new THREE.Vector3(1,3,0),
    
                new THREE.Vector3(2,0,0),
                new THREE.Vector3(2,1,0),
                new THREE.Vector3(2,2,0),
                new THREE.Vector3(2,3,0),
    
                new THREE.Vector3(3,0,0),
                new THREE.Vector3(3,1,0),
                new THREE.Vector3(3,2,0),
                new THREE.Vector3(3,3,0),
    
    
                new THREE.Vector3(0,0,1),
                new THREE.Vector3(0,1,1),
                new THREE.Vector3(0,2,1),
                new THREE.Vector3(0,3,1),
    
                new THREE.Vector3(1,0,1),
                // new THREE.Vector3(1,1,1),
                // new THREE.Vector3(1,2,1),
                new THREE.Vector3(1,3,1),
    
                new THREE.Vector3(2,0,1),
                // new THREE.Vector3(2,1,1),
                // new THREE.Vector3(2,2,1),
                new THREE.Vector3(2,3,1),
    
                new THREE.Vector3(3,0,1),
                new THREE.Vector3(3,1,1),
                new THREE.Vector3(3,2,1),
                new THREE.Vector3(3,3,1),
    
                new THREE.Vector3(0,0,2),
                new THREE.Vector3(0,1,2),
                new THREE.Vector3(0,2,2),
                new THREE.Vector3(0,3,2),
    
                new THREE.Vector3(1,0,2),
                // new THREE.Vector3(1,1,2),
                // new THREE.Vector3(1,2,2),
                new THREE.Vector3(1,3,2),
    
                new THREE.Vector3(2,0,2),
                // new THREE.Vector3(2,1,2),
                // new THREE.Vector3(2,2,2),
                new THREE.Vector3(2,3,2),
    
                new THREE.Vector3(3,0,2),
                new THREE.Vector3(3,1,2),
                new THREE.Vector3(3,2,2),
                new THREE.Vector3(3,3,2),
    
    
                new THREE.Vector3(0,0,3),
                new THREE.Vector3(0,1,3),
                new THREE.Vector3(0,2,3),
                new THREE.Vector3(0,3,3),
    
                new THREE.Vector3(1,0,3),
                new THREE.Vector3(1,1,3),
                new THREE.Vector3(1,2,3),
                new THREE.Vector3(1,3,3),
    
                new THREE.Vector3(2,0,3),
                new THREE.Vector3(2,1,3),
                new THREE.Vector3(2,2,3),
                new THREE.Vector3(2,3,3),
    
                new THREE.Vector3(3,0,3),
                new THREE.Vector3(3,1,3),
                new THREE.Vector3(3,2,3),
                new THREE.Vector3(3,3,3),
                
            ]
    
        }
    
    ];

    var shift=gridSize/2.0;

    var buildList={
        currentZIndex:0,
        maxZIndex:json.length,
        listZ:[],
        done:false,
        availablePickup:[],
        listToBuild:[]

    };
    // todo multiply by 4 as smallest size in cubeCone is 0.25
    // y is z and z is y
    // shift z by 1 cause sacrificial layer is 0
    // shift x and y to not have negative values

    setup.nodes.push({
        path:"[]",
        size:100,
        name:"Build \n Sequence",
        level:0,
        order:order
    });

    for(var i=0;i<json.length;i++){ //for each z layer bin
        buildList.listZ.push({
                layerZ:json[i][0][0][0].origin[1]*scale+1,
                done:false,
                currentSizeIndex:0,
                maxSizeIndex:json[i].length,
                listSize:[]
        });

        setup.nodes.push({
            path:"["+i+"]",
            size:100,
            module:"["+i+"]",
            // name:"layer:"+i+"",
            name:"L:"+i+"",
            level:1,
            order:order
        });
        setup.edges.push({source: "[]", target: "["+i+"]"});

        for(var j=0;j<json[i].length;j++){ //for each size bin
            buildList.listZ[i].listSize.push({
                size:json[i][j][0][0].widths[0]*scale,
                layerZ:buildList.listZ[i].layerZ,
                done:false,
                currentSDFIndex:0,
                maxSDFIndex:json[i][j].length,
                listSDF:[]
                
            });

            setup.nodes.push({
                path:"["+i+","+j+"]",
                size:100,
                module:"["+i+"]",
                // name:"layer:"+i+", size:"+json[i][j][0][0].widths[0]*scale+"",
                name:"S:"+(json[i][j][0][0].widths[0]*scale)+"",
                level:2,
                order:order
            });
            setup.edges.push({source: "["+i+"]", target: "["+i+","+j+"]"});

            for(var k=0;k<json[i][j].length;k++){ //for each sdf bin (signed distance field)
                buildList.listZ[i].listSize[j].listSDF.push({
                    sdfRank:k,
                    layerZ:buildList.listZ[i].layerZ,
                    size:buildList.listZ[i].listSize[j].size,
                    done:false,
                    currentCubeIndex:0,
                    maxCubeIndex:json[i][j][k].length,
                    listCubes:[]
                    
                    
                });

                setup.nodes.push({
                    path:"["+i+","+j+","+k+"]",
                    size:100,
                    module:"["+i+"]",
                    // name:"layer:"+i+", size:"+buildList.listZ[i].listSize[j].size+", sdf:"+k+"",
                    name:"SDF:"+k+"",
                    level:3,
                    order:order
                });
                setup.edges.push({source: "["+i+","+j+"]", target: "["+i+","+j+","+k+"]"});
                

                for(var l=0;l<json[i][j][k].length;l++){ //for each cube add location (todo check if int)
                    var stockBuilt=false;
                    if(buildList.listZ[i].listSize[j].size==1){
                        stockBuilt=true;
                    }
                    buildList.listZ[i].listSize[j].listSDF[k].listCubes.push({
                        layerZ:buildList.listZ[i].layerZ,
                        size:buildList.listZ[i].listSize[j].size,
                        sdfRank:buildList.listZ[i].listSize[j].listSDF[k].sdfRank,
                        done:false,
                        stockBuilt:stockBuilt,
                        stockAssigned:false,
                        stockPickedUp:false,
                        position:new THREE.Vector3(
                            json[i][j][k][l].origin[0]*scale+shift,
                            json[i][j][k][l].origin[2]*scale+shift,
                            json[i][j][k][l].origin[1]*scale+1)
                    });

                    setup.nodes.push({
                        path:"["+i+","+j+","+k+","+l+"]",
                        size:200*buildList.listZ[i].listSize[j].size,
                        module:"["+i+"]",
                        // name:"layer:"+i+", size:"+buildList.listZ[i].listSize[j].size+", sdf:"+k+", cube:"+l+"",
                        name:"x:"+json[i][j][k][l].origin[0]*scale+", y:"+json[i][j][k][l].origin[2]*scale+", z:"+(json[i][j][k][l].origin[1]*scale+1.0),
                        level:4,
                        order:order
                    });
                    setup.edges.push({source: "["+i+","+j+","+k+"]", target: "["+i+","+j+","+k+","+l+"]"});

                    


                }
                order++;
            }
        }
    }

    maxOrder=order;

    return buildList;
}

// the one for the simulation
function createBuildList1(json, setup, scale){
    var offset2=12;
    var offset=offset2+8;
    var buildSize=32;
    var gridSize=buildSize+2*(offset);
    var opacity=0.9;
    var order1=0;


    var voxelIndexList=[
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
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(0,1,0),
                new THREE.Vector3(1,0,0),
                new THREE.Vector3(1,1,0),
                new THREE.Vector3(0,0,1),
                new THREE.Vector3(0,1,1),
                new THREE.Vector3(1,0,1),
                new THREE.Vector3(1,1,1)
            ]
    
        },
        null,
        {
            size:4,
            list:[
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(0,1,0),
                new THREE.Vector3(0,2,0),
                new THREE.Vector3(0,3,0),
    
                new THREE.Vector3(1,0,0),
                new THREE.Vector3(1,1,0),
                new THREE.Vector3(1,2,0),
                new THREE.Vector3(1,3,0),
    
                new THREE.Vector3(2,0,0),
                new THREE.Vector3(2,1,0),
                new THREE.Vector3(2,2,0),
                new THREE.Vector3(2,3,0),
    
                new THREE.Vector3(3,0,0),
                new THREE.Vector3(3,1,0),
                new THREE.Vector3(3,2,0),
                new THREE.Vector3(3,3,0),
    
    
                new THREE.Vector3(0,0,1),
                new THREE.Vector3(0,1,1),
                new THREE.Vector3(0,2,1),
                new THREE.Vector3(0,3,1),
    
                new THREE.Vector3(1,0,1),
                // new THREE.Vector3(1,1,1),
                // new THREE.Vector3(1,2,1),
                new THREE.Vector3(1,3,1),
    
                new THREE.Vector3(2,0,1),
                // new THREE.Vector3(2,1,1),
                // new THREE.Vector3(2,2,1),
                new THREE.Vector3(2,3,1),
    
                new THREE.Vector3(3,0,1),
                new THREE.Vector3(3,1,1),
                new THREE.Vector3(3,2,1),
                new THREE.Vector3(3,3,1),
    
                new THREE.Vector3(0,0,2),
                new THREE.Vector3(0,1,2),
                new THREE.Vector3(0,2,2),
                new THREE.Vector3(0,3,2),
    
                new THREE.Vector3(1,0,2),
                // new THREE.Vector3(1,1,2),
                // new THREE.Vector3(1,2,2),
                new THREE.Vector3(1,3,2),
    
                new THREE.Vector3(2,0,2),
                // new THREE.Vector3(2,1,2),
                // new THREE.Vector3(2,2,2),
                new THREE.Vector3(2,3,2),
    
                new THREE.Vector3(3,0,2),
                new THREE.Vector3(3,1,2),
                new THREE.Vector3(3,2,2),
                new THREE.Vector3(3,3,2),
    
    
                new THREE.Vector3(0,0,3),
                new THREE.Vector3(0,1,3),
                new THREE.Vector3(0,2,3),
                new THREE.Vector3(0,3,3),
    
                new THREE.Vector3(1,0,3),
                new THREE.Vector3(1,1,3),
                new THREE.Vector3(1,2,3),
                new THREE.Vector3(1,3,3),
    
                new THREE.Vector3(2,0,3),
                new THREE.Vector3(2,1,3),
                new THREE.Vector3(2,2,3),
                new THREE.Vector3(2,3,3),
    
                new THREE.Vector3(3,0,3),
                new THREE.Vector3(3,1,3),
                new THREE.Vector3(3,2,3),
                new THREE.Vector3(3,3,3),
                
            ]
    
        }
    
    ];

    var totalNumber=0;


    var shift=gridSize/2.0;

    var buildList={
        currentZIndex:0,
        maxZIndex:json.length,
        listZ:[],
        done:false,
        availablePickup:[],
        listToBuild:[]

    };
    // todo multiply by 4 as smallest size in cubeCone is 0.25
    // y is z and z is y
    // shift z by 1 cause sacrificial layer is 0
    // shift x and y to not have negative values

    for(var i=0;i<json.length;i++){ //for each z layer bin
        buildList.listZ.push({
                layerZ:json[i][0][0][0].origin[1]*scale+1,
                done:false,
                currentSizeIndex:0,
                maxSizeIndex:json[i].length,
                listSize:[]
            });
        for(var j=0;j<json[i].length;j++){ //for each size bin
            buildList.listZ[i].listSize.push({
                size:json[i][j][0][0].widths[0]*scale,
                layerZ:buildList.listZ[i].layerZ,
                done:false,
                currentSDFIndex:0,
                maxSDFIndex:json[i][j].length,
                listSDF:[]
                
            });
            for(var k=0;k<json[i][j].length;k++){ //for each sdf bin (signed distance field)
                buildList.listZ[i].listSize[j].listSDF.push({
                    sdfRank:k,
                    layerZ:buildList.listZ[i].layerZ,
                    size:buildList.listZ[i].listSize[j].size,
                    done:false,
                    currentCubeIndex:0,
                    maxCubeIndex:json[i][j][k].length,
                    listCubes:[]
                    
                    
                });
                
                for(var l=0;l<json[i][j][k].length;l++){ //for each cube add location (todo check if int)
                    var stockBuilt=false;
                    totalNumber+=(buildList.listZ[i].listSize[j].size*buildList.listZ[i].listSize[j].size*buildList.listZ[i].listSize[j].size)

                    if(buildList.listZ[i].listSize[j].size==1){
                        stockBuilt=true;
                    }
                    buildList.listZ[i].listSize[j].listSDF[k].listCubes.push({
                        layerZ:buildList.listZ[i].layerZ,
                        size:buildList.listZ[i].listSize[j].size,
                        sdfRank:buildList.listZ[i].listSize[j].listSDF[k].sdfRank,
                        done:false,
                        stockBuilt:stockBuilt,
                        stockAssigned:false,
                        stockPickedUp:false,
                        position:new THREE.Vector3(
                            json[i][j][k][l].origin[0]*scale+shift,
                            json[i][j][k][l].origin[2]*scale+shift,
                            json[i][j][k][l].origin[1]*scale+1)
                    });
                    var nomSize=buildList.listZ[i].listSize[j].size;
                    var x=json[i][j][k][l].origin[0]*scale;
                    var y=json[i][j][k][l].origin[1]*scale;
                    var z=json[i][j][k][l].origin[2]*scale;

                    // if(true){
                    // if(json[i][j][k][l].origin[2]*scale+nomSize/2.0<0){
                    if(json[i][j][k][l].origin[2]*scale+nomSize/2.0<0 || json[i][j][k][l].origin[0]*scale+nomSize/2.0<0){
                        setup.nodes.push({
                            id:"["+nomSize+","+x+","+y+","+z+"]",
                            position:{
                                x:x+nomSize/2.0,
                                y:y+nomSize/2.0,
                                z:z+nomSize/2.0
                            },
                            displacement:{
                                x:0,
                                y:0,
                                z:0
                            },
                            nomSize:nomSize,
                            orgNomSize:nomSize,
                            viz:opacity,
                            order:order1
                        });

                        addEdge(setup,nomSize,nomSize,x,y,z,opacity);

                        if(nomSize==2){
                            for(var ii=0;ii<voxelIndexList[2].list.length;ii++){
                                var nomSize1=1;
                                var x1=x+voxelIndexList[2].list[ii].x;
                                var y1=y+voxelIndexList[2].list[ii].y;
                                var z1=z+voxelIndexList[2].list[ii].z;
                    
                                setup.nodes.push({
                                    id:"["+nomSize1+","+x1+","+y1+","+z1+"]",
                                    position:{
                                        x:x1+nomSize1/2.0,
                                        y:y1+nomSize1/2.0,
                                        z:z1+nomSize1/2.0
                                    },
                                    displacement:{
                                        x:0,
                                        y:0,
                                        z:0
                                    },
                                    nomSize:nomSize1,
                                    orgNomSize:nomSize,
                                    viz:0.0,
                                    order:order1
                                });

                                addEdge(setup,nomSize1,nomSize,x1,y1,z1,0);

                            }
                        }

                        
                        if(nomSize==4){
                            for(var ii=0;ii<voxelIndexList[4].list.length;ii++){
                                var nomSize1=1;
                                var x1=x+voxelIndexList[4].list[ii].x;
                                var y1=y+voxelIndexList[4].list[ii].y;
                                var z1=z+voxelIndexList[4].list[ii].z;
                    
                                setup.nodes.push({
                                    id:"["+nomSize1+","+x1+","+y1+","+z1+"]",
                                    position:{
                                        x:x1+nomSize1/2.0,
                                        y:y1+nomSize1/2.0,
                                        z:z1+nomSize1/2.0
                                    },
                                    displacement:{
                                        x:0,
                                        y:0,
                                        z:0
                                    },
                                    nomSize:nomSize1,
                                    orgNomSize:nomSize,
                                    viz:0.0,
                                    order:order1
                                });

                                addEdge(setup,nomSize1,nomSize,x1,y1,z1,0);
                            }

                        }
                    }
                }
                order1++;
            }
        }
    }

    console.log("total number of blocks="+totalNumber)


    maxOrder=order1;
    console.log(maxOrder)
    return buildList;
}

//the original one
function createBuildList2(json, setup, scale,buildSize){
    var offset2=12;
    var offset=offset2+8;
    var gridSize=buildSize+2*(offset);


    voxelIndexList=[
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
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(0,1,0),
                new THREE.Vector3(1,0,0),
                new THREE.Vector3(1,1,0),
                new THREE.Vector3(0,0,1),
                new THREE.Vector3(0,1,1),
                new THREE.Vector3(1,0,1),
                new THREE.Vector3(1,1,1)
            ]
    
        },
        null,
        {
            size:4,
            list:[
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(0,1,0),
                new THREE.Vector3(0,2,0),
                new THREE.Vector3(0,3,0),
    
                new THREE.Vector3(1,0,0),
                new THREE.Vector3(1,1,0),
                new THREE.Vector3(1,2,0),
                new THREE.Vector3(1,3,0),
    
                new THREE.Vector3(2,0,0),
                new THREE.Vector3(2,1,0),
                new THREE.Vector3(2,2,0),
                new THREE.Vector3(2,3,0),
    
                new THREE.Vector3(3,0,0),
                new THREE.Vector3(3,1,0),
                new THREE.Vector3(3,2,0),
                new THREE.Vector3(3,3,0),
    
    
                new THREE.Vector3(0,0,1),
                new THREE.Vector3(0,1,1),
                new THREE.Vector3(0,2,1),
                new THREE.Vector3(0,3,1),
    
                new THREE.Vector3(1,0,1),
                // new THREE.Vector3(1,1,1),
                // new THREE.Vector3(1,2,1),
                new THREE.Vector3(1,3,1),
    
                new THREE.Vector3(2,0,1),
                // new THREE.Vector3(2,1,1),
                // new THREE.Vector3(2,2,1),
                new THREE.Vector3(2,3,1),
    
                new THREE.Vector3(3,0,1),
                new THREE.Vector3(3,1,1),
                new THREE.Vector3(3,2,1),
                new THREE.Vector3(3,3,1),
    
                new THREE.Vector3(0,0,2),
                new THREE.Vector3(0,1,2),
                new THREE.Vector3(0,2,2),
                new THREE.Vector3(0,3,2),
    
                new THREE.Vector3(1,0,2),
                // new THREE.Vector3(1,1,2),
                // new THREE.Vector3(1,2,2),
                new THREE.Vector3(1,3,2),
    
                new THREE.Vector3(2,0,2),
                // new THREE.Vector3(2,1,2),
                // new THREE.Vector3(2,2,2),
                new THREE.Vector3(2,3,2),
    
                new THREE.Vector3(3,0,2),
                new THREE.Vector3(3,1,2),
                new THREE.Vector3(3,2,2),
                new THREE.Vector3(3,3,2),
    
    
                new THREE.Vector3(0,0,3),
                new THREE.Vector3(0,1,3),
                new THREE.Vector3(0,2,3),
                new THREE.Vector3(0,3,3),
    
                new THREE.Vector3(1,0,3),
                new THREE.Vector3(1,1,3),
                new THREE.Vector3(1,2,3),
                new THREE.Vector3(1,3,3),
    
                new THREE.Vector3(2,0,3),
                new THREE.Vector3(2,1,3),
                new THREE.Vector3(2,2,3),
                new THREE.Vector3(2,3,3),
    
                new THREE.Vector3(3,0,3),
                new THREE.Vector3(3,1,3),
                new THREE.Vector3(3,2,3),
                new THREE.Vector3(3,3,3),
                
            ]
    
        }
    
    ];

    var shift=gridSize/2.0;

    var buildList={
        currentZIndex:0,
        maxZIndex:json.length,
        listZ:[],
        done:false,
        availablePickup:[],
        listToBuild:[]

    };
    // todo multiply by 4 as smallest size in cubeCone is 0.25
    // y is z and z is y
    // shift z by 1 cause sacrificial layer is 0
    // shift x and y to not have negative values
    var totalNumber=0;
    for(var i=0;i<json.length;i++){ //for each z layer bin
        buildList.listZ.push({
                layerZ:json[i][0][0][0].origin[1]*scale+1,
                done:false,
                currentSizeIndex:0,
                maxSizeIndex:json[i].length,
                listSize:[]
            });
        for(var j=0;j<json[i].length;j++){ //for each size bin
            buildList.listZ[i].listSize.push({
                size:json[i][j][0][0].widths[0]*scale,
                layerZ:buildList.listZ[i].layerZ,
                done:false,
                currentSDFIndex:0,
                maxSDFIndex:json[i][j].length,
                listSDF:[]
                
            });
            for(var k=0;k<json[i][j].length;k++){ //for each sdf bin (signed distance field)
                buildList.listZ[i].listSize[j].listSDF.push({
                    sdfRank:k,
                    layerZ:buildList.listZ[i].layerZ,
                    size:buildList.listZ[i].listSize[j].size,
                    done:false,
                    currentCubeIndex:0,
                    maxCubeIndex:json[i][j][k].length,
                    listCubes:[]
                    
                    
                });
                
                for(var l=0;l<json[i][j][k].length;l++){ //for each cube add location (todo check if int)
                    var stockBuilt=false;
                    totalNumber+=(buildList.listZ[i].listSize[j].size*buildList.listZ[i].listSize[j].size*buildList.listZ[i].listSize[j].size)
                    if(buildList.listZ[i].listSize[j].size==1){
                        stockBuilt=true;
                    }
                    buildList.listZ[i].listSize[j].listSDF[k].listCubes.push({
                        layerZ:buildList.listZ[i].layerZ,
                        size:buildList.listZ[i].listSize[j].size,
                        sdfRank:buildList.listZ[i].listSize[j].listSDF[k].sdfRank,
                        done:false,
                        stockBuilt:stockBuilt,
                        stockAssigned:false,
                        stockPickedUp:false,
                        position:new THREE.Vector3(
                            json[i][j][k][l].origin[0]*scale+shift,
                            json[i][j][k][l].origin[2]*scale+shift,
                            json[i][j][k][l].origin[1]*scale+1)
                    });
                    
                }
            }
        }
    }
    console.log("total number of blocks="+totalNumber)

    return buildList;
}



/////////////utils////////////////////

function addEdge(setup,nomSize,orgNomSize,x,y,z,viz){

    // var source="["+nomSize+","+x+","+y+","+z+"]";

    // for(var i=-1;i<2;i++){
    //     for(var j=-1;j<2;j++){
    //     for(var k=-1;k<2;k++){
    //         if(((i==0&&j==0)||(i==0&&k==0)||(j==0&&k==0))){ //not same voxel and no diagonals
    //         if(!(i==0&&j==0&&k==0)){
    //             var x1=x+i*nomSize;
    //             var y1=y+j*nomSize;
    //             var z1=z+k*nomSize;
    //             var target="["+nomSize+","+x1+","+y1+","+z1+"]";
    //             var node=setup.nodes.find(v => v.id === target);
    //             if(node!==undefined){
    //             if(!(viz==0&&node.viz==0)){
    //                 setup.edges.push({ id: 'e'+setup.edges.length, source: source, target: target ,stress:0 });

    //             }
    //             if(orgNomSize!=node.orgNomSize){
    //                 setup.edges.push({ id: 'e'+setup.edges.length, source: source, target: target ,stress:0 });
    //             }
    //             }
    //         }
    //         }
    //     }
    //     }
    // }

}

function getColor(value,min, max,colormap){
    var val=map(value,min,max,1.0,0.5);
    color=interpolateLinearly(val, colormap);
    // return new THREE.Color(color[0],color[1],color[2]);
    return new THREE.Color(color[0],color[1],color[2]).getHex();

}

function getColor11(value,min, max,colormap){
    var val=map(value,min,max,0.2,1.0);
    color=interpolateLinearly(val, colormap);
    c=new THREE.Color(color[0],color[1],color[2]);
    // console.log(c.getHexString())

    // return new THREE.Color(color[0],color[1],color[2]);
    return new THREE.Color(color[0],color[1],color[2]).getHexString();

}

function interpolateLinearly(x, values) {
	// Split values into four lists
	var x_values = [];
	var r_values = [];
	var g_values = [];
	var b_values = [];
	for (i in values) {
		x_values.push(values[i][0]);
		r_values.push(values[i][1][0]);
		g_values.push(values[i][1][1]);
		b_values.push(values[i][1][2]);
	}
	var i = 1;
	while (x_values[i] < x) {
		i = i+1;
	}
	i = i-1;
	var width = Math.abs(x_values[i] - x_values[i+1]);
	var scaling_factor = (x - x_values[i]) / width;
	// Get the new color values though interpolation
	var r = r_values[i] + scaling_factor * (r_values[i+1] - r_values[i])
	var g = g_values[i] + scaling_factor * (g_values[i+1] - g_values[i])
	var b = b_values[i] + scaling_factor * (b_values[i+1] - b_values[i])
	return [enforceBounds(r), enforceBounds(g), enforceBounds(b)];
}

function enforceBounds(x) {
	if (x < 0) {
		return 0;
	} else if (x > 1){
		return 1;
	} else {
		return x;
	}
}

function map (value, x1, y1, x2, y2) {
	return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
}
    
    
  
  
