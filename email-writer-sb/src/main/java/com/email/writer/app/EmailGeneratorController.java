package com.email.writer.app;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // consider restricting later for production
public class EmailGeneratorController {

    private final EmailGeneratorService emailGeneratorService;

    @PostMapping("/generate")
    public ResponseEntity<?> generateEmail(@Valid @RequestBody EmailRequest request) {
        String reply = emailGeneratorService.emailGenerateReply(request);

        // Wrap in a JSON object for cleaner frontend parsing
        return ResponseEntity.ok(Map.of("generatedReply", reply));
    }

    // Optional simple health check endpoint
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("✅ EmailWriter API is running");
    }
}
