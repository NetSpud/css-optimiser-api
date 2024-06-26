import express from "express";
import optimseCSS from "./optimiseCSS";
import cron from "node-cron";
import "dotenv/config";

const app = express();
app.use(express.json());
app.use(express.static("public"));

let slatedFiles = [] as { filename: string; timestamp: number }[];

app.post("/optimise", async (req, res) => {
  console.log(req.body);
  try {
    const url = req.body.url;
    const excludedFiles = req.body.excludedFiles
      .split(",")
      .map((x: string) => x.trim())
      .filter((x: string) => x);
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    const optimisedCSS = await optimseCSS(url + "?performance_mode=false", excludedFiles); //don't load the existing performance mode of the page when trying to optimise

    res.json({ css: optimisedCSS });

    const date = new Date();
    date.setMinutes(date.getMinutes() + 5); //delete after 5 mins
    slatedFiles.push({ filename: "public/" + optimisedCSS, timestamp: date.getTime() }); //add to "slating" array
  } catch (error) {
    const errorhandle = error as Record<string, any>;

    console.log(errorhandle);
    if (["CssSyntaxError"].includes(errorhandle.name)) {
      return res.status(400).json({ error: "There was a syntax error in the CSS", details: errorhandle });
    }
  }
});

const removalInterval = process.env.REMOVAL_INTERVAL || "*/5 * * * *";

cron.schedule(removalInterval, () => {
  //check to see if it's time to delete file, and if so, delete, else skip
  const currentTimestamp = new Date().getTime();
  const filesToDelete = slatedFiles.filter((x) => x.timestamp < currentTimestamp);
  slatedFiles = slatedFiles.filter((x) => x.timestamp >= currentTimestamp);
  console.log(`running cron job`, filesToDelete.length, "files to delete");
  console.log(`remaining files`, slatedFiles.length);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
