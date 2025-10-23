package com.email.writer.app;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {

    @NotBlank(message = "Email content cannot be empty")
    private String emailContent;

    private String tone; // e.g. "formal", "friendly", "concise"
}
