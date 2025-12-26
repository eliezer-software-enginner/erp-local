# Etapa 3 --- Experimento Técnico Controlado

Este documento define o experimento prático para validar a arquitetura
proposta.

------------------------------------------------------------------------

## Objetivo

Comprovar que: - A comunicação JS ↔ Java é estável - A separação de
responsabilidades se mantém - O projeto não degenera em acoplamento

------------------------------------------------------------------------

## Escopo do Experimento

-   Uma janela JavaFX
-   Uma WebView
-   UI simples em HTML/CSS/JS puro
-   Bridge JS
-   Bridge Java
-   Serviços Java mínimos

------------------------------------------------------------------------

## Funcionalidades do Experimento

1.  INIT_APP
2.  Ler um arquivo do sistema
3.  Escrever um arquivo
4.  Exibir resultado na UI

------------------------------------------------------------------------

## Critérios de Sucesso

-   Nenhum acesso direto JS → Java nativo
-   Comunicação 100% por mensagens
-   Código compreensível após 1 semana
-   Logs claros

------------------------------------------------------------------------

## O que NÃO incluir

-   Framework JS
-   Design avançado
-   Performance tuning
-   Plugins

------------------------------------------------------------------------

## Resultado Esperado

Ao final, deve ser possível afirmar com segurança se:

> Esta arquitetura pode evoluir para um produto ou framework real.

------------------------------------------------------------------------

Documento criado para **planejamento técnico**.
