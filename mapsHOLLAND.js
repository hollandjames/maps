//initalises map
function initialize() {
  var mapOptions = {
    center: new google.maps.LatLng(55, 55),
    zoom: 4,
    mapTypeId: google.maps.MapTypeId.HYBRID
  };
//assigns map to html
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  return map;
}

// array of different marker colours
var markerColours = [
  "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
  "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
  "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
  "http://maps.google.com/mapfiles/ms/icons/purple-dot.png"
];

function promptUser()
{
  var lat = parseInt(prompt("Please enter a latitude:"));
  var lng = parseInt(prompt("Please enter a longitude:"));
  var coords = {
    lat: lat,
    lng: lng
  };

  return coords;

}
//iterator for the markerColours array
var j = 0;
// places marker at location of users choice, each marker is represented by an icon in the array
function moveToLocation() {

coords = promptUser();

  var marker = new google.maps.Marker({
    position: coords,
    map: map,
    icon: markerColours[j],
    });
  //to iterate through the array
  j += 1;

  if (j == markerColours.length) {
    j = 0;
  }
  map.panTo(coords);
}


var coordArray = [];
var ranLat = null; //55
var ranLng = null; //55
//works out distance between two points using spherical library
function calcDistance(fromLat, fromLng, toLat, toLng) {
  return google.maps.geometry.spherical.computeDistanceBetween(
    new google.maps.LatLng(fromLat, fromLng),
    new google.maps.LatLng(toLat, toLng)
  );
}
//function to calculate a random latitude
function calcLat() {
  return (
    //returns a random number which is either positive or negative , i use this scale to ensure sufficient precision for lat/lng parameters
    (Math.random() < 0.5 ? -1 : 1) *
    (Math.floor(Math.random() * 8500000) + 0) /
    100000
  );
}
//function to calculate a random longitude
function calcLng() {
  return (
    (Math.random() < 0.5 ? -1 : 1) *
    (Math.floor(Math.random() * 17800000) + 0) /
    100000
  );
}

//function to place new marker at location greater than 100m for the previous
function geolocationLimiter() {

  if (coordArray.length == 0) {//if no previous marker exists, create a new one and push to array
    ranLat = calcLat();
    ranLng = calcLng();

    coordArray.push(ranLat, ranLng);
//places marker using parameters saved to the array
    new google.maps.Marker({
      position: { lat: coordArray[0], lng: coordArray[1]},
      title: 'this is the first marker',
      map: map
    });
    map.panTo({ lat: ranLat, lng: ranLng });
    // if array not empty create new random location
  } else if (!coordArray.length == 0) {
    ranLat = calcLat();
    ranLng = calcLng();

    //works out distance in km between saved location in array

    var distance =
      calcDistance(coordArray[0], coordArray[1], ranLat, ranLng) / 1000;
//keeps generating random numbers until the distance is greater than 100km
    while (distance <= 100) {
      //console.log("the distance is less than 100");
      ranLat = calcLat();
      ranLng = calcLng();

      distance =
        calcDistance(coordArray[0], coordArray[1], ranLat, ranLng) / 1000;
    }

// if distance greater than 100 a new marker is placed

    if (distance > 100) {

      //console.log("the distance is  greater than 100");
      new google.maps.Marker({
        position: { lat: ranLat, lng: ranLng },
        title:'this marker is ' + distance.toFixed(0).toString() + ' metres from the previous marker' ,
        map: map
      });
      map.panTo({ lat: ranLat, lng: ranLng });
      //empties the array of markers to make distance comparison easier
     coordArray=[];
     //adds the most recent marker coordinates into the array
     coordArray.push(ranLat,ranLng);
    }
  }
}
//pans user to random place and puts marker there
function panToSomePlace() {
 //creates random location using calc methods
var currMarker = i+1; //used to track the current marker
  var randomLocation = new google.maps.LatLng(calcLat(), calcLng());
  var arrayMarker = new google.maps.Marker({
    position: randomLocation,
    animation: google.maps.Animation.DROP,
    title:'this is marker ' + currMarker,
    map: map

  });
//adds new marker to the array
  moreMarkers.push(arrayMarker);
  //goes to new marker location
  map.panTo(randomLocation);
  //calls the original function to add listener
  clickMarker();
}

