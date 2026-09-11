import {
  useEffect,
  useState,
} from "react";

import {
  File as ExpoFile,
} from "expo-file-system";

import {
  Alert,
  AppState,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import FilePreview from "../components/FilePreview";

import {
  authenticateBiometric,
} from "../services/biometric";

import {
  deleteFile,
  initializeVault,
  saveFile,
} from "../services/vault";

type VaultFile = {
  id: string;
  name: string;
  uri: string;
  type: string;
  mimeType?: string | null;
};

export default function Index() {
  const [authenticated, setAuthenticated] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [files, setFiles] =
    useState<VaultFile[]>([]);

  const [previewFile, setPreviewFile] =
    useState<VaultFile | null>(null);

  useEffect(() => {
    initializeVault();

    unlockVault();
  }, []);

  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        "change",
        (state) => {
          if (state === "active") {
            if (authenticated) {
              unlockVault();
            }
          }
        }
      );

    return () => {
      subscription.remove();
    };
  }, [authenticated]);

  async function unlockVault() {
    setLoading(true);

    const success =
      await authenticateBiometric();

    setAuthenticated(success);
    setLoading(false);

    if (!success) {
      Alert.alert(
        "Acceso bloqueado",
        "Necesitas autenticarte para acceder a SafeVault."
      );
    }
  }

  async function addPhotosAndVideos() {
    try {
      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: [
            "images",
            "videos",
          ],
          allowsMultipleSelection: true,
          quality: 1,
        });

      if (result.canceled) {
        return;
      }

      const newFiles: VaultFile[] = [];

      for (const asset of result.assets) {
        const fileName =
          asset.fileName ||
          `archivo-${Date.now()}`;

        const savedUri = await saveFile(
          asset.uri,
          fileName
        );
        newFiles.push({
          id: Date.now().toString() +
            Math.random().toString(),

          name: fileName,

          uri: savedUri,

          type:
            asset.type === "video"
              ? "video"
              : "image",

          mimeType:
            asset.mimeType,
        });
      }

      setFiles((current) => [
        ...current,
        ...newFiles,
      ]);

      Alert.alert(
        "Archivos protegidos",
        `${newFiles.length} archivo(s) agregado(s) a SafeVault.`
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        "Error",
        "No fue posible guardar los archivos."
      );
    }
  }

  async function addDocuments() {
  try {
    const result =
      await ExpoFile.pickFileAsync({
        multipleFiles: true,
        mimeTypes: ["*/*"],
      });

    if (result.canceled) {
      return;
    }

    const selectedFiles = Array.isArray(
      result.result
    )
      ? result.result
      : [result.result];

    const newFiles: VaultFile[] = [];

    for (const file of selectedFiles) {

      const fileName = file.name;

      const savedUri = await saveFile(
        file.uri,
        fileName
      );

      newFiles.push({
        id:
          Date.now().toString() +
          Math.random().toString(),

        name: fileName,

        uri: savedUri,

        type: "document",

        mimeType: file.type || null,
      });
    }

    setFiles((current) => [
      ...current,
      ...newFiles,
    ]);

    Alert.alert(
      "Documentos protegidos",
      `${newFiles.length} documento(s) agregado(s).`
    );

  } catch (error) {

    console.error(
      "Error seleccionando documento:",
      error
    );

    Alert.alert(
      "Error",
      "No fue posible seleccionar el documento."
    );
  }
}

  function removeFile(file: VaultFile) {
    Alert.alert(
      "Eliminar archivo",
      `¿Quieres eliminar "${file.name}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            deleteFile(file.uri);

            setFiles((current) =>
              current.filter(
                (item) =>
                  item.id !== file.id
              )
            );
          },
        },
      ]
    );
  }

  function renderFile({
    item,
  }: {
    item: VaultFile;
  }) {
    let icon = "📄";

    if (item.type === "image") {
      icon = "📷";
    }

    if (item.type === "video") {
      icon = "🎥";
    }

    return (
      <TouchableOpacity
        style={styles.fileCard}
        onPress={() =>
          setPreviewFile(item)
        }
        onLongPress={() =>
          removeFile(item)
        }
      >
        {item.type === "image" ? (
          <Image
            source={{ uri: item.uri }}
            style={styles.thumbnail}
          />
        ) : (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>
              {icon}
            </Text>
          </View>
        )}

        <View style={styles.fileInfo}>
          <Text
            style={styles.fileName}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <Text style={styles.fileType}>
            {item.type === "image"
              ? "Foto protegida"
              : item.type === "video"
              ? "Video protegido"
              : "Documento protegido"}
          </Text>
        </View>

        <Text style={styles.lock}>
          🔒
        </Text>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.logo}>
          🔐
        </Text>

        <Text style={styles.loadingText}>
          Protegiendo SafeVault...
        </Text>
      </View>
    );
  }

  if (!authenticated) {
    return (
      <View style={styles.lockScreen}>
        <Text style={styles.logo}>
          🔐
        </Text>

        <Text style={styles.title}>
          SafeVault
        </Text>

        <Text style={styles.subtitle}>
          Tu bóveda privada
        </Text>

        <TouchableOpacity
          style={styles.unlockButton}
          onPress={unlockVault}
        >
          <Text style={styles.unlockText}>
            🔓 Desbloquear
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            SafeVault
          </Text>

          <Text style={styles.subtitle}>
            {files.length} archivo(s) protegido(s)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.lockButton}
          onPress={() => setAuthenticated(false)}
        >
          <Text>🔒</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttons}>

        <TouchableOpacity
          style={styles.addButton}
          onPress={
            addPhotosAndVideos
          }
        >
          <Text style={styles.buttonText}>
            📷 Fotos / Videos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addButton}
          onPress={addDocuments}
        >
          <Text style={styles.buttonText}>
            📄 Documentos
          </Text>
        </TouchableOpacity>

      </View>

      <FlatList
        data={files}
        renderItem={renderFile}
        keyExtractor={(item) =>
          item.id
        }
        contentContainerStyle={
          files.length === 0
            ? styles.emptyList
            : undefined
        }
        ListEmptyComponent={
          <View>
            <Text style={styles.emptyIcon}>
              🗃️
            </Text>

            <Text style={styles.emptyTitle}>
              Tu bóveda está vacía
            </Text>

            <Text style={styles.emptyText}>
              Agrega fotos, videos o
              documentos para comenzar.
            </Text>
          </View>
        }
      />
      <FilePreview
        visible={previewFile !== null}
        uri={previewFile?.uri ?? ""}
        name={previewFile?.name ?? ""}
        type={
          previewFile?.type === "image"
            ? "image"
            : previewFile?.type === "video"
            ? "video"
            : "document"
        }
        mimeType={
          previewFile?.mimeType
        }
        onClose={() =>
          setPreviewFile(null)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  loading: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },

  lockScreen: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center"
  },

  logo: {
    fontSize: 70,
    marginBottom: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
  },

  subtitle: {
    color: "#6B7280",
    marginTop: 5,
    fontSize: 15,
  },

  loadingText: {
    color: "#fff",
    fontSize: 17,
  },

  unlockButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 40,
  },

  unlockText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  lockButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },

  buttons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  addButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },

  fileCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    fontSize: 28,
  },

  fileInfo: {
    flex: 1,
    marginLeft: 14,
  },

  fileName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  fileType: {
    color: "#6B7280",
    marginTop: 4,
    fontSize: 12,
  },

  lock: {
    fontSize: 18,
    marginLeft: 10,
  },

  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 60,
    textAlign: "center",
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginTop: 15,
  },

  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
});