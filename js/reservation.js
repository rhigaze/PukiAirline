'use strict'

function searchFlights() {
	let relevantFlights = Flight.findBySourceAndDest($('#from').val(), $('#to').val());
	console.table(relevantFlights);
	$('.tblFlightSearch').html(relevantFlights.map(f => f.renderHTMLforReservation()).join(' '));
}

function makeReservation(flight) {
	alert('makeReservation(' + flight + ')');
}
