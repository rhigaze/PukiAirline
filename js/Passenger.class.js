'use strict';

const KEY_PASSENGERS = 'passengers';

// This is a constructor function
function Passenger(name, birthdate, id) {
    this.name = name;
    this.birthdate = new Date(birthdate);
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
        return new Passenger(jsonPassenger.name, jsonPassenger.birthdate, jsonPassenger.id);
    })

    return Passenger.passengers;
}

Passenger.save = function (formObj) {
    let passengers = Passenger.query();
    let passenger;
    if (formObj.pid) {
        passenger = Passenger.findById(+formObj.pid);
        passenger.name = formObj.pname;
        passenger.birthdate = new Date(formObj.pdate);
    } else {
        passenger = new Passenger(formObj.pname, formObj.pdate);
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
            <td>${p.name}</td>
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
    $('.pDetailsName').html(p.name);
}


Passenger.savePassenger = function () {
    var formObj = $('form').serializeJSON();
    Passenger.save(formObj);
    Passenger.render();
    $('#modalPassenger').modal('hide');
}
Passenger.editPassenger = function (pId, event) {
    if (event) event.stopPropagation();
    if (pId) {
        let passenger = Passenger.findById(pId);
        $('#pid').val(passenger.id);
        $('#pname').val(passenger.name);
        $('#pdate').val(moment(passenger.birthdate).format('YYYY-MM-DD'));
    } else {
        $('#pid').val('');
        $('#pname').val('');
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
    this.flights.push(flight);
}
Passenger.prototype.removeFlight = function (flight) {
    if(this.flights){
        let index = this.flights.indexOf(flight);
        this.flights.splice(index , 1);
    } 
}




