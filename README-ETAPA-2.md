# Etapa 2 --- Contrato JS ↔ Java

Este documento descreve o **contrato de comunicação** entre a camada
JavaScript (UI) e a camada Java (runtime/backend local) em uma aplicação
JavaFX baseada integralmente em WebView.

------------------------------------------------------------------------

## Objetivo

Definir uma forma **estável, previsível e versionável** de comunicação
entre JavaScript e Java, evitando acoplamento direto e permitindo
evolução futura.

------------------------------------------------------------------------

## Princípio Fundamental

-   JavaScript **não chama métodos Java**
-   Java **não expõe lógica diretamente**
-   Toda comunicação ocorre via **mensagens estruturadas**

------------------------------------------------------------------------

## Modelo de Comunicação

A comunicação segue um modelo de **Request / Response assíncrono**,
semelhante a IPC.

### Request (JS → Java)

    {
      protocol: "1.0",
      id: "uuid",
      type: "ACTION_NAME",
      payload: {}
    }

### Response (Java → JS)

    {
      id: "uuid",
      status: "SUCCESS" | "ERROR",
      payload: {}
    }

------------------------------------------------------------------------

## Campos do Request

-   **protocol**: versão do contrato
-   **id**: identificador único da chamada
-   **type**: intenção da ação
-   **payload**: dados serializáveis necessários

------------------------------------------------------------------------

## Campos do Response

-   **id**: corresponde ao request
-   **status**: sucesso ou erro
-   **payload**: dados ou erro estruturado

------------------------------------------------------------------------

## Tipos de Ações Iniciais

-   INIT_APP
-   GET_APP_INFO
-   READ_FILE
-   WRITE_FILE
-   LIST_DIRECTORY

Cada ação: - Executa uma única responsabilidade - Possui payload claro -
Retorna resposta estruturada

------------------------------------------------------------------------

## Assincronicidade

-   Toda chamada é assíncrona
-   JavaScript nunca bloqueia a UI
-   Java nunca executa operações pesadas na thread gráfica

------------------------------------------------------------------------

## Segurança

-   Java valida toda entrada
-   JavaScript nunca assume sucesso
-   Nenhum objeto Java cru é exposto

------------------------------------------------------------------------

## Regra de Ouro

> Se o contrato puder ser entendido sem ver código Java ou JavaScript,
> ele está correto.

------------------------------------------------------------------------

Documento criado para **histórico arquitetural**.
