package com.email.writer.app;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class EmailGeneratorService {

    private final WebClient webClient;

    // Load from env or application.properties (never hardcode)
    public EmailGeneratorService(@Value("${gemini.api.key:#{null}}") String geminiApiKey) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            throw new IllegalStateException("❌ Gemini API key is missing! Set 'GEMINI_API_KEY' as env or in application.properties");
        }

        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultUriVariables(Map.of("key", geminiApiKey))
                .build();
    }

    public String emailGenerateReply(EmailRequest emailRequest) {
        try {
            String prompt = buildPrompt(emailRequest);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            Map<String, Object> response = webClient.post()
                    .uri("/v1beta/models/gemini-2.0-flash:generateContent?key={key}")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30)) // prevent hanging
                    .retry(1) // retry once on transient error
                    .block();

            if (response == null || !response.containsKey("candidates")) {
                return "⚠️ No response from Gemini.";
            }

            List<?> candidates = (List<?>) response.get("candidates");
            if (candidates.isEmpty()) return "⚠️ Empty candidate list from Gemini.";

            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = (List<?>) content.get("parts");

            if (parts == null || parts.isEmpty()) return "⚠️ Empty parts from Gemini.";

            return (String) ((Map<?, ?>) parts.get(0)).get("text");

        } catch (WebClientResponseException e) {
            return "❌ Gemini API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
        } catch (Exception e) {
            return "❌ Error generating reply: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        String tone = (emailRequest.getTone() == null || emailRequest.getTone().isBlank())
                ? "neutral"
                : emailRequest.getTone();

        return "Write a short, polite, and professional email reply in a "
                + tone
                + " tone to the following email:\n\n"
                + emailRequest.getEmailContent();
    }
}
