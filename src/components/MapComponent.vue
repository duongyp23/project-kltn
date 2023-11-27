
<template>
  <div class="full-view">
    <div ref="map" class="full-screen-map"></div>
    <div class="right-view">
      <AddressSearch 
        @placeSelected="moveMapToPlace" 
        @addPlace="addStartPlace"
        :title="'Điểm khởi đầu'"/>
      <AddressSearch 
        @placeSelected="moveMapToPlace" 
        @addPlace="addEndPlace"
        :title="'Điểm kết thúc'"/>
      <button class="btn-find-road" @click="routeMapORS">Tìm đường</button>
      <button class="btn-find-road" @click="routeMapGraphHopper">Tìm đường2</button>
      <button class="btn-find-road" @click="routeMapORSM">Tìm đường3</button>
      <button class="btn-find-road" @click="routeMapHereApi">Tìm đường4</button>
      <div class="list-vehicle">
        <div v-for="vehicle in vehiclesORS" :key="vehicle.mode">
          <div v-if="vehicle.polyLine.length > 0" class="vehicle-item" @click="showRoad(vehicle.polyLine)">
            <div class="name-vehicle">{{ vehicle.name }}</div>
            <div class="step-list">
              <div v-for="(step, index) in vehicle.steps" :key="index">
                {{ step.name }}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
/* eslint-disable */
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddressSearch from './AddressSearch.vue';
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import { gmapApi } from 'vue2-google-maps'

