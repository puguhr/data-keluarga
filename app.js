// app.js

// Menggunakan dotenv untuk mengakses file .env
require('dotenv').config();

// Mengambil nilai dari .env
const CLIENT_ID = process.env.CLIENT_ID;
const API_KEY = process.env.API_KEY;
const SHEET_ID = process.env.SHEET_ID;

console.log('Client ID:', CLIENT_ID);
console.log('API Key:', API_KEY);
console.log('Sheet ID:', SHEET_ID);

const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/spreadsheets";

// Inisialisasi API Google Sheets
function initGoogleAPI() {
  gapi.load('client:auth2', initClient);
}

// Inisialisasi OAuth dan Google Sheets API
function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES,
  }).then(() => {
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      loadKeluarga();
    } else {
      gapi.auth2.getAuthInstance().signIn();
    }
  });
}

// Memuat data keluarga dari Google Sheets
function loadKeluarga() {
  const range = "keluarga!A:E";  // Mengambil kolom A sampai E di sheet keluarga
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range,
  }).then((response) => {
    const data = response.result.values;
    const keluargaList = document.getElementById("keluargaList");
    keluargaList.innerHTML = '';  // Clear daftar
    data.forEach(row => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `<strong>${row[1]}</strong> - ${row[2]} - ${row[3]} - <a href="#" onclick="loadAnggota('${row[0]}')">Lihat Anggota</a>`;
      keluargaList.appendChild(listItem);
    });
  });
}

// Form tambah keluarga
document.getElementById("formKeluarga").addEventListener("submit", function(event) {
  event.preventDefault();

  const namaKepala = document.getElementById("namaKepala").value;
  const alamat = document.getElementById("alamat").value;
  const status = document.getElementById("status").value;
  const koordinat = document.getElementById("koordinat").value;

  const newRow = [
    "", // ID keluarga, nanti akan di-generate otomatis
    namaKepala,
    alamat,
    status,
    koordinat
  ];

  gapi.client.sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "keluarga!A:E",
    valueInputOption: "RAW",
    resource: {
      values: [newRow]
    },
  }).then(() => {
    loadKeluarga();  // Refresh daftar keluarga
  });
});

// Menampilkan anggota keluarga berdasarkan ID keluarga
function loadAnggota(idKeluarga) {
  const range = `penduduk!A:F`;  // Mengambil data penduduk
  gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: range,
  }).then((response) => {
    const data = response.result.values;
    const anggotaList = data.filter(row => row[0] === idKeluarga);
    alert(`Anggota keluarga ${idKeluarga}: ` + anggotaList.map(anggota => anggota[1]).join(', '));
  });
}
