// popup.js
document.getElementById("search").addEventListener("click", async () => {
  const lines = document.getElementById("input").value
    .split("\n")
    .map(l => l.trim())
    .filter(l => l);

  const results = [];

  for (const query of lines) {
    const url = `https://bandcamp.com/search?q=${encodeURIComponent(query)}&item_type=a`;

    try {
      const res = await fetch(url);
      const text = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      const firstResult = doc.querySelector(".searchresult .heading a");

      if (firstResult) {
        results.push({
          query,
          title: firstResult.textContent.trim(),
          link: firstResult.href
        });
      } else {
        results.push({ query, error: "No result" });
      }
    } catch (e) {
      results.push({ query, error: e.message });
    }
  }

  chrome.storage.local.set({ results }, () => {
    alert("Saved results!");
    console.log(results);
  });
});

// JSON Download
document.addEventListener('DOMContentLoaded', function() {
   document.getElementById("downloadJson").addEventListener("click", () => {
  chrome.storage.local.get("results", ({ results }) => {
    if (!results || results.length === 0) {
      alert("No results to download");
      return;
    }

    const jsonContent = JSON.stringify(results, null, 2);

    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "bandcamp_results.json";
    a.click();

    URL.revokeObjectURL(url);
  });
}); 
});