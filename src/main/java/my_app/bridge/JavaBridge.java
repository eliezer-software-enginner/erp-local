package my_app.bridge;

import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;

import javafx.application.Platform;
import javafx.scene.web.WebEngine;
import my_app.protocol.ModelRequest;
import my_app.protocol.ModelResponse;
import my_app.protocol.ModelResponse.ResponseStatus;
import my_app.services.AppService;
import my_app.services.FileService;
import my_app.services.WindowService;

public class JavaBridge {
  private final WebEngine engine;
  private final ObjectMapper mapper = new ObjectMapper();

  // Services injetados (Princípio: Bridge conhece Services, mas não vice-versa)
  private final AppService appService = new AppService();
  private final FileService fileService = new FileService();
  private final WindowService windowService = new WindowService();

  public JavaBridge(WebEngine engine) {
    this.engine = engine;
  }

  public void postMessage(String json) {
    try {
      System.out.println("[JWB][RAW] Recebido: " + json);
      ModelRequest request = mapper.readValue(json, ModelRequest.class);
      System.out.println("[JWB][REQUEST][" + request.type() + "] id: " + request.id());
      System.out.println("[JWB][PAYLOAD] " + request.payload());

      switch (request.type()) {
        case INIT_APP -> handleResponse(request.id(), appService.getInitData());
        case READ_FILE -> {
          System.out.println("[JWB] Iniciando leitura de arquivo em thread separada...");
          new Thread(() -> {
            try {
              Object result = fileService.readFile(request.payload());
              System.out.println("[JWB] Arquivo lido com sucesso, enviando resposta...");
              handleResponse(request.id(), result);
            } catch (Exception e) {
              System.err.println("[JWB] Erro ao ler arquivo: " + e.getMessage());
              e.printStackTrace();
              handleError(request.id(), "FILE_READ_ERROR", e.getMessage());
            }
          }).start();
        }
        case SPAWN_WINDOW -> {
          System.out.println("[JWB] Criando nova janela...");
          try {
            @SuppressWarnings("unchecked")
            Map<String, Object> payload = (Map<String, Object>) request.payload();
            String htmlPath = (String) payload.get("htmlPath");
            String title = (String) payload.get("title");
            Integer width = payload.get("width") != null ? ((Number) payload.get("width")).intValue() : null;
            Integer height = payload.get("height") != null ? ((Number) payload.get("height")).intValue() : null;

            Map<String, Object> result = windowService.spawnWindow(htmlPath, title, width, height);
            handleResponse(request.id(), result);
          } catch (Exception e) {
            System.err.println("[JWB] Erro ao criar janela: " + e.getMessage());
            e.printStackTrace();
            handleError(request.id(), "WINDOW_SPAWN_ERROR", e.getMessage());
          }
        }
        case LOAD_HTML -> {
          System.out.println("[JWB] Carregando HTML de recurso...");
          try {
            String htmlPath = (String) request.payload();
            if (htmlPath == null) {
              throw new IllegalArgumentException("htmlPath não fornecido");
            }
            String htmlContent = fileService.readHtmlResource(htmlPath);
            handleResponse(request.id(), Map.of("content", htmlContent, "path", htmlPath));
          } catch (Exception e) {
            System.err.println("[JWB] Erro ao carregar HTML: " + e.getMessage());
            e.printStackTrace();
            handleError(request.id(), "HTML_LOAD_ERROR", e.getMessage());
          }
        }
        default -> System.out.println("Ação não implementada: " + request.type());
      }
    } catch (Exception e) {
      System.err.println("[JWB] Erro ao processar mensagem: " + e.getMessage());
      e.printStackTrace();
      handleError("global", "INTERNAL_ERROR", e.getMessage());
    }
  }

  // private void handleResponse(String id, Object payload) {
  // try {
  // String jsonResponse = mapper.writeValueAsString(Map.of(
  // "id", id,
  // "status", "SUCCESS",
  // "payload", payload));

  // // Transforma em Base64 para garantir que NENHUM caractere especial quebre o
  // JS
  // String base64Response =
  // java.util.Base64.getEncoder().encodeToString(jsonResponse.getBytes(java.nio.charset.StandardCharsets.UTF_8));

  // Platform.runLater(() -> {
  // // Decodifica no lado do JS (atob) antes de passar para o Handler
  // String script = String.format(
  // "if(window.__JWB_HANDLE_RESPONSE) {
  // window.__JWB_HANDLE_RESPONSE(decodeURIComponent(escape(atob('%s')))); }",
  // base64Response);

  // try {
  // engine.executeScript(script);
  // } catch (Exception e) {
  // System.err.println("[JWB] Erro fatal ao executar script: " + e.getMessage());
  // }
  // });
  // } catch (Exception e) {
  // e.printStackTrace();
  // }
  // }

  private void handleResponse(String id, Object payload) {
    try {

      var model = new ModelResponse(id, ResponseStatus.SUCCESS, payload);
      String jsonResponse = mapper.writeValueAsString(model);

      Platform.runLater(() -> {
        // Passamos como STRING para o JS e ele faz o parse lá
        String script = String.format(
            "if(window.__JWB_HANDLE_RESPONSE) { window.__JWB_HANDLE_RESPONSE(%s); }",
            jsonResponse);
        engine.executeScript(script);
      });
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private void handleError(String id, String code, String message) {
    try {
      // Erro não é exceção, é dado estruturado
      String errorJson = mapper.writeValueAsString(Map.of(
          "id", id,
          "status", "ERROR",
          "payload", Map.of("code", code, "message", message != null ? message : "Erro desconhecido")));
      System.out.println("[JWB][ERROR] Enviando: " + errorJson);

      // Escapa o JSON corretamente
      String escapedJson = errorJson
          .replace("\\", "\\\\")
          .replace("\n", "\\n")
          .replace("\r", "\\r")
          .replace("\t", "\\t")
          .replace("'", "\\'")
          .replace("\"", "\\\"");

      // Usa a mesma abordagem segura do handleResponse
      Platform.runLater(() -> {
        try {
          String varName = "__jwb_err_" + id.replace("-", "_").replaceAll("[^a-zA-Z0-9_]", "_");
          String script = String.format(
              "try { var %s = JSON.parse('%s'); if (window.__JWB_HANDLE_RESPONSE) window.__JWB_HANDLE_RESPONSE(%s); } catch(e) { console.error('[JWB] Erro ao processar erro:', e); }",
              varName, escapedJson, varName);
          engine.executeScript(script);
        } catch (Exception e) {
          System.err.println("[JWB] Erro ao executar JavaScript de erro: " + e.getMessage());
          e.printStackTrace();
        }
      });
    } catch (Exception e) {
      System.err.println("[JWB] Erro ao serializar erro: " + e.getMessage());
      e.printStackTrace();
    }
  }

}