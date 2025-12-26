# Sistema de Roteamento e Janelas

Este diretório contém a lógica de aplicação JavaScript, incluindo o sistema de roteamento.

## Roteamento

O sistema de roteamento permite navegar entre diferentes páginas HTML na mesma janela, similar ao Vue Router ou React Router.

### Uso Básico

```javascript
// 1. Configurar o container onde as páginas serão renderizadas
Router.setContainer('app'); // ou Router.setContainer(document.getElementById('app'))

// 2. Registrar rotas
Router.register('/home', 'home.html');
Router.register('/about', 'about.html');
Router.register('/settings', 'settings.html');

// 3. Navegar
Router.navigate('/home');
```

### Exemplo Completo

```javascript
// No index.html (entry point)
document.addEventListener('DOMContentLoaded', async () => {
  // Configura o container
  Router.setContainer('app');

  // Registra todas as rotas
  Router.register('/home', 'home.html');
  Router.register('/about', 'about.html');

  // Navega para a página inicial
  await Router.navigate('/home');
});

// Em qualquer página HTML
<a href='#' onclick="Router.navigate('/about'); return false;">
  Sobre
</a>;
```

### API do Router

- `Router.setContainer(element)` - Define o elemento container
- `Router.register(path, htmlPath)` - Registra uma rota
- `Router.navigate(path)` - Navega para uma rota
- `Router.getCurrentRoute()` - Obtém a rota atual
- `Router.getRoutes()` - Obtém todas as rotas registradas

### Eventos

O router dispara um evento `route-changed` quando a navegação ocorre:

```javascript
window.addEventListener('route-changed', (event) => {
  console.log('Navegado para:', event.detail.path);
  console.log('HTML carregado:', event.detail.htmlPath);
});
```

## Criação de Novas Janelas (SPAWN_WINDOW)

Use o `WindowService` para criar novas janelas (Stages) que renderizam HTMLs específicos.

### Uso

```javascript
// Criar uma nova janela simples
await WindowService.spawnWindow('settings.html');

// Com opções customizadas
await WindowService.spawnWindow('settings.html', {
  title: 'Configurações',
  width: 600,
  height: 400,
});
```

### Exemplo

```javascript
async function openSettings() {
  try {
    await WindowService.spawnWindow('settings.html', {
      title: 'Configurações',
      width: 800,
      height: 600,
    });
  } catch (error) {
    alert('Erro ao abrir janela: ' + error.message);
  }
}
```

## Estrutura de Arquivos

```
web/
├── public/
│   ├── index.html      # Entry point (carrega router e inicializa)
│   ├── home.html       # Página inicial
│   ├── about.html      # Página sobre
│   └── settings.html   # Página de configurações (pode ser aberta em nova janela)
└── app/
    └── router.js       # Sistema de roteamento
```

## Boas Práticas

1. **Entry Point**: Use `index.html` apenas como entry point, não coloque conteúdo lá
2. **Rotas**: Registre todas as rotas no entry point
3. **Navegação**: Use `Router.navigate()` para navegação interna
4. **Janelas**: Use `WindowService.spawnWindow()` para diálogos, configurações, etc.
5. **Scripts**: Cada HTML pode ter seus próprios scripts, mas lembre-se de carregar a bridge se precisar

## Diferença entre Router e WindowService

- **Router**: Navegação dentro da mesma janela (SPA-like)
- **WindowService**: Criação de novas janelas independentes (modais, diálogos, etc.)
