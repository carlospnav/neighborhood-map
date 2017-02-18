
//MODEL
function MapSettings() {
  this.initialCoords = { lat: 55.9485947, lng: -3.1999135 },
  this.locations = [
    { name: "The Meadows (park)", coords: { lat: 55.9412507 , lng: -3.191701 }, id: 0 },
    { name: "Edinburgh Castle", coords: { lat: 55.9485947 , lng: -3.1999135 }, id: 1 },
    { name: "University of Edinburgh", coords: { lat: 55.9443127 , lng: -3.1901937 }, id: 2 },
    { name: "Arthur's Seat", coords: { lat: 55.9440833 , lng: -3.1618333 }, id: 3 },
    { name: "Royal Observatory, Edinburgh", coords: { lat: 55.922879 , lng: -3.188129 }, id: 4 },
    { name: "Royal Botanic Garden Edinburgh", coords: { lat: 55.9652527, lng: -3.2092309 }, id: 5 },
    { name: "Princes Street", coords: { lat: 55.9515624, lng: -3.1995256 }, id: 6 },
    { name: "Royal Mile", coords: { lat: 55.95034200000001, lng: -3.1862966 }, id: 7 },
    { name: "Fettes College", coords: { lat: 55.9638319, lng: -3.2261655 }, id: 8 },
    { name: "Balmoral Hotel", coords: { lat: 55.9526566, lng: -3.189613 }, id: 9 },
    { name: "Scottish Parliament Building", coords: { lat: 55.9519727, lng: -3.1755668 }, id: 10 },
    { name: "Calton Hill", coords: { lat: 55.9553471, lng: -3.1825288 }, id: 11 },
    { name: "Grassmarket", coords: { lat: 55.9475383, lng: -3.1962969 }, id: 12 },
    { name: "Edinburgh Waverley railway station", coords: { lat: 55.9545669, lng: -3.1671449 }, id: 13 },
    { name: "Edinburgh Napier University", coords: { lat: 55.933459, lng: -3.2118371 }, id: 14 },
  ],
  this.styles = [{

  }]
}

var mapSettings = new MapSettings();



var map, markers, infowindow, populateInfoWindow;
function initMap(){
  //The Map is initialized here using the configuration we find in mapSettings.
  map = new google.maps.Map(document.getElementById('map'), {
    center: mapSettings.initialCoords,
    zoom: 13
  });

  //The initial PoI locations are created here and set to the map.
  markers = createMarkersFromLocations(mapSettings.locations);
  function createMarkersFromLocations(locations){
    var tempMarkers = [];
    locations.forEach(function(value, index){
      var marker = new google.maps.Marker({
        position: value.coords,
        map: map,
        animation: google.maps.Animation.DROP,
        title: value.name,
      });
      marker.addListener('click', function(){
        populateInfoWindow(this);
      });
      marker.addListener('mouseover', function(e) {
        this.setAnimation(google.maps.Animation.BOUNCE);
        e.stop();
      });
      marker.addListener('mouseout', function(e) {
        this.setAnimation(null);
        e.stop();
      });
      tempMarkers.push(marker);
    });
    return tempMarkers;
  }

  populateInfoWindow = function(marker){

    // Send an ajax call to Wikipedia to retrieve information on the points of interest.
    var wikiEndPoint = 'https://en.wikipedia.org/w/api.php?' +
        'format=json&' +
        'action=parse&' +
        'prop=text&' +
        'section=0&' +
        'page=' + marker.title;
    $.ajax({
      url: wikiEndPoint,
      dataType: "jsonp",
      contentType: 'text/plain',
      success: function(data){

        //Retrieves the markup data from WikiPedia and set it to a markup variable.
        var markup = data.parse.text['*'];

        var blurb = $('<div></div>').html(markup);

        var image = $('<div></div>').html(blurb.find('img').first());
        image.addClass('info-image');

        // Remove all elements that aren't text.
        blurb.children(':not(p)').remove();

        // Replace the links with regular text.
        blurb.find('a').each(function() { $(this).replaceWith($(this).html()); });

        // Trims the text if too large.
        if (blurb.children('p:nth-of-type(2)').text().length > 500){
          blurb.children('p').slice(2).remove();
        }

        // Set the wikipedia content to the info window on the marker.
        infowindow.setContent(image.html() + blurb.html());
      },
      error: function(){
        console.log("ERROZÃO!");
      }
    });

    // Open the info window on the marker.
    infowindow.open(map, marker);
  }

  infowindow = new google.maps.InfoWindow();
  infowindow.addListener('closeclick', function(){
    infowindow.setMarker(null);
  });
}

function AppViewModel(){
  var self = this;
  this.locations = mapSettings.locations;
  this.filteredLocations = ko.observableArray(this.locations);

  //Filters the list of locations on the left Menu using the value
  //the user typed in the text control.
  this.filterViewList = function(data, event){
    var value = event.target.value;
    //If the control is clear, add all locations to the array of locations.
    if (value === ""){
      self.filteredLocations(self.locations);
    }
    //Else, filter the locations to only those that share a similar name and
    //replace the locations array with that new filtered array.
    else{
      self.filteredLocations(self.locations.filter(function(locations){
        return locations.name.toLowerCase().includes(value.toLowerCase());
      }));
    }
  }

  this.getIndex = function(event){
    var index = event.target.getAttribute('data-index');
    return index;
  }

  //Applies the filter to the markers on the map.
  this.filterButton = function(){
    var filteredLocationNames = [];
    //Adds the names of the filtered locations to an array called
    //filteredLocationNames.
    self.filteredLocations().forEach(function(value){
      filteredLocationNames.push(value.name)
    });

    //Disables or enables each marker on the map, depending on whether
    //their names can be found in the filtered list of location names.
    markers.forEach(function(value, index){
      if (filteredLocationNames.indexOf(value.title) > - 1) {
        value.setMap(map);
      }
      else
        value.setMap(null);
    });
  }

  this.selectLocation = function(data, event){
    var index = self.getIndex(event);
    populateInfoWindow(markers[index]);
  }

  this.ListMarkerBouncer = function(data, event){
    var index = self.getIndex(event);
    if (event.type === 'mouseover'){
      markers[index].setAnimation(google.maps.Animation.BOUNCE);
    }
    else if(event.type ==='mouseout'){
      markers[index].setAnimation(null);      
    }
  }
}

ko.applyBindings(new AppViewModel());

