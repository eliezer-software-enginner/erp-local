# Sistema de Roteamento e SPAWN_WINDOW

Este documento descreve o sistema de roteamento entre múltiplos HTMLs e a funcionalidade de criar novas janelas.

## Visão Geral

A aplicação agora suporta:

1. **Roteamento**: Navegação entre páginas HTML na mesma janela (SPA-like)
2. **SPAWN_WINDOW**: Criação de novas janelas (Stages) independentes

## Arquitetura

### Entry Point (`index.html`)

O `index.html` funciona como entry point, similar ao Vue ou React:

- Carrega todos os scripts necessários (bridge, services, router)
- Configura o sistema de roteamento
- Registra todas as rotas
- Navega para a página inicial

### Estrutura de Arquivos

```
web/
├── public/
│   ├── index.html      # Entry point
│   ├── home.html       # Página inicial
│   ├── about.html      # Página sobre
│   └── settings.html    # Configurações (pode ser janela)
├── bridge/
│   ├── jwb-bridge.js   # Protocolo de mensagens
│   └── services.js      # APIs de alto nível
└── app/
    └── router.js        # Sistema de roteamento
```

## Roteamento

### Como Funciona

O sistema de roteamento carrega HTMLs dinamicamente via `fetch` e renderiza o conteúdo no container especificado.

### Uso Básico

```javascript
// 1. Configurar container
Router.setContainer('app');

// 2. Registrar rotas
Router.register('/home', 'home.html');
Router.register('/about', 'about.html');

// 3. Navegar
Router.navigate('/home');
```

### Exemplo Completo

```javascript
// No index.html
document.addEventListener('DOMContentLoaded', async () => {
  Router.setContainer('app');
  Router.register('/home', 'home.html');
  Router.register('/about', 'about.html');
  await Router.navigate('/home');
});

// Em qualquer página
<a href='#' onclick="Router.navigate('/about'); return false;">
  Sobre
</a>;
```

## SPAWN_WINDOW

### Como Funciona

O `SPAWN_WINDOW` cria uma nova `Stage` (janela) do JavaFX que renderiza um HTML específico. Cada janela tem sua própria bridge injetada.

### Uso

```javascript
// Janela simples
await WindowService.spawnWindow('settings.html');

// Com opções
await WindowService.spawnWindow('settings.html', {
  title: 'Configurações',
  width: 600,
  height: 400,
});
```

### Implementação Java

O `WindowService` cria uma nova `Stage` com `WebView`, carrega o HTML e injeta a bridge automaticamente.

## Diferenças

| Feature    | Router            | WindowService    |
| ---------- | ----------------- | ---------------- |
| **Uso**    | Navegação interna | Diálogos, modais |
| **Janela** | Mesma janela      | Nova janela      |
| **Estado** | Compartilhado     | Isolado          |
| **Bridge** | Compartilhada     | Nova instância   |

## Boas Práticas

### Para Roteamento

1. Use `index.html` apenas como entry point
2. Registre todas as rotas no entry point
3. Cada página HTML deve ser autocontida
4. Use eventos `route-changed` para reações a navegação

### Para SPAWN_WINDOW

1. Use para diálogos, configurações, modais
2. Cada janela é independente
3. A bridge é injetada automaticamente
4. Janelas podem comunicar via eventos se necessário

## Exemplos

### Exemplo 1: Navegação Simples

```html
<!-- home.html -->
<nav>
  <a href="#" onclick="Router.navigate('/home'); return false;">Home</a>
  <a href="#" onclick="Router.navigate('/about'); return false;">Sobre</a>
</nav>
```

### Exemplo 2: Abrir Janela de Configurações

```html
<!-- home.html -->
<button onclick="openSettings()">Configurações</button>

<script>
  async function openSettings() {
    await WindowService.spawnWindow('settings.html', {
      title: 'Configurações',
      width: 600,
      height: 400,
    });
  }
</script>
```

## Próximos Passos

Possíveis melhorias futuras:

1. **Histórico de navegação**: Back/Forward buttons
2. **Parâmetros de rota**: `/user/:id`
3. **Guards de rota**: Autenticação, permissões
4. **Lazy loading**: Carregar páginas sob demanda
5. **Comunicação entre janelas**: Eventos customizados

## Troubleshooting

### Scripts não carregam em páginas roteadas

Os scripts já estão carregados no `index.html`, então devem estar disponíveis. Se não estiverem, verifique se o router está preservando o contexto.

### Bridge não funciona em nova janela

A bridge é injetada automaticamente quando a página carrega. Aguarde o evento `load` se necessário.

### Erro ao carregar HTML

Verifique se o caminho está correto e se o arquivo existe em `/web/public/`.
