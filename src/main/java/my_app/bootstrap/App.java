package my_app.bootstrap;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.concurrent.Worker;
import javafx.scene.Scene;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import my_app.bridge.JavaBridge;
import netscape.javascript.JSObject;

public class App extends Application {

    private WebView webView;
    private WebEngine engine;
    private boolean bridgeInjected = false;
    private JavaBridge bridge;

    @Override
    public void start(Stage primaryStage) {
        webView = new WebView();
        engine = webView.getEngine();

        engine.load(
                getClass().getResource("/web/public/index.html").toExternalForm());

        engine.getLoadWorker().stateProperty().addListener((obs, old, state) -> {
            if (state == Worker.State.SUCCEEDED && !bridgeInjected) {
                bridgeInjected = true; // Marca como iniciado para evitar múltiplas chamadas
                injectBridge();
            }
        });

        primaryStage.setScene(new Scene(webView, 900, 600));
        primaryStage.setTitle("Webview based - app");

        primaryStage.show();
    }

    private void injectBridge() {
        try {
            final var window = (JSObject) engine.executeScript("window");
            this.bridge = new JavaBridge(engine);

            engine.setOnError(event -> System.err.println("[JS ERROR] " + event.getMessage()));
            engine.setOnAlert(event -> System.out.println("[JS CONSOLE] " + event.getData()));
            engine.getLoadWorker().exceptionProperty().addListener((obs, old, ex) -> {
                if (ex != null)
                    ex.printStackTrace();
            });

            // Sempre injeta a bridge (a flag bridgeInjected garante que só acontece uma
            // vez)
            window.setMember("__JWB_BRIDGE__", this.bridge);
            System.out.println("[JWB] Bridge Java injetada com sucesso!");

            // Notifica o JavaScript que a bridge está pronta (com pequeno delay)
            Platform.runLater(() -> {
                try {
                    engine.executeScript("if (window.__JWB_BRIDGE_READY) window.__JWB_BRIDGE_READY();");
                } catch (Exception e) {
                    System.err.println("[JWB] Erro ao notificar bridge ready: " + e.getMessage());
                }
            });
        } catch (Exception e) {
            System.err.println("[JWB] Erro ao injetar bridge: " + e.getMessage());
            e.printStackTrace();
        }

    }

    public static void main(String[] args) {
        launch(args);
    }
}