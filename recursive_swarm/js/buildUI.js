

var voxelSpacing=3.0;
var three='webgl';
var speed=10000;
var offset=6;
var buildSize=12;
var gridSize=buildSize+2*offset;

var robotLocations=[
    [new THREE.Vector3(offset+0           ,offset+1          ,0)      ,new THREE.Vector3(offset+0           ,offset+0           ,0),  1 ],
    [new THREE.Vector3(offset+0           ,gridSize-offset-1 ,0)      ,new THREE.Vector3(offset+0           ,gridSize-offset-2  ,0),  1 ],
    [new THREE.Vector3((gridSize-offset-2),offset+1          ,0)      ,new THREE.Vector3((gridSize-offset-2),offset+0           ,0),  1 ],
    [new THREE.Vector3((gridSize-offset-2),gridSize-offset-1 ,0)      ,new THREE.Vector3((gridSize-offset-2),(gridSize-offset-2),0),  1 ],
    [new THREE.Vector3((offset+2)          ,(offset+4)         ,0)   ,new THREE.Vector3((offset+0)          ,(offset+4)           ,0) ,2 ]
];

var depositLocations=[
    [new THREE.Vector3(offset+0            ,offset+0           ,0)     ,new THREE.Vector3(-2,-2,0)],
    [new THREE.Vector3(offset+0            ,(gridSize-offset-2),  0)   ,new THREE.Vector3(-2,2,0) ],
    [new THREE.Vector3(gridSize-offset-2     ,offset+0           ,0)   ,new THREE.Vector3(2,-2,0) ],
    [new THREE.Vector3(gridSize-offset-2     ,(gridSize-offset-2),  0) ,new THREE.Vector3(2,2,0)  ],
    [new THREE.Vector3(0            ,gridSize/2.0           ,0),new THREE.Vector3(0,0,0)]
];
var hierarchical=true;

var buildType=["frepCube","frep","directions","list","sdfList"];

var buildList,recursiveSwarms;

$.getJSON("../asdf/json/cubeCone.json", function(json) {
    console.log(json);
    //todo move this to other document
    var scale=4.0;
    var shift=12.0;
    buildList={
        currentSizeIndex:0,
        maxSizeIndex:json.length,
        done:false,
        availablePickup:[],
        listSize:[]

    };

    // todo multiply by 4 as smallest size in cubeCone is 0.25
    // y is z and z is y
    // shift z by 1 cause sacrificial layer is 0
    // shift x and y to not have negative values

    for(var i=0;i<json.length;i++){ //for each z layer bin
        buildList.listSize.push({
                size:json[i][0][0][0].widths[0]*scale,
                done:false,
                currentZIndex:0,
                maxZIndex:json[i].length,
                listZ:[],
            });
        for(var j=0;j<json[i].length;j++){ //for each size bin
            buildList.listSize[i].listZ.push({

                size:buildList.listSize[i].size,
                layerZ:json[i][j][0][0].origin[1]*scale+1,

                done:false,
                currentSDFIndex:0,
                maxSDFIndex:json[i][j].length,
                listSDF:[]
                
            });
            for(var k=0;k<json[i][j].length;k++){ //for each sdf bin (signed distance field)
                buildList.listSize[i].listZ[j].listSDF.push({
                    sdfRank:k,
                    layerZ:buildList.listSize[i].listZ[j].layerZ,
                    size:buildList.listSize[i].size,
                    done:false,
                    currentCubeIndex:0,
                    maxCubeIndex:json[i][j][k].length,
                    listCubes:[]
                    
                    
                });

                for(var l=0;l<json[i][j][k].length;l++){ //for each cube add location (todo check if int)
                    var stockBuilt=false;
                    if(buildList.listSize[i].size==1){
                        stockBuilt=true;
                    }
                    buildList.listSize[i].listZ[j].listSDF[k].listCubes.push({
                        layerZ:buildList.listSize[i].listZ[j].layerZ,
                        size:buildList.listSize[i].size,
                        sdfRank:buildList.listSize[i].listZ[j].listSDF[k].sdfRank,
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

    console.log(buildList)

    buildList=createBuildList (json,scale,shift);

    var setup={
        three:'webgl',
        voxelSpacing:3.0,
        viz:{
            speed:500,
            showGUI:false,
            saveAngleData:false,
        },
        robotGeometry:{
            leg1:5,
            leg2:5,
            offset:2
        },
        path:{
            showPath:false,
            number:20, //number of divisions/points 
            cHeight:1.5 //parabola height (will be multiplied later by voxelSpacing)

        },
        robotLocations:robotLocations,
        depositLocations:depositLocations,
        hierarchical:true,
        buildType:"sdfList",
        buildList:buildList ,
        gridSize:gridSize,
        

    };

    

    recursiveSwarms=new Swarm(setup);

});




