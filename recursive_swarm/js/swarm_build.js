// Amira Abdel-Rahman
// (c) Massachusetts Institute of Technology 2020

function createBuildList(json,scale,shift){ //layer first
	///layer first

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

    console.log(buildList)

    return buildList;
	
	
};

function createBuildListSize (json,scale,shift){ //size first

    //size first

    var buildList={
        currentSizeIndex:0,
        maxSizeIndex:json.length,
        done:false,
        availablePickup:[],
        listSize:[],
        listToBuild:[]

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

    return buildList;
	
	
	
};