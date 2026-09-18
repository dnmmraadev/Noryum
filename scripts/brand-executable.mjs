import { readFile, writeFile } from "node:fs/promises";
import * as PE from "pe-library";
import * as ResEdit from "resedit";

export async function brandExecutable(file) {
  const metadata = JSON.parse(await readFile("package.json", "utf8"));
  const [major, minor, patch] = metadata.version.split(".").map(Number);
  const exe = PE.NtExecutable.from(await readFile(file), { ignoreCert: true });
  const resources = PE.NtExecutableResource.from(exe);
  const icon = ResEdit.Data.IconFile.from(await readFile("assets/icon.ico"));
  const groups = resources.entries.filter((entry) => entry.type === 14);
  for (const group of groups.length ? groups : [{ id: 1, lang: 1033 }]) {
    ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
      resources.entries,
      group.id,
      group.lang,
      icon.icons.map((item) => item.data),
    );
  }
  const versions = ResEdit.Resource.VersionInfo.fromEntries(resources.entries);
  for (const version of versions) {
    version.setFileVersion(major, minor, patch, 0, 1033);
    version.setProductVersion(major, minor, patch, 0, 1033);
    for (const language of version.getAllLanguagesForStringValues()) {
      version.setStringValues(language, {
        ProductName: "Noryum",
        FileDescription: "Noryum - Intelligent Business Engineering",
        InternalName: "Noryum",
        OriginalFilename: "Noryum.exe",
        CompanyName: "Noryum",
      });
    }
    version.outputToResourceEntries(resources.entries);
  }
  resources.outputResource(exe);
  await writeFile(file, Buffer.from(exe.generate()));
}
