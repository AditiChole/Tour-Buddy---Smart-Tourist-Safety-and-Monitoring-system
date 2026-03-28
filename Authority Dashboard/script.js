const storageKey = "tourbuddy-authority-session";
const apiBaseUrl = window.TOURBUDDY_API_BASE || "http://localhost:4000";

const loginPanel = document.getElementById("loginPanel");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const logoutBtn = document.getElementById("logoutBtn");

const officerNameInput = document.getElementById("officerName");
const authorityIdInput = document.getElementById("authorityId");
const departmentInput = document.getElementById("department");

const profileName = document.getElementById("profileName");
const profileDepartment = document.getElementById("profileDepartment");
const profileId = document.getElementById("profileId");
const idCardNumber = document.getElementById("idCardNumber");
const avatarInitials = document.getElementById("avatarInitials");
const activeSosCount = document.getElementById("activeSosCount");
const activeSosNote = document.getElementById("activeSosNote");
const touristWatchCount = document.getElementById("touristWatchCount");
const touristWatchNote = document.getElementById("touristWatchNote");
const responseTime = document.getElementById("responseTime");
const responseNote = document.getElementById("responseNote");
const resolvedCount = document.getElementById("resolvedCount");
const resolvedNote = document.getElementById("resolvedNote");
const alertsTableBody = document.getElementById("alertsTableBody");
const riskFilter = document.getElementById("riskFilter");
const timelineFeed = document.getElementById("timelineFeed");
const lastRefreshLabel = document.getElementById("lastRefreshLabel");
const zoneStatusLabel = document.getElementById("zoneStatusLabel");
const geoFeed = document.getElementById("geoFeed");
const leafletMapContainer = document.getElementById("leafletMap");
const seenIncidentsKey = "tourbuddy-authority-seen-incidents";

function loadSeenIncidentIds() {
  try {
    const raw = window.localStorage.getItem(seenIncidentsKey);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveSeenIncidentIds(ids) {
  window.localStorage.setItem(seenIncidentsKey, JSON.stringify([...ids]));
}

function ensureToastStack() {
  let stack = document.getElementById("toastStack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toastStack";
    stack.style.position = "fixed";
    stack.style.top = "20px";
    stack.style.right = "20px";
    stack.style.zIndex = "9999";
    stack.style.display = "grid";
    stack.style.gap = "12px";
    document.body.appendChild(stack);
  }
  return stack;
}

function playRinger() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    [0, 0.18, 0.36].forEach((offset) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.14, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.2);
    });
  } catch {}
}

function showToast(title, message) {
  const stack = ensureToastStack();
  const toast = document.createElement("div");
  toast.style.minWidth = "320px";
  toast.style.maxWidth = "360px";
  toast.style.padding = "16px 18px";
  toast.style.borderRadius = "18px";
  toast.style.background = "rgba(7, 17, 31, 0.96)";
  toast.style.border = "1px solid rgba(255,255,255,0.08)";
  toast.style.boxShadow = "0 24px 60px rgba(0,0,0,0.28)";
  toast.innerHTML = `<strong style="display:block;margin-bottom:6px;">${title}</strong><p style="margin:0;color:#bfd1e9;line-height:1.5;">${message}</p>`;
  stack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

const riskPriority = { Critical: 3, High: 2, Moderate: 1 };

let map = null;
let mapInitialized = false;
const geoMarkers = [];

const incidents = [];

const timelineItems = [
  { time: "12:40", message: "Volunteer unit V-14 routed to SOS-9069 near Deekshabhoomi" },
  { time: "12:27", message: "Unsafe zone alert pushed to 46 tourists near Sitabuldi" },
  { time: "12:10", message: "AI engine flagged abnormal clustering at Futala Lake" },
];

const nagpurZones = [
  {
    name: "Sitabuldi",
    type: "danger",
    lat: 21.1452,
    lng: 79.0882,
    radius: 700,
    detail: "High crowd density with repeated SOS activity",
  },
  {
    name: "Futala Lake",
    type: "warning",
    lat: 21.1313,
    lng: 79.0562,
    radius: 650,
    detail: "Borderline crowd movement during evening hours",
  },
  {
    name: "Deekshabhoomi",
    type: "success",
    lat: 21.128,
    lng: 79.0701,
    radius: 500,
    detail: "Managed safe route with active patrol coverage",
  },
  {
    name: "Ambazari Lake",
    type: "warning",
    lat: 21.1394,
    lng: 79.0435,
    radius: 600,
    detail: "Tourist congregation area under watch",
  },
];

const geoTourists = [
  {
    id: "T1",
    name: "Emma Lewis",
    zone: "Sitabuldi urban watch zone",
    status: "Inside red zone",
    riskType: "danger",
    lat: 21.1458,
    lng: 79.0847,
  },
  {
    id: "T2",
    name: "Ryo Tanaka",
    zone: "Futala Lake corridor",
    status: "Borderline movement",
    riskType: "warning",
    lat: 21.1317,
    lng: 79.0554,
  },
  {
    id: "T3",
    name: "Priya Das",
    zone: "Deekshabhoomi safe route",
    status: "Inside safe zone",
    riskType: "success",
    lat: 21.1281,
    lng: 79.0703,
  },
];

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function normalizeId(id) {
  return id.trim().toUpperCase().replace(/\s+/g, "-");
}

function getZoneColor(type) {
  if (type === "danger") return "#ff6a6a";
  if (type === "warning") return "#ffb84d";
  return "#31c48d";
}

function riskToClass(risk) {
  if (risk === "Critical") return "danger";
  if (risk === "High" || risk === "Moderate") return "warning";
  return "neutral";
}

function statusToClass(status) {
  if (status === "Volunteer nearby" || status === "Completed") return "success";
  return "neutral";
}

function formatTimeLabel(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Now";
  }
}

