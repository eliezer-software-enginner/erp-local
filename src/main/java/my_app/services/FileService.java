package my_app.services;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;

public class FileService {
    public Map<String, Object> readFile(Object payload) throws Exception {
        // 1. Validação do Payload
        if (!(payload instanceof Map)) {
            throw new IllegalArgumentException("Payload inválido");
        }

        @SuppressWarnings("unchecked")
        Map<String, Object> data = (Map<String, Object>) payload;
        String fileName = (String) data.get("path");

        if (fileName == null || fileName.isEmpty()) {
            throw new IllegalArgumentException("O campo 'path' é obrigatório");
        }

        // 2. Localização do arquivo
        // Paths.get("") aponta para a raiz onde o comando 'java' foi executado
        Path path = Paths.get(fileName);
        System.out.println("[FileService] Tentando ler caminho absoluto: " + path.toAbsolutePath());

        if (!Files.exists(path)) {
            throw new java.io.FileNotFoundException("Arquivo não encontrado na raiz: " + path.toAbsolutePath());
        }

        // 3. Leitura Real do Conteúdo
        String content = Files.readString(path);
        long size = Files.size(path);

        return Map.of(
                "content", content,
                "size", size,
                "path", fileName,
                "absolutePath", path.toAbsolutePath().toString());
    }

    /**
     * Lê o conteúdo de um arquivo HTML dos recursos
     * 
     * @param htmlPath - Caminho do HTML relativo a /web/public/
     * @return Conteúdo do arquivo HTML
     */
    public String readHtmlResource(String htmlPath) throws IOException {
        String resourcePath = "/web/public/" + htmlPath;
        System.out.println("[FileService] Lendo HTML de recurso: " + resourcePath);

        try (InputStream is = FileService.class.getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new IOException("Recurso não encontrado: " + resourcePath);
            }
            String content = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            System.out.println("[FileService] HTML lido com sucesso, tamanho: " + content.length() + " bytes");
            return content;
        }
    }
}