# Bridge JavaScript - Arquitetura Escalável

Esta pasta contém a camada de comunicação entre JavaScript e Java.

## Estrutura

```
bridge/
├── jwb-bridge.js    # Protocolo de mensagens (baixo nível)
├── services.js      # APIs de alto nível (use isso!)
└── README.md        # Esta documentação
```

## Princípio de Uso

### ❌ NÃO FAÇA ISSO (baixo nível)

```javascript
// Não use diretamente o protocolo de mensagens
const res = await JWB.send('READ_FILE', { path: 'config.json' });
```

### ✅ FAÇA ISSO (alto nível)

```javascript
// Use os serviços que abstraem o protocolo
const fileData = await FileService.readFile('config.json');
```

## Serviços Disponíveis

### FileService

```javascript
// Ler arquivo
const data = await FileService.readFile('config.json');
// Retorna: { content: string, size: number, path: string }

// Escrever arquivo
await FileService.writeFile('output.txt', 'conteúdo');

// Listar diretório
const files = await FileService.listDirectory('/path/to/dir');
// Retorna: Array<{name: string, type: string, size: number}>
```

### AppService

```javascript
// Obter dados de inicialização
const appData = await AppService.getInitData();
// Retorna: { appName: string, version: string }

// Obter informações da aplicação
const info = await AppService.getAppInfo();
```

## Adicionando Novos Serviços

1. **No Java**: Crie o serviço em `my_app.services`
2. **No Java**: Adicione o tipo de ação em `ModelRequest.RequestType`
3. **No Java**: Adicione o roteamento em `JavaBridge.postMessage()`
4. **No JavaScript**: Adicione o método em `services.js`

### Exemplo: Criar um DatabaseService

**1. Java Service:**

```java
package my_app.services;

public class DatabaseService {
    public Object query(String sql) {
        // implementação
    }
}
```

**2. Adicionar tipo:**

```java
public enum RequestType {
    // ... existentes
    @JsonProperty("DB_QUERY")
    DB_QUERY
}
```

**3. Roteamento:**

```java
case DB_QUERY -> {
    Object result = databaseService.query((String) request.payload());
    handleResponse(request.id(), result);
}
```

**4. JavaScript Service:**

```javascript
window.DatabaseService = {
  async query(sql) {
    const response = await window.JWB.send('DB_QUERY', { sql });
    if (response.status === 'ERROR') {
      throw new Error(response.payload.message);
    }
    return response.payload;
  },
};
```

Agora você pode usar:

```javascript
const results = await DatabaseService.query('SELECT * FROM users');
```

## Benefícios desta Arquitetura

1. **Separação de Responsabilidades**: UI não conhece protocolo
2. **Fácil de Testar**: Serviços podem ser mockados
3. **Escalável**: Adicionar novos serviços é simples
4. **Type-Safe**: Cada serviço tem sua interface clara
5. **Manutenível**: Mudanças no protocolo não afetam o código da UI

## Tratamento de Erros

Todos os serviços lançam exceções em caso de erro:

```javascript
try {
  const data = await FileService.readFile('inexistente.txt');
} catch (error) {
  console.error('Erro:', error.message);
  // Tratar erro na UI
}
```