function mapIncidentFromApi(incident) {
  return {
    id: incident.id,
    tourist: incident.name,
    location: incident.location,
    issue: incident.incidentDescription,
    risk: incident.risk || "Moderate",
    riskClass: riskToClass(incident.risk),
    status: incident.status || "New SOS",
    statusClass: statusToClass(incident.status),
    timestamp: incident.timestamp,
  };
}

function getFilteredIncidents() {
  const filterValue = riskFilter.value;

  if (filterValue === "all") {
    return incidents;
  }

  return incidents.filter((incident) => {
    if (filterValue === "Critical") {
      return incident.risk === "Critical";
    }

    return riskPriority[incident.risk] >= riskPriority[filterValue];
  });
}

function renderIncidents() {
  const filteredIncidents = getFilteredIncidents();

  alertsTableBody.innerHTML = filteredIncidents
    .map(
      (incident) => `
        <tr>
          <td>${incident.id}</td>
          <td>${incident.tourist}</td>
          <td>${incident.location}</td>
          <td>${incident.issue}</td>
          <td><span class="tag ${incident.riskClass}">${incident.risk}</span></td>
          <td><span class="tag ${incident.statusClass}">${incident.status}</span></td>
        </tr>
      `,
    )
    .join("");

  activeSosCount.textContent = String(filteredIncidents.length).padStart(2, "0");
  activeSosNote.textContent = `${filteredIncidents.filter((item) => item.risk === "Critical").length} critical incidents need immediate attention`;
}

function renderTimeline() {
  timelineFeed.innerHTML = timelineItems
    .map(
      (item) => `
        <div class="timeline-item">
          <span>${item.time}</span>
          <p>${item.message}</p>
        </div>
      `,
    )
    .join("");
}

function renderGeoFeed() {
  const redZoneCount = nagpurZones.filter((zone) => zone.type === "danger").length;
  zoneStatusLabel.textContent = `${redZoneCount} critical zone${redZoneCount === 1 ? "" : "s"}`;

  geoFeed.innerHTML = geoTourists
    .map(
      (tourist) => `
        <div class="geo-feed-item">
          <div>
            <strong>${tourist.id} • ${tourist.name}</strong>
            <p>${tourist.zone}</p>
          </div>
          <span class="tag ${tourist.riskType}">${tourist.status}</span>
        </div>
      `,
    )
    .join("");
}

function updateDashboardMetrics() {
  const total = incidents.length;
  const critical = incidents.filter((item) => item.risk === "Critical").length;
  const moderatePlus = incidents.filter((item) => riskPriority[item.risk] >= 1).length;
  const resolved = incidents.filter((item) => item.status === "Volunteer nearby").length + 181;
  const watchCount = 1200 + total * 12;
  const minutes = 6 + critical;
  const seconds = 22 + moderatePlus * 5;

  touristWatchCount.textContent = watchCount.toLocaleString();
  touristWatchNote.textContent = `${critical * 28 + 58} in geofenced red corridors`;
  responseTime.textContent = `${String(minutes).padStart(2, "0")}m ${String(seconds % 60).padStart(2, "0")}s`;
  responseNote.textContent = critical > 1 ? "Priority load elevated, dispatch optimized" : "System operating within normal thresholds";
  resolvedCount.textContent = String(resolved);
  resolvedNote.textContent = `${Math.max(88, 96 - critical)}% closure rate within SLA`;
}

