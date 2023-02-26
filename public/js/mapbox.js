mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: coordinates,
    zoom: 9,
    projection: 'equalEarth'
});

// Set marker options.
const marker = new mapboxgl.Marker({
    color: "rgba(255,0,20,0.4)",
    draggable: true
}).setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup({
        // closeButton: false,
        closeOnMove: true
    })
        .setLngLat(coordinates)
        .setHTML(`<h5>${campName}</h5><p>${campLoc}</p>`)

    )
    .addTo(map);

map.addControl(new mapboxgl.NavigationControl());
