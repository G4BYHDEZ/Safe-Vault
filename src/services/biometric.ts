import * as LocalAuthentication from "expo-local-authentication";

export async function authenticateBiometric(): Promise<boolean> {
  try {
    const hasHardware =
      await LocalAuthentication.hasHardwareAsync();

    if (!hasHardware) {
      return false;
    }

    const isEnrolled =
      await LocalAuthentication.isEnrolledAsync();

    if (!isEnrolled) {
      return false;
    }

    const result =
      await LocalAuthentication.authenticateAsync({
        promptMessage: "Desbloquear SafeVault",
        cancelLabel: "Cancelar",
        fallbackLabel: "Usar código",
        disableDeviceFallback: false,
        biometricsSecurityLevel: "strong",
      });

    return result.success;
  } catch (error) {
    console.error(
      "Error de autenticación:",
      error
    );

    return false;
  }
}