async function fetchIncidents() {
  try {
    const response = await window.fetch(`${apiBaseUrl}/api/sos?ts=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Unable to load incidents");
    }

    const payload = await response.json();
    const latestIncidents = Array.isArray(payload.incidents)
      ? payload.incidents.map(mapIncidentFromApi)
      : [];
    const seenIds = loadSeenIncidentIds();
    const hasStoredBaseline = window.localStorage.getItem(seenIncidentsKey) !== null;

    latestIncidents.forEach((incident) => {
      if (hasStoredBaseline && !seenIds.has(incident.id) && !dashboard.classList.contains("hidden")) {
        playRinger();
        showToast("New SOS Alert", `${incident.tourist} reported "${incident.issue}" near ${incident.location}.`);
      }
      seenIds.add(incident.id);
    });

    incidents.splice(0, incidents.length, ...latestIncidents);
    saveSeenIncidentIds(seenIds);

    const liveTimeline = latestIncidents.slice(0, 3).map((incident) => ({
      time: formatTimeLabel(incident.timestamp),
      message: `${incident.tourist} reported "${incident.issue}" near ${incident.location}`,
    }));

    timelineItems.splice(0, timelineItems.length, ...liveTimeline);
    lastRefreshLabel.innerHTML = '<span class="status-dot"></span>Last refresh: just now';
    renderIncidents();
    renderTimeline();
    updateDashboardMetrics();
  } catch (error) {
    lastRefreshLabel.innerHTML = '<span class="status-dot"></span>Live sync unavailable';
    console.error(error);
  }
}

function initializeMap() {
  if (mapInitialized || !leafletMapContainer || typeof L === "undefined") {
    return;
  }

  map = L.map("leafletMap", {
    zoomControl: true,
    preferCanvas: true,
  }).setView([21.1458, 79.0882], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  nagpurZones.forEach((zone) => {
    const color = getZoneColor(zone.type);
    const circle = L.circle([zone.lat, zone.lng], {
      radius: zone.radius,
      color,
      weight: 2,
      fillColor: color,
      fillOpacity: 0.18,
    }).addTo(map);

    circle.bindTooltip(zone.name, {
      permanent: true,
      direction: "center",
      className: "zone-label",
      opacity: 0.95,
    });

    circle.bindPopup(
      `<div class="custom-popup"><strong>${zone.name}</strong><br>${zone.detail}</div>`,
    );
  });

  geoTourists.forEach((tourist) => {
    const marker = L.circleMarker([tourist.lat, tourist.lng], {
      radius: 10,
      color: getZoneColor(tourist.riskType),
      weight: 2,
      fillColor: getZoneColor(tourist.riskType),
      fillOpacity: 0.92,
    }).addTo(map);

    marker.bindTooltip(tourist.id, {
      permanent: true,
      direction: "top",
      offset: [0, -10],
    });

    marker.bindPopup(
      `<div class="custom-popup"><strong>${tourist.name}</strong><br>${tourist.zone}<br>Status: ${tourist.status}</div>`,
    );

    geoMarkers.push(marker);
  });

  setTimeout(() => {
    map.invalidateSize();
  }, 200);

  mapInitialized = true;
}

function moveGeoPins() {
  if (!mapInitialized) {
    return;
  }

  geoTourists.forEach((tourist, index) => {
    const nextLat = tourist.lat + (Math.random() * 0.002 - 0.001);
    const nextLng = tourist.lng + (Math.random() * 0.002 - 0.001);

    tourist.lat = Number(nextLat.toFixed(6));
    tourist.lng = Number(nextLng.toFixed(6));
    geoMarkers[index].setLatLng([tourist.lat, tourist.lng]);
  });

  renderGeoFeed();
}

function simulateLiveUpdate() {
  if (!incidents.length) {
    return;
  }

  const incident = incidents[Math.floor(Math.random() * incidents.length)];
  const actions = [
    `Patrol reassigned to ${incident.location}`,
    `${incident.tourist} acknowledged safety notification`,
    `AI model refreshed risk score for ${incident.location}`,
    `Volunteer network updated for ${incident.id}`,
  ];

  timelineItems.unshift({
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    message: actions[Math.floor(Math.random() * actions.length)],
  });

  timelineItems.splice(4);
  lastRefreshLabel.innerHTML = '<span class="status-dot"></span>Last refresh: just now';
  renderTimeline();
  updateDashboardMetrics();
}

function applySession(session) {
  profileName.textContent = session.name;
  profileDepartment.textContent = `${session.department} Officer`;
  profileId.textContent = session.id;
  idCardNumber.textContent = `TB-${session.id}`;
  avatarInitials.textContent = getInitials(session.name) || "AU";

  loginPanel.classList.add("hidden");
  dashboard.classList.remove("hidden");
  initializeMap();
}

function saveSession(session) {
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem(storageKey);
}

function showLogin() {
  dashboard.classList.add("hidden");
  loginPanel.classList.remove("hidden");
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const session = {
    name: officerNameInput.value.trim(),
    id: normalizeId(authorityIdInput.value),
    department: departmentInput.value,
  };

  saveSession(session);
  applySession(session);
});

logoutBtn.addEventListener("click", () => {
  clearSession();
  loginForm.reset();
  showLogin();
});

riskFilter.addEventListener("change", () => {
  renderIncidents();
  updateDashboardMetrics();
});

const storedSession = window.localStorage.getItem(storageKey);

renderIncidents();
renderTimeline();
renderGeoFeed();
updateDashboardMetrics();
fetchIncidents();

if (storedSession) {
  try {
    applySession(JSON.parse(storedSession));
  } catch {
    clearSession();
    showLogin();
  }
}

window.setInterval(() => {
  if (!dashboard.classList.contains("hidden")) {
    fetchIncidents();
    simulateLiveUpdate();
    moveGeoPins();
  }
}, 8000);
