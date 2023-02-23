mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});

// Set marker options.
const marker = new mapboxgl.Marker({
    color: "rgba(255,0,20,0.4)",
    draggable: true
}).setLngLat(coordinates)
    .addTo(map);