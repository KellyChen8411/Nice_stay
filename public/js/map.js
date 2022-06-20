// Initialize and add the map
async function initMap() {
    // The location of Uluru
    const cenPoint = { lat: 25.049587, lng: 121.513598 };
    // The map, centered at Uluru
    const map = new google.maps.Map(document.getElementById("map"), {
      zoom: 16,
      center: cenPoint,
    });

    const marker = new google.maps.Marker({
        position: cenPoint,
        map: map,
        icon: "https://d278985kbhjfo4.cloudfront.net/Nice_stay/icon/house_map.png"
    });
    
  }
  
  window.initMap = initMap;