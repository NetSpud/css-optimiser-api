import { createHash } from "node:crypto";
import fs from "fs/promises";
import path from "path";

const hashFile = async (filename: string) => {
  const file = await fs.readFile(path.resolve(`${process.env.DEST_DIR}/${filename}`), "utf-8");
  const hash = createHash("sha256").update(file).digest("hex");
  return hash;
};

export { hashFile };
