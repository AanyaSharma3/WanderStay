
let lng = listingCoordinates[0] || 75.8577;
let lat = listingCoordinates[1] || 22.7196;


const map = L.map('map').setView([lat, lng], 12);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
}).addTo(map);


L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${listingTitle}</b><br>Exact location shared after booking.`)
    .openPopup();


setTimeout(() => {
    map.invalidateSize();
}, 500);