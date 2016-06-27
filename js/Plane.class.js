'use strict';

const KEY_PLANES = 'planes';

$(document).ready(()=>{

    Plane.render();

});
// This is a constructor function
function Plane(model, sitsCount, id) {
    this.model = model;
    this.sitsCount = +sitsCount;
    //this.pin = randomPin();
    this.id = (id) ? id : Plane.nextId();
}

// static methods:

Plane.nextId = function () {
    let result = 1;
    let jsonPlanes = Plane.loadJSONFromStorage();
    if (jsonPlanes.length) result = jsonPlanes[jsonPlanes.length - 1].id + 1;
    return result;
}

Plane.findById = function (pId) {
    let result = null;
    let planes = Plane.query()
        .filter(p => p.id === pId);
    if (planes.length) result = planes[0];
    return result;
}

Plane.loadJSONFromStorage = function () {
    let planes = getFromStorage(KEY_PLANES);
    if (!planes) planes = [];
    return planes;
}



Plane.query = function () {

    if (Plane.planes) return Plane.planes;
    let jsonPlanes = Plane.loadJSONFromStorage();

    Plane.planes = jsonPlanes.map(jsonPlane => {
        return new Plane(jsonPlane.model, jsonPlane.sitsCount, jsonPlane.id);
    })

    return Plane.planes;
}

Plane.save = function (formObj) {
    let planes = Plane.query();
    let plane;
	// console.log('formObj',formObj)
    if (formObj.pid) {
        plane = Plane.findById(+formObj.pid);
        plane.model = formObj.pmodel;
        plane.sitsCount = +formObj.psits;
    } else {
        plane = new Plane(formObj.pmodel, formObj.psits);
        planes.push(plane);
    }
    Plane.planes = planes;
    saveToStorage(KEY_PLANES, planes);
}

Plane.remove = function (pId, event) {
    event.stopPropagation();
    let planes = Plane.query();
    planes = planes.filter(p => p.id !== pId)
    saveToStorage(KEY_PLANES, planes);
    Plane.planes = planes;
    Plane.render();
}

Plane.render = function () {

    let planes = Plane.query();
//	console.log(p)
    var strHtml = planes.map(p => {
        return `<tr onclick="Plane.select(${p.id}, this)">
            <td>${p.id}</td>
            <td>${p.model}</td>
            <td>
                ${p.sitsCount}
            </td>
            <td>
                <button class="btn btn-danger" onclick="Plane.remove(${p.id}, event)">
                    <i class="glyphicon glyphicon-trash"></i>
                </button>
                 <button class="btn btn-info" onclick="Plane.editPlane(${p.id}, event)">
                    <i class="glyphicon glyphicon-edit"></i>
                </button>
            </td>
        </tr>`

    }).join(' ');
    $('.tblPlanes').html(strHtml);
}

Plane.select = function (pId, elRow) {
    $('.active.success').removeClass('active success');
    $(elRow).addClass('active success');
    $('.details').show();
    let p = Plane.findById(pId);
    //$('.pDetailsName').html(pId);
	//Flight.render(pId)
	//console.log(p.getAllFlights());
	let flights=p.getAllFlights();
	//console.log(flights[0])
	//console.log(flights.map(f => f.renderHTML()).join(' '));
	$('.tblFlightsOfPlane').html(flights.map(f => f.renderHTML()).join(' '));
}


Plane.savePlane = function () {
    var formObj = $('form').serializeJSON();
    console.log('formObj', formObj);


    Plane.save(formObj);
    Plane.render();
    $('#modalPlane').modal('hide');
}
Plane.editPlane = function (pId, event) {
    if (event) event.stopPropagation();
    if (pId) {
        let plane = Plane.findById(pId);
        $('#pid').val(plane.id);
        $('#pmodel').val(plane.model);
        $('#psits').val(plane.sitsCount);
    } else {
        $('#pid').val('');
        $('#pmodel').val('');
        $('#psits').val('');
    }


    $('#modalPlane').modal('show');

}
Plane.prototype.updateSeats =  function(){
    
}
Plane.prototype.getAllFlights = function(){
    let flights = Flight.query();
    let planeFlights = flights.filter(f => f.plane === this.id)
    return planeFlights;
}



