/**
 * Bridge JWB - Protocolo de Mensagens
 *
 * Esta é a camada de baixo nível que gerencia o protocolo de comunicação
 * entre JavaScript e Java. Ela não deve ser usada diretamente pelo código
 * da aplicação - use os serviços em services.js ao invés disso.
 *
 * Responsabilidades:
 * - Gerenciar o protocolo de mensagens JWB/1.0
 * - Manter o estado das requisições pendentes
 * - Enviar mensagens para o Java
 * - Receber e rotear respostas do Java
 */

(function () {
  'use strict';

  // Usa um objeto global para persistir entre recarregamentos de script do Router
  // GARANTIA: O mapa de pendências deve viver no objeto mais alto possível (window)
  // e nunca ser resetado se o script for reexecutado
  if (!window.__JWB_PENDING_MESSAGES) {
    window.__JWB_PENDING_MESSAGES = {};
  }
  const pending = window.__JWB_PENDING_MESSAGES;

  /**
   * Bridge JWB - Interface de baixo nível
   * @namespace JWB
   */
  window.JWB = {
    /**
     * Envia uma mensagem para o Java
     * @param {string} type - Tipo da ação (ex: 'READ_FILE', 'INIT_APP')
     * @param {Object} payload - Dados da requisição
     * @returns {Promise<{id: string, status: string, payload: Object}>}
     */
    send(type, payload = {}) {
      const id = crypto.randomUUID();
      const msg = {
        protocol: 'JWB/1.0',
        id,
        type,
        payload,
      };

      return new Promise((resolve, reject) => {
        // Verifica se a bridge está disponível
        if (!window.__JWB_BRIDGE__) {
          reject(new Error('Bridge Java não está disponível'));
          return;
        }

        // Verifica se o método postMessage existe
        if (typeof window.__JWB_BRIDGE__.postMessage !== 'function') {
          reject(new Error('Bridge Java não é funcional'));
          return;
        }

        pending[id] = { resolve, reject };

        try {
          window.__JWB_BRIDGE__.postMessage(JSON.stringify(msg));
        } catch (e) {
          delete pending[id];
          reject(new Error('Erro ao enviar mensagem: ' + e.message));
        }
      });
    },
  };

  /**
   * Handler de respostas do Java
   * Chamado automaticamente pelo Java quando uma resposta está pronta
   */
  window.__JWB_HANDLE_RESPONSE = function (response) {
    // Log para diagnóstico imediato
    console.log('[JWB] Dados brutos recebidos:', response);

    let data = response;
    if (typeof response === 'string') {
      try {
        data = JSON.parse(response);
      } catch (e) {
        console.error('[JWB] Falha crítica no parse do JSON:', e);
        return;
      }
    }

    const request = pending[data.id];
    if (request) {
      alert('[JWB] Resolvendo requisição ID:', data.id);
      if (data.status === 'ERROR') {
        request.reject(new Error(data.payload?.message || 'Erro desconhecido'));
      } else {
        request.resolve(data);
      }
      delete pending[data.id];
    } else {
      console.error('[JWB] ID de resposta órfão (sem pendência):', data.id);
    }
  };

  /**
   * Handler de eventos do Java
   * Chamado automaticamente pelo Java para eventos assíncronos
   */
  window.__JWB_HANDLE_EVENT = function (event) {
    console.log('[JWB EVENT]', event);
    // Aqui você pode adicionar um sistema de eventos se necessário
    // Por exemplo: window.dispatchEvent(new CustomEvent('jwb-event', { detail: event }));
  };

  alert('[JWB Bridge] Protocolo de mensagens carregado');
})();