var i = 0;
var g = false;
var moreMarkers = [];

function clickMarker() {
  if (g == false) { //if a marker doesnt already exist create a new one

    //ask user for coords
    coords = promptUser();

    var userInput = new google.maps.Marker({
      position: coords,
      animation: google.maps.Animation.DROP,
      title: 'this is marker 1',
      map: map
    });

    moreMarkers.push(userInput);
    g=true;

}
  //adds listener to the users marker

  for (i = i; i < moreMarkers.length + 1; i++) {
    //only adds one listener to the current marker
    google.maps.event.addListenerOnce(moreMarkers[i], "click", function() {
      panToSomePlace();
      i += 1;
    });
  }
}
// object contains place IDs
var monuments ={
  stoneHenge: 'ChIJEfYKhTvmc0gR3dLTvOJwkZc',
  towerOfPiza: 'ChIJzYhOxKaR1RIRA_xU1bGp7DI',
  eiffelTower: 'ChIJrbS_8-Fv5kcRzSjPvnUT03s'
   };

var footballStadiums ={
  milan: 'ChIJnfEj-pPBhkcREvPvegzTxwk',
  arsenal: 'ChIJuaX4rXcbdkgRX7nJ4iCVzT0',
  realMadrid : 'ChIJn9MFN-IoQg0RiBkrbtL2_6g'
};

var monumentArray = [monuments.stoneHenge,monuments.towerOfPiza,monuments.eiffelTower];
var stadiumArray = [footballStadiums.milan,footballStadiums.arsenal,footballStadiums.realMadrid];
var selectedArray = [];
var infowindow = new google.maps.InfoWindow();
//this function populates an area with a streetview and text in an information window, in the user selected locations
function populateArea() {

  var service = new google.maps.places.PlacesService(map);

//finds the current selected option from the HTML
  var chosenPlace = document.getElementById("chooseArea");
  var chosenPlaceSelection= chosenPlace.options[chosenPlace.selectedIndex].value;
  console.log(chosenPlaceSelection);
  if (chosenPlaceSelection =="monuments")
  {
    selectedArray = monumentArray;
  }
  else if (chosenPlaceSelection =="stadiums"){
    selectedArray = stadiumArray;
  }
  else{
    selectedArray = stadiumArray.concat(monumentArray);
  }
  //iterates through the user selection and uses get details method to find info about the location
for (var i =0; i<selectedArray.length;i++){
  service.getDetails({
    placeId: selectedArray[i]
  }, function(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) { //creating marker at each location in array
      var marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        title:place.vicinity,
        position: place.geometry.location
      });


    google.maps.event.addListener(marker, 'click', function() {
    //adding content to the markers infowindow using the places library
    infowindow.setContent('<div id ="locationText" >' + place.formatted_address + place.geometry.location + '<div id ="ndiv">  </div> </div>');
    //adding streetview of the selected location
    var sv = new google.maps.StreetViewService();
    sv.getPanorama({location:(place.geometry.location),radius:50},processSVData);


      infowindow.open(map, this);
      });
    }
  });
}
}

