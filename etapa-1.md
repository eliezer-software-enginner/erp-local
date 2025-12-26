# Arquitetura Mínima Viável --- JavaFX WebView App

Este documento descreve a **Etapa 1: Arquitetura Mínima Viável (MVP
técnico)** para validar a criação de uma aplicação JavaFX totalmente
baseada em WebView, utilizando HTML, CSS e JavaScript como camada de
interface, com Java atuando como runtime e backend local.

------------------------------------------------------------------------

## Objetivo da Etapa

Responder à seguinte pergunta:

> É possível criar uma aplicação JavaFX 100% WebView, com JavaScript
> controlando a UI e Java executando código nativo, de forma organizada
> e sustentável?

O foco **não é produto final nem framework**, mas sim validar a
viabilidade técnica e arquitetural.

------------------------------------------------------------------------

## Princípio Central

-   **Java controla o sistema**
-   **JavaScript controla a interface**
-   Nenhuma camada invade a responsabilidade da outra

------------------------------------------------------------------------

## Arquitetura em Camadas

    [ HTML / CSS / JS ]
            ↓
    [ Bridge JS ]
            ↓
    [ Bridge Java ]
            ↓
    [ Services Java ]
            ↓
    [ OS / DB / FS ]

------------------------------------------------------------------------

## Descrição das Camadas

### UI --- HTML / CSS / JavaScript

-   Responsável por toda a renderização da interface
-   Trabalha apenas com estado e eventos
-   Não possui conhecimento sobre Java ou JavaFX

### Bridge JS

-   Único ponto do frontend que conhece a existência do Java
-   Traduz eventos de UI em mensagens estruturadas
-   Recebe respostas do Java e atualiza o estado da aplicação

### Bridge Java

-   Classe única exposta ao JavaScript
-   Recebe mensagens vindas do JS
-   Encaminha comandos para os serviços adequados

### Services Java

-   Contém a lógica real da aplicação
-   Acesso a filesystem, banco de dados, threads e regras de negócio
-   Não conhece WebView, DOM ou JavaScript

------------------------------------------------------------------------

## Regra de Ouro

> Se amanhã a WebView for substituída por outra tecnologia (Electron,
> browser externo, etc.), apenas a Bridge será impactada.

------------------------------------------------------------------------

## Fluxo de Execução

1.  Usuário interage com a interface
2.  JavaScript dispara um evento
3.  Bridge JS envia uma mensagem estruturada
4.  Bridge Java recebe a mensagem
5.  Service Java executa a ação
6.  Java retorna uma resposta
7.  Bridge JS atualiza o estado
8.  UI é re-renderizada

------------------------------------------------------------------------

## Limites de Responsabilidade

### JavaScript

-   Solicitar ações
-   Aguardar respostas
-   Atualizar estado
-   Renderizar interface

### Java

-   Validar comandos
-   Executar operações nativas
-   Gerenciar erros
-   Responder de forma estruturada

JavaScript **nunca assume sucesso**.\
Java **nunca confia cegamente no JavaScript**.

------------------------------------------------------------------------

## Escopo do MVP

-   Interface simples em HTML/CSS/JS puro
-   WebView como único componente visual
-   Comunicação baseada em mensagens
-   Serviços Java isolados
-   Sem frameworks JS
-   Sem foco em performance ou design

------------------------------------------------------------------------

## Resultado Esperado

Ao final desta etapa, deve ser possível afirmar com segurança se:

-   A comunicação JS ↔ Java é estável
-   A separação de responsabilidades se mantém clara
-   A base é sustentável para evoluir para um framework ou produto real

------------------------------------------------------------------------

Documento criado para fins de **histórico arquitetural**.
