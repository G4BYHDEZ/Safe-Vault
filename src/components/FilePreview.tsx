import {
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { VideoView, useVideoPlayer } from "expo-video";

type FilePreviewProps = {
  visible: boolean;
  uri: string;
  name: string;
  type: "image" | "video" | "document";
  mimeType?: string | null;
  onClose: () => void;
};

export default function FilePreview({
  visible,
  uri,
  name,
  type,
  mimeType,
  onClose,
}: FilePreviewProps) {
  const player = useVideoPlayer(
    type === "video" ? uri : null,
    (player) => {
      player.loop = false;
    }
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>
              ✕
            </Text>
          </TouchableOpacity>

          <Text
            style={styles.title}
            numberOfLines={1}
          >
            {name}
          </Text>

          <View style={{ width: 30 }} />
        </View>

        {/* IMAGEN */}
        {type === "image" && (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        )}

        {/* VIDEO */}
        {type === "video" && (
          <View style={styles.previewContainer}>
            <VideoView
              player={player}
              style={styles.video}
              nativeControls
              contentFit="contain"
            />
          </View>
        )}

        {/* DOCUMENTO */}
        {type === "document" && (
            <View style={styles.documentContainer}>
                <Text style={styles.documentIcon}>📄</Text>

                <Text style={styles.documentName}>
                {name}
                </Text>

                <Text style={styles.documentType}>
                {mimeType || "Documento"}
                </Text>

                <TouchableOpacity
                style={styles.openDocumentButton}
                onPress={async () => {
                    try {
                    const Sharing = await import("expo-sharing");

                    const available =
                        await Sharing.isAvailableAsync();

                    if (!available) {
                        return;
                    }

                    await Sharing.shareAsync(uri, {
                        mimeType: mimeType || "application/pdf",
                        dialogTitle: "Abrir documento con...",
                    });
                    } catch (error) {
                    console.error(
                        "Error al abrir documento:",
                        error
                    );
                    }
                }}
                >
                <Text style={styles.openDocumentButtonText}>
                    Abrir documento
                </Text>
                </TouchableOpacity>
            </View>
            )}

        {/* BOTÓN CERRAR */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>
            Cerrar
          </Text>
        </TouchableOpacity>

      </View>
    </Modal>
  );
}

const { width, height } =
  Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },

  header: {
    height: 70,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  close: {
    color: "#fff",
    fontSize: 25,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    maxWidth: width * 0.65,
  },

  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    width: width,
    height: height * 0.7,
  },

  video: {
    width: width,
    height: height * 0.65,
  },

  documentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  documentIcon: {
    fontSize: 80,
    marginBottom: 20,
  },

  documentName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  documentType: {
    color: "#9CA3AF",
    marginTop: 8,
  },

  documentInfo: {
    color: "#9CA3AF",
    marginTop: 5,
  },

  openDocumentButton: {
    marginTop: 25,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 10,
    },

    openDocumentButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    },

  closeButton: {
    backgroundColor: "#2563EB",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});