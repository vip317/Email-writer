package com.email.writer.app;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@AllArgsConstructor
@CrossOrigin(origins = "*")
public class EmailGeneratorConntroller {

    private final EmailGeneratorService emailGeneratorService ;

    @PostMapping("/generate")
    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailrequest) {
        String response = emailGeneratorService.emailGenrateReply(emailrequest);
        return ResponseEntity.ok(response);
    }
}
