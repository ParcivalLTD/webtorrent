import express from "express";
import WebTorrent from "webtorrent";
import archiver from "archiver";
import cors from "cors";

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(cors());

// Setup WebTorrent
const client = new WebTorrent();

app.get("/download/:magnetLink", (req, res) => {
  const { magnetLink } = req.params;
  const torrent = client.add(magnetLink);

  const archive = archiver("zip", {
    zlib: { level: 9 }, // Set compression level
  });

  // Set response headers
  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", `attachment; filename=${torrent.name}.zip`);

  // Pipe archive to the response
  archive.pipe(res);

  // Listen for progress updates
  torrent.on("download", () => {
    const progress = (torrent.progress * 100).toFixed(2);
    console.log(`Download progress: ${progress}%`);
  });

  // Add torrent files to the zip archive
  torrent.on("ready", () => {
    torrent.files.forEach((file) => {
      archive.append(file.createReadStream(), { name: file.name });
    });

    // Finalize the archive and end the response
    archive.finalize();
  });

  // Handle errors
  torrent.on("error", (err) => {
    console.error(`Torrent error: ${err}`);
    res.status(500).send("Error downloading torrent");
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
