'use strict';

const KEY_PASSENGERS = 'passengers';

// This is a constructor function
function Passenger(firstName, lastName, birthdate, phone, id) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.birthdate = new Date(birthdate);
    this.phone = phone;
    this.pin = randomPin();
    this.id = (id) ? id : Passenger.nextId();
    this.flights= [];
}

// static methods:

Passenger.nextId = function () {
    let result = 1;
    let jsonPassengers = Passenger.loadJSONFromStorage();
    if (jsonPassengers.length) result = jsonPassengers[jsonPassengers.length - 1].id + 1;
    return result;
}

Passenger.findById = function (pId) {
    let result = null;
    let passengers = Passenger.query()
        .filter(p => p.id === pId);
    if (passengers.length) result = passengers[0];
    return result;
}

Passenger.loadJSONFromStorage = function () {
    let passengers = getFromStorage(KEY_PASSENGERS);
    if (!passengers) passengers = [];
    return passengers;
}



Passenger.query = function () {

    if (Passenger.passengers) return Passenger.passengers;
    let jsonPassengers = Passenger.loadJSONFromStorage();

    Passenger.passengers = jsonPassengers.map(jsonPassenger => {
        return new Passenger(jsonPassenger.firstName ,jsonPassenger.lastName, jsonPassenger.birthdate,jsonPassenger.phone  , jsonPassenger.id);
    })

    return Passenger.passengers;
}

Passenger.save = function (formObj) {
    let passengers = Passenger.query();
    let passenger;
    if (formObj.pid) {
        passenger = Passenger.findById(+formObj.pid);
        passenger.firstName = formObj.pfname;
        passenger.lastName = formObj.plname;
        passenger.phone = formObj.phone;
        passenger.birthdate = new Date(formObj.pdate);
    } else {
        passenger = new Passenger(formObj.pfname , formObj.plname , formObj.pdate ,  formObj.phone);
       passengers.push(passenger);
    }
    Passenger.passengers = passengers;
    saveToStorage(KEY_PASSENGERS, passengers);
}

Passenger.remove = function (pId, event) {
    event.stopPropagation();
    let passengers = Passenger.query();
    passengers = passengers.filter(p => p.id !== pId)
    saveToStorage(KEY_PASSENGERS, passengers);
    Passenger.passengers = passengers;
    Passenger.render();
}

Passenger.render = function () {

    let passengers = Passenger.query();
    var strHtml = passengers.map(p => {
            return `<tr onclick="Passenger.select(${p.id}, this)">
            <td>${p.id}</td>
            <td>${p.firstName}</td>
            <td>${p.lastName}</td>
            <td>${p.phone}</td>
            <td>
                ${moment(p.birthdate).format('DD-MM-YYYY')}
                ${(p.isBirthday()) ? '<i class="glyphicon glyphicon-gift"></i>' : ''}
            </td>
            <td>
                <button class="btn btn-danger" onclick="Passenger.remove(${p.id}, event)">
                    <i class="glyphicon glyphicon-trash"></i>
                </button>
                 <button class="btn btn-info" onclick="Passenger.editPassenger(${p.id}, event)">
                    <i class="glyphicon glyphicon-edit"></i>
                </button>
            </td>
        </tr>`

    }).join(' ');
    $('.tblPassengers').html(strHtml);
}

Passenger.select = function (pId, elRow) {
    $('.active').removeClass('active success');
    $(elRow).addClass('active success');
    $('.details').show();
    let p = Passenger.findById(pId);
    $('.pDetailsName').html(p.firdtName + ' ' +p.lastName);
}


Passenger.savePassenger = function () {
    var formObj = $('form').serializeJSON();
    console.log('formObj' , formObj);
    
    Passenger.save(formObj);
    Passenger.render();
    $('#modalPassenger').modal('hide');
}
Passenger.editPassenger = function (pId, event) {
    if (event) event.stopPropagation();
    if (pId) {
        alert(pId);
        let passenger = Passenger.findById(pId);
        $('#pid').val(passenger.id);
        $('#pfname').val(passenger.firstName);
        $('#plname').val(passenger.lastName);
        $('#phone').val(passenger.phone);
        $('#pdate').val(moment(passenger.birthdate).format('YYYY-MM-DD'));
    } else {
        $('#pid').val('');
        $('#pfname').val('');
        $('#plname').val('');
        $('#phone').val('');
        $('#pdate').val('');
    }


    $('#modalPassenger').modal('show');

}

// instance methods:
Passenger.prototype.isBirthday = function () {
    let now = new Date();
    return (this.birthdate.getMonth() === now.getMonth() &&
        this.birthdate.getDate() === now.getDate());
}

Passenger.prototype.checkPin = function (pin) {
    return pin === this.pin;
}
Passenger.prototype.addFlight = function (flight) {
    this.flights.push(flight.id);
}
Passenger.prototype.getAllFlights = function (){
    let flights = Flight.query();
    let passengerFlights = flights.filter(f => f.passengers.includes(this.id));
    return passengerFlights;
}
Passenger.prototype.removeFlight = function (flight) {
    if(this.flights){
        let index = this.flights.indexOf(flight);
        this.flights.splice(index , 1);
    } 
}




