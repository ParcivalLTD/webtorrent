import express from "express";
import WebTorrent from "webtorrent";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const client = new WebTorrent();

app.post("/download", async (req, res) => {
  try {
    const { magnetLink } = req.body;

    if (!magnetLink) {
      return res.status(400).json({ error: "Magnet link is required" });
    }

    const torrent = await new Promise((resolve, reject) => {
      client.add(magnetLink, { path: "/tmp" }, (torrent) => {
        resolve(torrent);
      });
    });

    const files = torrent.files.map((file) => {
      return {
        name: file.name,
        size: file.length,
      };
    });

    res.json({ files });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