export default {
  data() {
    return {
      map: null,
      markers: [],
      polyLine: null,
      startPlace: null,
      endPlace: null,
      vehiclesORS : [
        { name: 'Ô tô', mode: 'driving-car', polyLine: [] },
        // { name: 'Xe máy', mode: 'driving-motorcycle', polyLine: [] },
        // { name: 'Xe đạp', mode: 'cycling-regular', polyLine: [] },
        // { name: 'Đi bộ', mode: 'walking', polyLine: [] },
        // { name: 'Xe bus', mode: 'driving-bus', polyLine: [] },
      ],
      selectedVehicle: null,
      oldPolyLine: null
    };
  },
  computed: {
    google: gmapApi,
  },
  mounted() {
    this.initMap();
  },
  components: {
    AddressSearch,
  },
  methods: {
    initMap() {
      // Khởi tạo bản đồ OpenStreetMap
      this.map = L.map(this.$refs.map).setView([21.0285, 105.8542], 13); // Hà Nội

      // Thêm layer OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map);
    },
    addStartPlace(place) {
      this.moveMapToPlace(place);
      this.addMarkers(place);
      this.startPlace = place;
    },
    addEndPlace(place) {
      this.moveMapToPlace(place);
      this.addMarkers(place);
      this.endPlace = place;
    },
    moveMapToPlace(place) {
      const { lat, lon } = place;
      this.map.setView([lat, lon], 16);
    },
    addMarkers(location, type = 0) {
      if (!this.marker || !this.markers.any(x => x._latlng.lat == location.lat && x._latlng.lng == location.lon) && type == 0) {
        var myIcon = L.icon({
          iconUrl: markerIconPng,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });
        const marker = L.marker([location.lat, location.lon], { icon: myIcon })
          .addTo(this.map);

        const popupContent = `
        <h3>${location.name}</h3>
        <p>Nội dung của popup</p>
        <button id="deleteButton" >Xóa Marker</button>
      `;

        // Thiết lập popup với nội dung HTML
        marker.bindPopup(popupContent);

        // Sự kiện click cho nút xóa
        marker.on('popupopen', function (event) {
          // Lấy marker từ sự kiện
          const clickedMarker = event.popup._source;

          // Kiểm tra xem marker có tồn tại không
          if (clickedMarker) {
            const map = clickedMarker._map;

            // Kiểm tra xem map và marker có tồn tại không
            if (map) {
              document.getElementById('deleteButton').addEventListener('click', function () {
                // Xóa marker khi nút được nhấn
                map.removeLayer(clickedMarker);

              });
            }
          }
        });
        this.markers.push(marker);
      }
    },
    showRoad(polyLine, color = "red") {
      if (this.polyLine) {
        // Nếu tồn tại, xóa nó khỏi bản đồ
        this.map.removeLayer(this.polyLine);
      }
      this.polyLine = L.polyline(polyLine, { color: color }).addTo(this.map);

      // zoom the map to the polyline
      this.map.fitBounds(this.polyLine.getBounds());
    },
    addLineToMap(location) {
      this.polyLine.push([location.lat, location.lon]);
      var polyline = L.polyline(this.polyLine, { color: 'red' }).addTo(this.map);

      // zoom the map to the polyline
      this.map.fitBounds(polyline.getBounds());
    },
    routeMapORS() {
      if (this.startPlace != null && this.endPlace != null) {
        const apiKeyORS = '5b3ce3597851110001cf6248a9ec8adaacac40e1b95cfb05795ec418';
        this.vehiclesORS.forEach(vehicle => {
          vehicle.polyLine = [];
          const apiUrl = `https://api.openrouteservice.org/v2/directions/${vehicle.mode}?api_key=${apiKeyORS}&start=${this.startPlace.lon},${this.startPlace.lat}&end=${this.endPlace.lon},${this.endPlace.lat}`;

          fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
              // Dữ liệu chi tiết về tuyến đường sẽ nằm trong data
              console.log(data);
              const route = data.features[0];
              const geometry = route.geometry;
              geometry.coordinates.forEach(element => {
                vehicle.polyLine.push([element[1], element[0]]);
              });
              vehicle.steps = route.properties.segments[0].steps;
              this.showRoad(vehicle.polyLine, "blue");
            })
            .catch(error => {
              console.error('Lỗi khi tìm đường:', error);
            });
        })
      }
    },
    routeMapGraphHopper() {
      if (this.startPlace != null && this.endPlace != null) {
        const apiKey = '46976e33-ad6f-4a8a-b07e-8f150e41a2e1';

        // Tạo URL API với loại phương tiện là xe máy
        const apiUrl = `https://graphhopper.com/api/1/route?point=${this.startPlace.lat},${this.startPlace.lon}&point=${this.endPlace.lat},${this.endPlace.lon}&vehicle=car&points_encoded=false&key=${apiKey}`;

        // Gửi yêu cầu API và xử lý kết quả
        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            // Lấy đối tượng geometry từ kết quả API
            const geometry = data.paths[0].points;

            let polyline = [];
            geometry.coordinates.forEach(element => {
              polyline.push([element[1], element[0]]);
            });
            this.showRoad(polyline);
            console.log('Thông tin tuyến đường cho xe máy:', data);
          })
          .catch(error => {
            console.error('Lỗi khi gọi API GraphHopper:', error);
          });

      }
    },
    routeMapORSM() {
      if (this.startPlace != null && this.endPlace != null) {

        // Tạo URL API với loại phương tiện là xe máy
        const apiUrl = `https://router.project-osrm.org/route/v1/driving/${this.startPlace.lon},${this.startPlace.lat};${this.endPlace.lon},${this.endPlace.lat}?geometries=geojson`;

        // Gửi yêu cầu API và xử lý kết quả
        fetch(apiUrl) 
          .then(response => response.json())
          .then(data => {
            // Lấy đối tượng geometry từ kết quả API
            const geometry = data.routes[0].geometry;

            let polyline = [];
            geometry.coordinates.forEach(element => {
              polyline.push([element[1], element[0]]);
            });
            this.showRoad(polyline, "purple");
            console.log('Thông tin tuyến đường cho xe máy:', data);
          })
          .catch(error => {
            console.error('Lỗi khi gọi API GraphHopper:', error);
          });

      }
    },
    routeMapHereApi() {
      if (this.startPlace != null && this.endPlace != null) {
        var polylineEncoded = require('@liberty-rider/flexpolyline')

        const apiKey = 'SJGJ0fLQHbpJG8UtoplZe72PpVPMXYQVuVgrMYoOYjA'
        // Tạo URL API với loại phương tiện là xe máy
        const apiUrl = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${this.startPlace.lat},${this.startPlace.lon}&destination=${this.endPlace.lat},${this.endPlace.lon}&return=polyline&apiKey=${apiKey}`;

        // Gửi yêu cầu API và xử lý kết quả
        fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
            // Lấy đối tượng geometry từ kết quả API
            const encodePolyline = data.routes[0].sections[0].polyline;
            let decodePolyline = polylineEncoded.decode(encodePolyline).polyline;
            this.showRoad(decodePolyline, "green");
          })
          .catch(error => {
            console.error('Lỗi khi gọi API GraphHopper:', error);
          });

      }
    },
    
  },
};
</script>

<style scoped>
.btn-find-road {
  height: 30px;
  margin-top: 5px;
}
.list-vehicle {
  margin-left: 5px;
  display: flex;
  flex-direction:column ;
  column-gap: 5px;
}
.name-vehicle {
  margin-left: 5px;
  text-align: center;
}
.vehicle-item {
  height: 24px;
  display: flex;
  flex-direction: column;
  row-gap: 3px;
  align-items: center;
}
.step-list {
  display: flex;
  flex-direction: column;
  display: none;
}
.full-screen-map {
  height:98vh;
  width: calc(100vw - 400px);
  margin: 0;
  padding: 0;
}
.full-view {
  display: flex;
  flex-direction: row;
}
</style>
