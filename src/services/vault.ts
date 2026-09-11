import {
    Directory,
    File,
    Paths,
} from "expo-file-system";

const vaultDirectory = new Directory(
  Paths.document,
  "SafeVault"
);

export function initializeVault() {
  if (!vaultDirectory.exists) {
    vaultDirectory.create({
      intermediates: true,
      idempotent: true,
    });
  }
}

export function getVaultDirectory() {
  return vaultDirectory;
}

export async function saveFile(
  sourceUri: string,
  fileName: string
): Promise<string> {

  initializeVault();

  const sourceFile = new File(
    sourceUri
  );

  const destinationFile = new File(
    vaultDirectory,
    `${Date.now()}-${fileName}`
  );

  await sourceFile.copy(
    destinationFile
  );

  return destinationFile.uri;
}

export function deleteFile(uri: string) {
  const file = new File(uri);

  if (file.exists) {
    file.delete();
  }
}