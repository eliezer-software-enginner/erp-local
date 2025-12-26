/**
 * Camada de Serviços JavaScript
 *
 * Esta camada abstrai o protocolo de mensagens JWB, expondo APIs
 * mais naturais e fáceis de usar para o desenvolvedor JavaScript.
 *
 * Princípio: O desenvolvedor JavaScript não precisa conhecer o protocolo
 * de mensagens, apenas usa métodos simples como FileService.readFile()
 */

(function () {
  'use strict';

  /**
   * Serviço de Arquivos
   * Espelha o FileService Java
   */
  window.FileService = {
    /**
     * Carrega o conteúdo de um arquivo HTML dos recursos
     * @param {string} htmlPath - Caminho do HTML relativo a /web/public/
     * @returns {Promise<{content: string, path: string}>}
     */
    async loadHtml(htmlPath) {
      const response = await window.JWB.send('LOAD_HTML', htmlPath);
      if (response.status === 'ERROR') {
        throw new Error(response.payload.message || 'Erro ao carregar HTML');
      }
      return response.payload;
    },
    /**
     * Lê um arquivo do sistema
     * @param {string} path - Caminho do arquivo
     * @returns {Promise<{content: string, size: number, path: string}>}
     */
    async readFile(path) {
      const response = await window.JWB.send('READ_FILE', { path });
      if (response.status === 'ERROR') {
        throw new Error(response.payload.message || 'Erro ao ler arquivo');
      }
      return response.payload;
    },

    /**
     * Escreve conteúdo em um arquivo
     * @param {string} path - Caminho do arquivo
     * @param {string} content - Conteúdo a ser escrito
     * @returns {Promise<{success: boolean, path: string}>}
     */
    async writeFile(path, content) {
      const response = await window.JWB.send('WRITE_FILE', { path, content });
      if (response.status === 'ERROR') {
        throw new Error(response.payload.message || 'Erro ao escrever arquivo');
      }
      return response.payload;
    },

    /**
     * Lista arquivos de um diretório
     * @param {string} path - Caminho do diretório
     * @returns {Promise<Array<{name: string, type: string, size: number}>>}
     */
    async listDirectory(path) {
      const response = await window.JWB.send('LIST_DIRECTORY', { path });
      if (response.status === 'ERROR') {
        throw new Error(response.payload.message || 'Erro ao listar diretório');
      }
      return response.payload;
    },
  };

  /**
   * Serviço de Janelas
   * Espelha o WindowService Java
   */
  window.WindowService = {
    /**
     * Cria uma nova janela com o HTML especificado
     * @param {string} htmlPath - Caminho do HTML relativo a /web/public/
     * @param {Object} options - Opções da janela {title, width, height}
     * @returns {Promise<{success: boolean, htmlPath: string, title: string, width: number, height: number}>}
     */
    async spawnWindow(htmlPath, options = {}) {
      const payload = {
        htmlPath,
        title: options.title || 'Nova Janela',
        width: options.width || 800,
        height: options.height || 600,
      };

      const response = await window.JWB.send('SPAWN_WINDOW', payload);
      if (response.status === 'ERROR') {
        throw new Error(
          response.payload.message || 'Erro ao criar nova janela'
        );
      }
      return response.payload;
    },
  };

  /**
   * Serviço de Aplicação
   * Espelha o AppService Java
   */
  window.AppService = {
    /**
     * Obtém informações de inicialização da aplicação
     * @returns {Promise<{appName: string, version: string}>}
     */
    async getInitData() {
      alert('[App] Vai obter os dados iniciais');
      const response = await window.JWB.send('INIT_APP');

      alert('[App] obtede os dados iniciais: ' + JSON.stringify(response));
      if (response.status === 'ERROR') {
        throw new Error(
          response.payload.message || 'Erro ao obter dados de inicialização'
        );
      }
      return response.payload;
    },

    /**
     * Obtém informações da aplicação
     * @returns {Promise<Object>}
     */
    async getAppInfo() {
      const response = await window.JWB.send('GET_APP_INFO');
      if (response.status === 'ERROR') {
        throw new Error(
          response.payload.message || 'Erro ao obter informações da aplicação'
        );
      }
      return response.payload;
    },
  };

  alert('[Services] Camada de serviços JavaScript carregada');
})();
