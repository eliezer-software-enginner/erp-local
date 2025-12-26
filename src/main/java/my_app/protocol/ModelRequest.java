package my_app.protocol;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ModelRequest(
    String protocol,
    String id,
    RequestType type,
    Object payload) {
  public enum RequestType {
    @JsonProperty("INIT_APP")
    INIT_APP,
    @JsonProperty("READ_FILE")
    READ_FILE,
    @JsonProperty("SPAWN_WINDOW")
    SPAWN_WINDOW,
    @JsonProperty("LOAD_HTML")
    LOAD_HTML,
    GET_APP_INFO, WRITE_FILE, LIST_DIRECTORY
  }
}

/*
 * {
 * protocol: "1.0",
 * id: "uuid",
 * type: "ACTION_NAME",
 * payload: {}
 * }
 */
