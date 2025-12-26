package my_app.services;

import java.util.Map;

public class AppService {
    public Object getInitData() {
        return Map.of("appName", "Coesion Framework", "version", "1.0-MVP");
    }
}