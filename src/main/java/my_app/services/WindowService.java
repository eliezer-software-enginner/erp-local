package my_app.services;

import java.util.Map;

import javafx.application.Platform;
import javafx.scene.Scene;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;

/**
 * Serviço responsável por criar e gerenciar novas janelas (Stages)
 */
public class WindowService {

    /**
     * Cria uma nova janela com o HTML especificado
     * 
     * @param htmlPath - Caminho do arquivo HTML relativo a /web/public/
     * @param title    - Título da janela
     * @param width    - Largura da janela (padrão: 800)
     * @param height   - Altura da janela (padrão: 600)
     * @return Informações sobre a janela criada
     */
    public Map<String, Object> spawnWindow(String htmlPath, String title, Integer width, Integer height) {
        final int w = width != null ? width : 800;
        final int h = height != null ? height : 600;
        final String t = title != null ? title : "Nova Janela";

        Platform.runLater(() -> {
            try {
                Stage newStage = new Stage();
                WebView webView = new WebView();
                WebEngine engine = webView.getEngine();

                // Carrega o HTML
                String resourcePath = "/web/public/" + htmlPath;
                String url = WindowService.class.getResource(resourcePath).toExternalForm();
                engine.load(url);

                // Injeta a bridge quando a página carregar
                engine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
                    if (newState == javafx.concurrent.Worker.State.SUCCEEDED) {
                        try {
                            JSObject window = (JSObject) engine.executeScript("window");
                            window.setMember("__JWB_BRIDGE__", new my_app.bridge.JavaBridge(engine));
                            System.out.println("[WindowService] Bridge injetada na nova janela: " + htmlPath);
                            // Notifica que a bridge está pronta
                            engine.executeScript("if (window.__JWB_BRIDGE_READY) window.__JWB_BRIDGE_READY();");
                        } catch (Exception e) {
                            System.err.println("[WindowService] Erro ao injetar bridge: " + e.getMessage());
                        }
                    }
                });

                newStage.setScene(new Scene(webView, w, h));
                newStage.setTitle(t);
                newStage.show();

                System.out.println("[WindowService] Nova janela criada: " + htmlPath + " (" + w + "x" + h + ")");
            } catch (Exception e) {
                System.err.println("[WindowService] Erro ao criar janela: " + e.getMessage());
                e.printStackTrace();
            }
        });

        return Map.of(
                "success", true,
                "htmlPath", htmlPath,
                "title", t,
                "width", w,
                "height", h);
    }
}