function processSVData(data,status){
  if (status==="OK"){
    //appending the image to the infowindow
    panorama = new google.maps.StreetViewPanorama(document.getElementById('ndiv'));
    panorama.setPosition(data.location.latLng);
    panorama.setPov(({
      heading:265,
      pitch:0
    }));
  }

  else{
    alert('Street view data not found for this location');
  }
}
// generic function to place a marker on a map given a latlng
function placeMarker(map, location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
}
//creates a region based on user input
function createRegion() {
  var area = new google.maps.MVCArray();//creates an array of points of the polygon

  var polygon = new google.maps.Polygon({//creates the shape based on the contents of the MVCarray
    path: area,
    strokeOpacity: 0.7,
    strokeColor: "red",
    fillColor: "blue",

    strokeWeight: 2
  });

  polygon.setMap(map);//sets the polygon to the map
//map listener for user click input to create polygon
  drawListener = google.maps.event.addListener(map, "click", function(e) {
    var path = polygon.getPath();
    path.push(e.latLng);
  });
//mouse in/out events to change polygon colour
  google.maps.event.addListener(polygon, "mouseout", function(e) {
    polygon.setOptions({
      fillColor: "blue",
      fillOpacity: 0.3,
      strokeColor: "gray"
    });
  });
  google.maps.event.addListener(polygon, "mouseover", function(e) {
    polygon.setOptions({
      fillColor: "red",
      fillOpacity: 0.3,
      strokeColor: "blue"
    });
  });
//mouse event to place marker inside polygon
  google.maps.event.addListener(polygon, "mousemove", function(e) {
    placeMarker(map, e.latLng);
  });
}
//function to create a marker with streetview
function createMarkerWithView(location)
{
  var marker = new google.maps.Marker({
    map: map,
    animation: google.maps.Animation.DROP,
    position:location
  });
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent('<div id="ndiv">   </div>');
  var sv = new google.maps.StreetViewService();
  sv.getPanorama({location:(location),radius:50},processSVData);
  infowindow.open(map, this);

  });

}
//origin and destination addresses for the directions service and distance matrix methods
var request = {
  origin: new google.maps.LatLng(51.504709, -0.085981),
  destination: new google.maps.LatLng(51.507351, -0.127758),
};

var directionsDisplay = new google.maps.DirectionsRenderer({
  polylineOptions:{
    strokeColor: ''},
    suppressMarkers: true // removes the default markers


});


var directionsService = new google.maps.DirectionsService();
var service = new google.maps.DistanceMatrixService();

function displayPaths() {

var travelSelection = document.getElementById("chooseTravel").value;
//change travelmode based on user selection
switch (travelSelection)
{
case "bicycling":
directionsDisplay.polylineOptions.strokeColor ="red";
request.travelMode ="BICYCLING";
break;

case "driving":
directionsDisplay.polylineOptions.strokeColor ="blue";
request.travelMode ="DRIVING";
break;

case "walking":
directionsDisplay.polylineOptions.strokeColor ="green";
request.travelMode ="WALKING";
break;

case "transit":
directionsDisplay.polylineOptions.strokeColor ="blue";
request.travelMode ="TRANSIT";
break;
}

findPaths();
}

function findPaths()
{//gets info about the journey distance + duration
  service.getDistanceMatrix(
    {
      origins: [request.origin],
      destinations: [request.destination],
      travelMode: request.travelMode
   }, callback);

  function callback(response, status) {
    if (status == 'OK') {
      var origins = response.originAddresses;
      var destinations = response.destinationAddresses;
   // an array of of objects returned from getDistanceMatrix method , contains 1 row for origin address passed in req
        var results = response.rows[0].elements;
       //accessing the object containing the results
          var element = results[0];
          //distance of journey
          var distance = element.distance.text;
          //duration of journey
          var duration = element.duration.text;

  document.getElementById("journey").innerHTML= '<b>Journey Details</b> </br> From: ' + origins[0]  + '</br> To: ' + destinations[0] + '</br> Distance: ' + distance +
  '</br> Duration: ' + duration + '</br> Transport: ' + request.travelMode.toLowerCase();

      }
    }
    //display route of journey on map
  directionsService.route(request, function(response, status) {
    if (status == "OK") {

      directionsDisplay.setDirections(response);
      directionsDisplay.setMap(map);
      directionsDisplay.setPanel(document.getElementById('directionsPanel'));
      createMarkerWithView(request.origin);
      createMarkerWithView(request.destination);


    } else {
      window.alert("Directions request failed due to " + status);
    }

  });
  }
google.maps.event.addDomListener(window, "load", initialize);
