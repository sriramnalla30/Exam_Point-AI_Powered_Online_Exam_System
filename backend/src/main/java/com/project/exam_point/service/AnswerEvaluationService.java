package com.project.exam_point.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.http.MediaType;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnswerEvaluationService {

    private final RestTemplate restTemplate;
    private final String ollamaUrl = "http://localhost:11434/api/generate";

    public AnswerEvaluationService() {
        this.restTemplate = new RestTemplate();
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        List<MediaType> supportedMediaTypes = new ArrayList<>(converter.getSupportedMediaTypes());
        supportedMediaTypes.add(MediaType.valueOf("application/x-ndjson"));
        converter.setSupportedMediaTypes(supportedMediaTypes);
        this.restTemplate.setMessageConverters(Arrays.asList(converter));
    }

    public boolean validateLongAnswer(String teacherAnswer, String studentAnswer) {
        try {
            String ollamaResponse = callOllamaAPI(teacherAnswer, studentAnswer);
            return parseOllamaResponse(ollamaResponse);
        } catch (Exception e) {
            System.err.println("Error validating long answer: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean validateSimpleAnswer(String teacherAnswer, String studentAnswer) {
        System.out.println("\n----- Simple Answer Comparison -----");
        System.out.println("Teacher's answer: '" + teacherAnswer + "'");
        System.out.println("Student's answer: '" + studentAnswer + "'");
        boolean result = teacherAnswer.equalsIgnoreCase(studentAnswer.trim());
        System.out.println("Comparison result: " + result);
        return result;
    }

    private String buildPrompt(String teacherAnswer, String studentAnswer) {
        return String.format(
            "You are evaluating a student's answer about why it's hot near the equator.\n\n" +
            "Teacher's answer: \"%s\"\n" +
            "Student's answer: \"%s\"\n\n" +
            "Evaluation criteria:\n" +
            "1. The answer is correct if it explains EITHER:\n" +
            "   - The sun's rays/sunlight hitting directly/vertically\n" +
            "   - More concentrated heat/energy per area\n" +
            "2. These phrases mean the same thing:\n" +
            "   - 'sun's rays hit directly' = 'sunlight strikes vertically'\n" +
            "   - 'concentrated heat' = 'more energy per unit area'\n" +
            "3. The exact wording is NOT important\n" +
            "4. If the core scientific concept is correct, the answer is correct\n\n" +
            "Respond with EXACTLY 'true' if the student's answer is correct (even with different wording),\n" +
            "or EXACTLY 'false' if it's incorrect. Use ONLY the word 'true' or 'false', nothing else.",
            teacherAnswer, studentAnswer
        );
    }

    private boolean parseOllamaResponse(String response) {
        if (response == null || response.trim().isEmpty()) {
            return false;
        }
        
        // Convert to lowercase and trim
        String cleanedResponse = response.toLowerCase().trim();
        
        // First check for exact "true" or "false"
        if (cleanedResponse.equals("true")) {
            return true;
        }
        if (cleanedResponse.equals("false")) {
            return false;
        }
        
        // If not exact, check first word
        String firstWord = cleanedResponse.split("[\\s\\.]+")[0];
        return firstWord.equals("true");
    }

    private String callOllamaAPI(String teacherAnswer, String studentAnswer) {
        System.out.println("\n========== OLLAMA EVALUATION START ==========");
        System.out.println("Teacher's Answer: '" + teacherAnswer + "'");
        System.out.println("Student's Answer: '" + studentAnswer + "'");
        
        try {
            // Construct the prompt template for Ollama
            String prompt = buildPrompt(teacherAnswer, studentAnswer);
            
            System.out.println("\n----- Sending to Ollama (gemma:2b) -----");
            System.out.println("Prompt:\n" + prompt);

            // Wait for Ollama response completion
            OllamaResponse response = waitForCompletion("gemma:2b", prompt);

            if (response == null) {
                System.out.println("ERROR: Null response from Ollama");
                return null;
            }
            if (response.getOutput() == null) {
                System.out.println("ERROR: Null output in Ollama response");
                return null;
            }

            System.out.println("\n----- Ollama Response -----");
            System.out.println("Raw output: '" + response.getOutput() + "'");
            
            return response.getOutput();
            
        } catch (Exception e) {
            System.out.println("ERROR during Ollama evaluation: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private OllamaResponse waitForCompletion(String model, String prompt) {
        try {
            OllamaRequest request = new OllamaRequest(model, prompt);
            OllamaResponse response = restTemplate.postForObject(ollamaUrl, request, OllamaResponse.class);
            
            if (response == null) {
                System.out.println("ERROR: Null response from Ollama API");
                return null;
            }
            
            System.out.println("Ollama Response: " + response.getResponse());
            return response;
        } catch (Exception e) {
            System.out.println("ERROR in Ollama API call: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private static class OllamaRequest {
        private String model;
        private String prompt;
        private boolean stream = false;  // Disable streaming for simpler response handling

        public OllamaRequest(String model, String prompt) {
            this.model = model;
            this.prompt = prompt;
        }

        // Getters and setters
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public String getPrompt() { return prompt; }
        public void setPrompt(String prompt) { this.prompt = prompt; }
        public boolean isStream() { return stream; }
        public void setStream(boolean stream) { this.stream = stream; }
    }

    private static class OllamaResponse {
        private String model;
        private String response;
        private boolean done;
        private long total_duration;

        // Getters and setters
        public String getModel() { return model; }
        public void setModel(String model) { this.model = model; }
        public String getResponse() { return response; }
        public void setResponse(String response) { this.response = response; }
        public boolean isDone() { return done; }
        public void setDone(boolean done) { this.done = done; }
        public long getTotal_duration() { return total_duration; }
        public void setTotal_duration(long total_duration) { this.total_duration = total_duration; }

        public String getOutput() {
            return response != null ? response.trim() : "";
        }
    }
}
