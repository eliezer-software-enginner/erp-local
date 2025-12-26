/**
 * Sistema de Roteamento Simples
 *
 * Gerencia a navegação entre diferentes páginas HTML na mesma janela.
 * Similar ao Vue Router ou React Router, mas mais simples.
 */

(function () {
  'use strict';

  const routes = {};
  let currentRoute = null;
  let containerElement = null;

  /**
   * Router - Sistema de roteamento
   */
  window.Router = {
    /**
     * Registra uma rota
     * @param {string} path - Caminho da rota (ex: '/home', '/about')
     * @param {string} htmlPath - Caminho do arquivo HTML relativo a /web/public/
     */
    register(path, htmlPath) {
      routes[path] = htmlPath;
      console.log(`[Router] Rota registrada: ${path} -> ${htmlPath}`);
    },

    /**
     * Define o elemento container onde as páginas serão renderizadas
     * @param {string|HTMLElement} element - ID do elemento ou elemento DOM
     */
    setContainer(element) {
      if (typeof element === 'string') {
        containerElement = document.getElementById(element);
      } else {
        containerElement = element;
      }
      if (!containerElement) {
        console.error('[Router] Container não encontrado:', element);
      }
    },

    /**
     * Navega para uma rota
     * @param {string} path - Caminho da rota
     */
    async navigate(path) {
      if (!routes[path]) {
        console.error(`[Router] Rota não encontrada: ${path}`);
        return;
      }

      if (!containerElement) {
        console.error(
          '[Router] Container não definido. Use Router.setContainer() primeiro.'
        );
        return;
      }

      currentRoute = path;
      const htmlPath = routes[path];

      try {
        // Obtém a URL base do documento atual
        const currentUrl = window.location.href;
        console.log(`[Router] URL atual: ${currentUrl}`);

        // Remove o nome do arquivo atual (index.html) para obter o diretório
        let baseUrl = currentUrl;
        if (baseUrl.endsWith('index.html')) {
          baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/'));
        } else if (baseUrl.includes('/index.html')) {
          baseUrl = baseUrl.substring(0, baseUrl.lastIndexOf('/index.html'));
        }

        // Constrói a URL completa do HTML
        const htmlUrl = `${baseUrl}/${htmlPath}`;

        console.log(`[Router] Tentando carregar: ${htmlUrl}`);

        let response;
        let useFallback = false;

        try {
          // Tenta carregar via fetch
          response = await fetch(htmlUrl);
          if (!response.ok) {
            console.warn(
              `[Router] Fetch retornou status ${response.status}, usando fallback`
            );
            useFallback = true;
          }
        } catch (fetchError) {
          console.warn(
            `[Router] Fetch falhou, usando fallback:`,
            fetchError.message
          );
          useFallback = true;

          // Tenta caminho alternativo antes de usar fallback
          if (!useFallback) {
            try {
              const altUrl = htmlUrl.startsWith('/')
                ? htmlUrl.substring(1)
                : htmlUrl;
              console.log(`[Router] Tentando URL alternativa: ${altUrl}`);
              response = await fetch(altUrl);
              if (response && response.ok) {
                useFallback = false;
              }
            } catch (altError) {
              console.warn(`[Router] URL alternativa também falhou`);
            }
          }
        }

        // Se fetch falhou ou não está disponível, usa FileService
        if (useFallback || !response || !response.ok) {
          console.log(`[Router] Carregando via FileService (fallback)...`);

          // Aguarda FileService estar disponível
          if (!window.FileService) {
            console.log('[Router] Aguardando FileService estar disponível...');
            let attempts = 0;
            const maxAttempts = 20; // 1 segundo máximo
            await new Promise((resolve, reject) => {
              const checkInterval = setInterval(() => {
                attempts++;
                if (window.FileService) {
                  clearInterval(checkInterval);
                  console.log('[Router] FileService disponível!');
                  resolve();
                } else if (attempts >= maxAttempts) {
                  clearInterval(checkInterval);
                  reject(new Error('FileService não disponível após timeout'));
                }
              }, 50);
            });
          }

          // Fallback: carrega via FileService (Java)
          try {
            const htmlData = await FileService.loadHtml(htmlPath);
            const html = htmlData.content;
            console.log(
              `[Router] HTML carregado via FileService (${html.length} chars)`
            );
            this.renderHtml(html, htmlPath, path);
            return;
          } catch (fallbackError) {
            console.error(`[Router] Fallback também falhou:`, fallbackError);
            const status = response ? response.status : 'N/A';
            const statusText = response ? response.statusText : 'Erro de rede';
            throw new Error(
              `Erro ao carregar ${htmlPath}: ${statusText} (${status}). Fallback também falhou: ${fallbackError.message}`
            );
          }
        }

        const html = await response.text();
        console.log(`[Router] HTML carregado via fetch (${html.length} chars)`);
        this.renderHtml(html, htmlPath, path);
      } catch (error) {
        console.error(`[Router] Erro ao navegar para ${path}:`, error);
        containerElement.innerHTML = `
          <div style="padding: 20px; color: red;">
            <h2>Erro ao carregar página</h2>
            <p>${error.message}</p>
          </div>
        `;
      }
    },

    /**
     * Renderiza o HTML no container
     * @private
     */
    renderHtml(html, htmlPath, path) {
      // Cria um elemento temporário para parsear o HTML
      const temp = document.createElement('div');
      temp.innerHTML = html;

      // Extrai apenas o conteúdo do body (ou o conteúdo principal)
      const bodyContent = temp.querySelector('body') || temp;
      const scripts = Array.from(bodyContent.querySelectorAll('script'));

      // Remove scripts temporariamente para evitar execução dupla
      scripts.forEach((script) => script.remove());

      // Se o container é o body, substitui o conteúdo do body
      // Caso contrário, substitui apenas o innerHTML do container
      if (containerElement === document.body) {
        // Para body, substitui o innerHTML diretamente
        // Os scripts essenciais (bridge, router) já devem estar carregados
        document.body.innerHTML = bodyContent.innerHTML;
      } else {
        // Para outros containers, substitui normalmente
        containerElement.innerHTML = bodyContent.innerHTML;
      }

      // Re-executa os scripts de forma segura
      scripts.forEach((script, index) => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
          newScript.onload = () =>
            console.log(`[Router] Script externo carregado: ${script.src}`);
          newScript.onerror = () =>
            console.error(
              `[Router] Erro ao carregar script externo: ${script.src}`
            );
          // Adiciona scripts externos ao DOM para que sejam carregados
          if (containerElement === document.body) {
            document.body.appendChild(newScript);
          } else {
            containerElement.appendChild(newScript);
          }
        } else {
          // Para scripts inline, executa diretamente no contexto global
          try {
            const scriptContent = script.textContent;
            if (scriptContent.trim()) {
              console.log(
                `[Router] Executando script inline ${index + 1}/${
                  scripts.length
                }`
              );
              // Usa eval no contexto global para garantir que funções sejam definidas em window
              (function () {
                eval(scriptContent);
              }).call(window);
            }
          } catch (e) {
            console.error(
              `[Router] Erro ao executar script inline ${index + 1}:`,
              e
            );
            console.error(
              '[Router] Conteúdo do script:',
              script.textContent.substring(0, 200)
            );
          }
        }
      });

      // Dispara evento de navegação
      window.dispatchEvent(
        new CustomEvent('route-changed', {
          detail: { path, htmlPath },
        })
      );

      console.log(`[Router] Navegado para: ${path}`);
    },

    /**
     * Obtém a rota atual
     * @returns {string|null}
     */
    getCurrentRoute() {
      return currentRoute;
    },

    /**
     * Obtém todas as rotas registradas
     * @returns {Object}
     */
    getRoutes() {
      return { ...routes };
    },
  };

  console.log('[Router] Sistema de roteamento carregado');
})();
