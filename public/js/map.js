mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  center: coordinate, // starting position [lng, lat]. Note that lat must be set between -90 and 90
  zoom: 9, // starting zoom
});


// Create a default marker and add it to the map 
// Create marker element (optional custom color)
const marker = new mapboxgl.Marker({
  color: "#ff4757", // soft red accent, change as you like
})
  .setLngLat(coordinate)
  .addTo(map);

// Create popup (initially hidden)
const popup = new mapboxgl.Popup({
  closeButton: false, // no X button
  closeOnClick: false, // don’t close on map click
  offset: 25,
})
  .setHTML(`
    <div style="
      background: white;
      padding: 10px 15px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      font-family: 'Poppins', sans-serif;
      color: #333;
      text-align: center;
    ">
      <h3 style="margin: 0; font-size: 16px; color: #2c3e50;">Hello !</h3>
      <p style="margin: 5px 0 0; font-size: 13px; color: #555;">Extract Location will be send after booking!</p>
    </div>
  `);

// Show popup on hover
marker.getElement().addEventListener('mouseenter', () => {
  popup.addTo(map);
  popup.setLngLat(coordinate);
});

// Hide popup when mouse leaves
marker.getElement().addEventListener('mouseleave', () => {
  popup.remove();
});

