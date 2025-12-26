# Ciclo de Vida da Aplicação --- JavaFX WebView

Este documento descreve o fluxo completo de inicialização, execução e
encerramento da aplicação.

------------------------------------------------------------------------

## 1. Inicialização

1.  JavaFX inicia o Stage
2.  WebView é criada
3.  HTML principal é carregado
4.  Bridge Java é injetada no contexto JS
5.  JavaScript envia INIT_APP

------------------------------------------------------------------------

## 2. Boot da Aplicação

1.  Java processa INIT_APP
2.  Java retorna informações básicas (paths, config, etc.)
3.  JS inicializa estado global
4.  UI inicial é renderizada

------------------------------------------------------------------------

## 3. Execução Normal

-   Usuário interage com a UI
-   JS envia comandos
-   Java executa serviços
-   Java responde
-   JS atualiza estado
-   UI reage

------------------------------------------------------------------------

## 4. Execução em Background

-   Operações longas são executadas fora da UI thread
-   Resultados são enviados ao JS via resposta ou evento

------------------------------------------------------------------------

## 5. Encerramento

1.  JS envia comando de shutdown (opcional)
2.  Java encerra recursos
3.  Stage é fechado

------------------------------------------------------------------------

## Princípio

> O Java controla o ciclo de vida da aplicação.\
> O JavaScript controla o ciclo de vida da interface.

------------------------------------------------------------------------

Documento criado para **referência arquitetural**.
