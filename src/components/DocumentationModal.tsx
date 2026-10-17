import React, { useState } from 'react';
import { BookOpen, Copy, Check, Download, X, Code2, Database, ShieldCheck, Cpu } from 'lucide-react';

interface DocumentationModalProps {
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'part1' | 'part2' | 'part11' | 'part12' | 'part13'>('part1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Siswa hanya boleh membuat (create) refleksi, tidak boleh membaca data siswa lain
    match /students_reflections/{reflectionId} {
      allow create: if request.resource.data.namaSiswa != null;
      allow read: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // Materi hanya dapat dikelola oleh guru terautentikasi
    match /materials/{materialId} {
      allow read, write: if request.auth != null;
    }

    // Bank Game hanya dapat diakses dan diedit oleh guru
    match /games/{gameId} {
      allow read, write: if request.auth != null;
    }

    // Dokumen RPM hanya dapat diakses oleh guru
    match /rpm/{rpmId} {
      allow read, write: if request.auth != null;
    }

    // Guru accounts & profiling
    match /teachers/{teacherId} {
      allow read, write: if request.auth != null && request.auth.uid == teacherId;
    }
  }
}`;

  const gasCode = `/**
 * NOVA (Narasi, Observasi, Voice, Aspirasi)
 * Google Apps Script Web App Backend & Proxy
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('NOVA - Narasi, Observasi, Voice, Aspirasi')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 1. Simpan Refleksi Siswa
function saveStudentReflection(data) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Refleksi_Siswa') || ss.insertSheet('Refleksi_Siswa');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'ID', 'Timestamp', 'Nama Siswa', 'Kelas', 'No Absen',
        'Mood', 'Alasan Mood', 'Sudah Dipahami', 'Belum Dipahami',
        'Tingkat Pemahaman', 'Kesan', 'Hal Disukai', 'Keinginan', 'Harapan', 'Pilihan Media', 'Pilihan Aktivitas'
      ]);
    }
    var id = 'REF_' + new Date().getTime();
    sheet.appendRow([
      id, new Date(), data.namaSiswa, data.kelas, data.noAbsen,
      data.mood, data.alasanMood, data.sudahDipahami, data.belumDipahami,
      data.tingkatPemahaman, data.kesan, data.halDisukai, data.keinginanPembelajaran,
      data.harapanBerikutnya, JSON.stringify(data.pilihanMedia), JSON.stringify(data.pilihanAktivitas)
    ]);
    return { success: true, id: id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// 2. Analisis AI Gemini dari Server-Side Properties
function analyzeWithGemini(promptText) {
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('API Key Gemini belum disetel di Script Properties.');
  }
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=' + apiKey;
  var payload = {
    contents: [{ parts: [{ text: promptText }] }]
  };
  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  return json.candidates[0].content.parts[0].text;
}
`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black">
                Panduan & Kode Integrasi Eksternal (PART 1 - PART 13)
              </h2>
              <p className="text-xs text-slate-400">
                Arsitektur, Google Apps Script, Firestore Rules & Panduan Deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('part1')}
            className={`py-3 px-4 border-b-2 transition shrink-0 ${
              activeTab === 'part1' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-600'
            }`}
          >
            PART 1: Firestore & Security Rules
          </button>
          <button
            onClick={() => setActiveTab('part2')}
            className={`py-3 px-4 border-b-2 transition shrink-0 ${
              activeTab === 'part2' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-600'
            }`}
          >
            PART 2: Google Apps Script Backend
          </button>
          <button
            onClick={() => setActiveTab('part11')}
            className={`py-3 px-4 border-b-2 transition shrink-0 ${
              activeTab === 'part11' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-600'
            }`}
          >
            PART 11: Panduan Firebase
          </button>
          <button
            onClick={() => setActiveTab('part12')}
            className={`py-3 px-4 border-b-2 transition shrink-0 ${
              activeTab === 'part12' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-600'
            }`}
          >
            PART 12: Deploy GAS
          </button>
          <button
            onClick={() => setActiveTab('part13')}
            className={`py-3 px-4 border-b-2 transition shrink-0 ${
              activeTab === 'part13' ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-600'
            }`}
          >
            PART 13: Testing Checklist
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {activeTab === 'part1' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Firebase Firestore Security Rules</h3>
                  <p className="text-slate-500 text-[11px]">Salin aturan keamanan berikut ke Firebase Console Anda:</p>
                </div>
                <button
                  onClick={() => copyToClipboard(firestoreRules, 'rules')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100"
                >
                  {copiedKey === 'rules' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'rules' ? 'Tersalin' : 'Salin Rules'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed">
                {firestoreRules}
              </pre>
            </div>
          )}

          {activeTab === 'part2' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Google Apps Script (Code.gs)</h3>
                  <p className="text-slate-500 text-[11px]">Backend alternatif berbasis Google Sheets & Apps Script:</p>
                </div>
                <button
                  onClick={() => copyToClipboard(gasCode, 'gas')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100"
                >
                  {copiedKey === 'gas' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'gas' ? 'Tersalin' : 'Salin Code.gs'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 text-blue-300 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed">
                {gasCode}
              </pre>
            </div>
          )}

          {activeTab === 'part11' && (
            <div className="space-y-3 leading-relaxed">
              <h3 className="text-sm font-bold text-slate-900">Panduan Instalasi Firebase Firestore</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Buka <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">Firebase Console</a> dan buat project baru dengan nama <strong>NOVA-Edu</strong>.</li>
                <li>Pilih <strong>Build &gt; Firestore Database</strong> &gt; Klik <em>Create database</em> &gt; Pilih region terdekat (misal: <code>asia-southeast1</code>).</li>
                <li>Pada tab <strong>Rules</strong>, tempelkan aturan keamanan dari PART 1 di atas lalu klik <strong>Publish</strong>.</li>
                <li>Pilih <strong>Authentication</strong> &gt; Aktifkan Email/Password sign-in method untuk login guru.</li>
                <li>Daftarkan Web App di Project Settings dan dapatkan <code>firebaseConfig</code> Anda.</li>
              </ol>
            </div>
          )}

          {activeTab === 'part12' && (
            <div className="space-y-3 leading-relaxed">
              <h3 className="text-sm font-bold text-slate-900">Panduan Deploy Google Apps Script</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Buka <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline">Google Apps Script</a> atau ekstensi Apps Script di Google Sheets Anda.</li>
                <li>Salin kode dari <strong>PART 2 (Code.gs)</strong>.</li>
                <li>Buka <strong>Project Settings &gt; Script Properties</strong> &gt; Tambahkan properti: <code>GEMINI_API_KEY</code> dengan API Key dari Google AI Studio.</li>
                <li>Klik tombol <strong>Deploy &gt; New deployment</strong> &gt; Pilih type <em>Web app</em>.</li>
                <li>Setel <em>Execute as: Me</em> dan <em>Who has access: Anyone</em>.</li>
                <li>Salin URL Web App yang dihasilkan untuk digunakan di browser sekolah.</li>
              </ol>
            </div>
          )}

          {activeTab === 'part13' && (
            <div className="space-y-3 leading-relaxed">
              <h3 className="text-sm font-bold text-slate-900">Checklist Pengujian & Troubleshooting (PART 13)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-900 block mb-1">Checklist Siswa:</span>
                  <ul className="space-y-1">
                    <li>✓ Masuk sebagai siswa tanpa password</li>
                    <li>✓ Pengisian 5 dimensi (Feeling, Understanding, Voice, Wish, Choice)</li>
                    <li>✓ Animasi sukses & 24+ pesan Growth Mindset acak</li>
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-900 block mb-1">Checklist Guru:</span>
                  <ul className="space-y-1">
                    <li>✓ Autentikasi guru aman & filter kelas</li>
                    <li>✓ Grafik Chart.js interaktif tanpa dummy data</li>
                    <li>✓ Analisis AI "MENGAPA REKOMENDASI INI?"</li>
                    <li>✓ Bank Game + Balapan Mobil langsung di browser</li>
                    <li>✓ RPM A sampai S otomatis & ekspor DOCX/PDF</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
