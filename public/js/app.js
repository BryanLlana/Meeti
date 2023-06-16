import { OpenStreetMapProvider } from 'leaflet-geosearch'

//* Obtener valores de base de datos

const lat = document.querySelector('#lat').value ?? -12.0174489
const lng = document.querySelector('#lng').value ?? -76.8203161
const direccion = document.querySelector('#direccion').value ?? ''
const map = L.map('mapa').setView([lat, lng], 15)
const markers = new L.FeatureGroup().addTo(map)
let marker

//* Colocar el Pin en edicion
if (lat && lng) {
  //* Agregar PIN
  marker = new L.marker([lat, lng], {
    draggable: true, //* Mover el PIN
    autoPan: true //* Mover el mapa con el PIN
  }).addTo(map)
    .bindPopup(direccion)
    .openPopup()

  //* Asignar al contenedor markers
  markers.addLayer(marker)

  //* Detectar movimiento del marker
  marker.on('moveend', function (e) {
    marker = e.target
    const posicion = marker.getLatLng()
    map.panTo(new L.LatLng(posicion.lat, posicion.lng))

    //* Obtener información de las calles al soltar el pin
    const geocodeService = L.esri.Geocoding.geocodeService()
    geocodeService.reverse().latlng(posicion, 13).run(function (error, resultado) {
      console.log(error)
      marker.bindPopup(resultado.address.LongLabel)

      //* Llenar los campos
      document.querySelector('#direccion').value = resultado.address.Address ?? ''
      document.querySelector('#ciudad').value = resultado.address.City ?? ''
      document.querySelector('#estado').value = resultado.address.Region ?? ''
      document.querySelector('#pais').value = resultado.address.CountryCode ?? ''
      document.querySelector('#lat').value = resultado.latlng.lat ?? ''
      document.querySelector('#lng').value = resultado.latlng.lng ?? ''
    })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  //* Buscar dirección
  const buscador = document.querySelector('#formbuscador')
  buscador.addEventListener('input', buscarDireccion)
})

function buscarDireccion (e) {
  if (e.target.value.length > 8) {
    //* Si existe un pin anterior limpiarlo
    markers.clearLayers()

    //* Utilizar el provider y Geocoder
    const provider = new OpenStreetMapProvider()
    provider.search({ query: e.target.value })
      .then(resultado => {
        //* Mostrar el mapa
        map.setView(resultado[0].bounds[0], 15)

        //* Agregar PIN
        marker = new L.marker(resultado[0].bounds[0], {
          draggable: true, //* Mover el PIN
          autoPan: true //* Mover el mapa con el PIN
        }).addTo(map)
          .bindPopup(resultado[0].label)
          .openPopup()

        //* Asignar al contenedor markers
        markers.addLayer(marker)

        //* Detectar movimiento del marker
        marker.on('moveend', function (e) {
          marker = e.target
          const posicion = marker.getLatLng()
          map.panTo(new L.LatLng(posicion.lat, posicion.lng))

          //* Obtener información de las calles al soltar el pin
          const geocodeService = L.esri.Geocoding.geocodeService()
          geocodeService.reverse().latlng(posicion, 13).run(function (error, resultado) {
            console.log(error)
            marker.bindPopup(resultado.address.LongLabel)

            //* Llenar los campos
            document.querySelector('#direccion').value = resultado.address.Address ?? ''
            document.querySelector('#ciudad').value = resultado.address.City ?? ''
            document.querySelector('#estado').value = resultado.address.Region ?? ''
            document.querySelector('#pais').value = resultado.address.CountryCode ?? ''
            document.querySelector('#lat').value = resultado.latlng.lat ?? ''
            document.querySelector('#lng').value = resultado.latlng.lng ?? ''
          })
        })
      })
  }
}
