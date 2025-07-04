
      // Initialize forecast chart
      const ctx = document.getElementById("forecastChart").getContext("2d");
      const forecastChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Jun 24",
            "Jun 25",
            "Jun 26",
            "Jun 27",
            "Jun 28",
            "Jun 29",
            "Jun 30",
          ],
          datasets: [
            {
              label: "Flood Risk",
              data: [35, 45, 85, 92, 70, 50, 40],
              borderColor: "#2196f3",
              backgroundColor: "rgba(33, 150, 243, 0.1)",
              tension: 0.3,
              fill: true,
            },
            {
              label: "Heatwave Risk",
              data: [30, 40, 55, 60, 75, 80, 65],
              borderColor: "#ff9800",
              backgroundColor: "rgba(255, 152, 0, 0.1)",
              tension: 0.3,
              fill: true,
            },
            {
              label: "Air Quality Index",
              data: [85, 90, 105, 120, 110, 95, 85],
              borderColor: "#9c27b0",
              backgroundColor: "rgba(156, 39, 176, 0.1)",
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#f5f9f4",
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            x: {
              grid: {
                color: "rgba(245, 249, 244, 0.1)",
              },
              ticks: {
                color: "#f5f9f4",
              },
            },
            y: {
              min: 0,
              max: 140,
              grid: {
                color: "rgba(245, 249, 244, 0.1)",
              },
              ticks: {
                color: "#f5f9f4",
                callback: function (value) {
                  if (value >= 80) return "High Risk";
                  if (value >= 50) return "Moderate Risk";
                  return "Low Risk";
                },
              },
            },
          },
          interaction: {
            mode: "nearest",
            axis: "x",
            intersect: false,
          },
        },
      });

      // Header scroll effect
      window.addEventListener("scroll", function () {
        const header = document.querySelector("header");
        if (window.scrollY > 50) {
          header.style.background = "rgba(26, 46, 25, 0.98)";
          header.style.boxShadow = "0 5px 20px rgba(0, 0, 0, 0.2)";
        } else {
          header.style.background = "rgba(26, 46, 25, 0.95)";
          header.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
        }
      });

      // Map toggles
      document.querySelectorAll(".map-toggle").forEach((toggle) => {
        toggle.addEventListener("click", function () {
          document
            .querySelectorAll(".map-toggle")
            .forEach((t) => t.classList.remove("active"));
          this.classList.add("active");
        });
      });
   
   
  
  // 2D LEAFLET MAP SETUP
  const leafletMap = L.map('leafletMap').setView([19.0760, 72.8777], 12); // Mumbai
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(leafletMap);

  // Dummy flood/heat zone circles
  L.circle([19.0760, 72.8777], {
    color: '#ff4c4c', fillColor: '#ff4c4c', fillOpacity: 0.5, radius: 1500
  }).addTo(leafletMap).bindPopup("⚠️ High Risk Zone");

  L.circle([19.0900, 72.8800], {
    color: '#ffe680', fillColor: '#ffe680', fillOpacity: 0.5, radius: 1500
  }).addTo(leafletMap).bindPopup("⚠️ Moderate Risk Zone");

  L.circle([19.1000, 72.8500], {
    color: '#91f291', fillColor: '#91f291', fillOpacity: 0.5, radius: 1500
  }).addTo(leafletMap).bindPopup("✅ Low Risk Zone");

  // 3D CESIUM SETUP
  Cesium.Ion.defaultAccessToken = ''; // Leave blank for local/tileset
  const viewer = new Cesium.Viewer('cesiumContainer', {
   terrainProvider: Cesium.createWorldTerrain({
  requestVertexNormals: true,
  requestWaterMask: true
}),

    animation: false, timeline: false, baseLayerPicker: false
  });

  // Dummy risk zones
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(72.8777, 19.0760, 0),
    ellipse: {
      semiMinorAxis: 1500, semiMajorAxis: 1500,
      material: Cesium.Color.RED.withAlpha(0.5),
    },
    name: "High Risk Zone"
  });

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(72.8800, 19.0900, 0),
    ellipse: {
      semiMinorAxis: 1500, semiMajorAxis: 1500,
      material: Cesium.Color.YELLOW.withAlpha(0.5),
    },
    name: "Moderate Risk Zone"
  });

  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(72.8500, 19.1000, 0),
    ellipse: {
      semiMinorAxis: 1500, semiMajorAxis: 1500,
      material: Cesium.Color.GREEN.withAlpha(0.5),
    },
    name: "Low Risk Zone"
  });

  viewer.zoomTo(viewer.entities);

  // TOGGLE FUNCTION
  function showMap(type) {
    document.getElementById('leafletMap').style.display = (type === '2d') ? 'block' : 'none';
    document.getElementById('cesiumContainer').style.display = (type === '3d') ? 'block' : 'none';

    // Active button toggle
    document.querySelectorAll('.map-toggle').forEach(btn => btn.classList.remove('active'));
    if (type === '2d') document.querySelectorAll('.map-toggle')[0].classList.add('active');
    else document.querySelectorAll('.map-toggle')[1].classList.add('active');

    // Trigger Cesium re-render if switching to 3D
    if (type === '3d') viewer.resize();
  }



  // Function to fetch coordinates
  async function geocodeLocation(query) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        name: data[0].display_name
      };
    }
    throw new Error("Location not found");
  }

  // Main Search Handler
  async function searchLocation() {
    const query = document.getElementById("locationInput").value;
    if (!query) return;

    try {
      const { lat, lon, name } = await geocodeLocation(query);
document.getElementById("mapTitle").textContent = `${query} Climate Risk Visualization`;
   
      // Update Leaflet Map
      leafletMap.setView([lat, lon], 13);
      L.marker([lat, lon]).addTo(leafletMap).bindPopup(`📍 ${name}`).openPopup();

      // Update Cesium Map
      viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
        point: { pixelSize: 10, color: Cesium.Color.BLUE },
        label: {
          text: name,
          font: '14px sans-serif',
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
          pixelOffset: new Cesium.Cartesian2(0, -15)
        }
      });
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 10000)
      });

    } catch (error) {
      alert("Location Found.");
    }
  }
 
  function toggleMenu() {
    document.querySelector("nav ul").classList.toggle("show-menu");
  }

