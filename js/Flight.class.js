'use strict';

const KEY_FLIGHTS = 'flights';

// This is a constructor function
function Flight(src, to, date, plane, id) {
    this.id = (id) ? id : Flight.nextId();
    this.src = src;
    this.to = to;
    this.date = new Date(date);
    this.plane = +plane;
    this.passengers = [];
}

// static methods:
Flight.nextId = function () {
    let result = 1;
    let jsonFlight = Flight.loadJSONFromStorage();
    if (jsonFlight.length) result = jsonFlight[jsonFlight.length - 1].id + 1;
    return result;
}
Flight.loadJSONFromStorage = function () {
    let flights = getFromStorage(KEY_FLIGHTS);
    if (!flights) flights = [];
    return flights;
}
Flight.save = function (formObj) {
    let flights = Flight.query();
    let flight; 
    if (formObj.pid) {
        
        flight = Flight.findById(+formObj.pid);
        flight.src = formObj.pfrom;
        flight.to = formObj.pto;
        flight.date = new Date(formObj.pdate);
        flight.plane = +formObj.plane;
        
    } else {
        let flight = new Flight(formObj.pfrom, formObj.pto, formObj.pdate, formObj.plane);
   
        
        flights.push(flight);
    }
      Flight.flights = flights;
    saveToStorage(KEY_FLIGHTS, flights);

}
Flight.query = function () {

    if (Flight.flights) return Flight.flights;

    let jsonFlights = Flight.loadJSONFromStorage();
    Flight.flights = jsonFlights.map(jsonFlights => {
        return new Flight(jsonFlights.src, jsonFlights.to, jsonFlights.date, jsonFlights.plane, jsonFlights.id);
    })

    return Flight.flights;
}
Flight.remove = function (pId, event) {
    event.stopPropagation();
    let flights = Flight.query();
    flights = flights.filter(p => p.id !== pId)
    saveToStorage(KEY_FLIGHTS, flights);
    Flight.flights = flights;
    Flight.render();
}
Flight.findById = function (id) {
    let result = null;
    let flights = Flight.query().filter(f => f.id === id);
    if (flights.length) result = flights[0];
    return result;
}
Flight.render = function () {
    var flights = Flight.query();
    var strHtml = flights.map(f => {
        return `<tr>
                <td>${f.id} </td>
                <td>${f.src}</td>
                <td>${f.to}</td>
                <td>${moment(f.pdate).format('DD-MM-YYYY')}</td>
                <td>${f.plane}</td>
                <td>
                    <button class="btn btn-danger" onclick="Flight.remove(${f.id}, event)">
                        <i class="glyphicon glyphicon-trash"></i>
                    </button>
                    <button class="btn btn-info" onclick="Flight.edit(${f.id}, event)">
                        <i class="glyphicon glyphicon-edit"></i>
                    </button>
                </td>
                </tr>` }).join()

    $('.tblFlight').html(strHtml);
}

Flight.saveFlight = function () {
    var formObj = $('form').serializeJSON();
    Flight.save(formObj);
    Flight.render();
    $('#modalFlight').modal('hide');
}

Flight.edit = function (pId, event) {
    if (event) event.stopPropagation();
    if (pId) {
        let flight = Flight.findById(pId);
        $('#pid').val(flight.id);
        $('#from').val(flight.src);
        $('#to').val(flight.to);
        $('#pdate').val(moment(flight.date).format('YYYY-MM-DD'));
        $('#plane').val(flight.plane);
    } else {
        $('#pid').val('');
        $('#from').val('');
        $('#to').val('');
        $('#pdate').val('');
        $('#plane').val('');
    }


    $('#modalFlight').modal('show');

}
Flight.getAllPlane = function(){
    let planes = Plane.query();
    let planeOption = planes.map(p => {
        return `<option value="${p.id}" ></option>`;
    }).join('')
    $('#plane').html(planeOption);  
    
}
Flight.addPassengerToFlight = function(flightId , passId){
    let flight = Flight.findById(flightId);
    let passenger = Passenger.findById(passId);
    flight.addPassenger(passenger);
    passenger.addFlight(flight);
    
}
Flight.prototype.addPassenger = function(passenger){
   
    this.passengers.push(passenger.id)
  }
Flight.prototype.removePassenger = function (passenger) {
    if(this.passengers){
        let index = this.passengers.indexOf(passenger);
        this.passengers.splice(index , 1); 
    }
}

