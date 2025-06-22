// src/services/authService.ts
import {  setCache } from "@/lib/Cache";
import { useAuthenticateUser } from "@/hooks/DynamicApiHooks";
import { decryptObject } from "@/lib/crypto";

interface Credenciais {
  email: string;
  password: string;
}

export async function reLogin(): Promise<string> {
  const { mutateAsync: authenticate } = useAuthenticateUser();
  const credJson = sessionStorage.getItem("credentials");
  if (!credJson) throw new Error("Nenhuma credencial armazenada");

  const { email, password } = decryptObject<Credenciais>(credJson);
  const response = await authenticate({ email, password });
  const newToken = response.accessToken;
  setCache("token", newToken);
  return newToken;
}
