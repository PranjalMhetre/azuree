import React, { useState, useEffect } from "react";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [photoFile, setPhotoFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!photoFile) return alert("Choose a photo first.");
    setLoading(true);
    try {
      const base64 = await fileToBase64(photoFile);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const payload = {
            description: desc,
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            filename: photoFile.name,
            data: base64
          };
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.message || JSON.stringify(data));
          alert("Uploaded! URL: " + data.photo_url);
          setDesc("");
          setPhotoFile(null);
          fetchEntries();
        },
        (err) => {
          setLoading(false);
          alert("Location error: " + err.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (e) {
      setLoading(false);
      alert("Upload error: " + e.message);
    }
  };

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/list");
      const data = await res.json();
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "20px auto", padding: 20 }}>
      <h1>Cloud Diary</h1>

      <div style={{ marginBottom: 12 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhotoFile(e.target.files[0])}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          style={{ width: "100%", padding: 8 }}
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <button onClick={upload} disabled={loading}>
          {loading ? "Uploading..." : "Upload Entry"}
        </button>
      </div>

      <h2>Entries</h2>
      {entries.length === 0 && <div>No entries yet.</div>}
      <div>
        {entries.map((e, i) => (
          <div key={i} style={{ marginBottom: 18, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>{e.Description}</div>
            <div style={{ marginBottom: 8 }}>
              <img src={e.PhotoURL} alt="" style={{ maxWidth: "100%", borderRadius: 6 }} />
            </div>
            <div style={{ fontSize: 12, color: "#555" }}>
              {new Date(e.Timestamp).toLocaleString()} —{" "}
              {e.Latitude && e.Longitude ? (
                <a href={`https://www.google.com/maps/search/?api=1&query=${e.Latitude},${e.Longitude}`} target="_blank" rel="noreferrer">
                  View on map
                </a>
              ) : (
                "No location"
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
