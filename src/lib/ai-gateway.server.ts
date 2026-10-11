import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { AiExtractionDisabledError, isAiExtractionEnabledServer } from "./ai-feature";

export function createLovableAiGatewayProvider(apiKey: string) {
  // Defense in depth: no provider client can be created while AI is disabled.
  if (!isAiExtractionEnabledServer()) throw new AiExtractionDisabledError();
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
