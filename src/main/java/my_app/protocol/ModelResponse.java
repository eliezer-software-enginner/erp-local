package my_app.protocol;

public record ModelResponse(
    String id,
    ResponseStatus status,
    Object payload) {
  public enum ResponseStatus {
    ERROR, SUCCESS
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
