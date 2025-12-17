<h1 align="center">
  <a href="https://mimic.fi">
    <img src="https://www.mimic.fi/logo.png" alt="Mimic Protocol" width="200">
  </a>
</h1>

<h4 align="center">Developer platform for blockchain apps</h4>

<p align="center">
  <a href="https://discord.mimic.fi">
    <img src="https://img.shields.io/badge/discord-join-blue" alt="Discord">
  </a>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#scope-and-chain-support">Scope</a> •
  <a href="#setup">Setup</a> •
  <a href="#license">License</a>
</p>

---

## Overview

This repository demonstrates how to build a swap application on Ethereum using Mimic as the execution and automation layer.

The application allows users to specify basic swap parameters like chains, input/output tokens, amounts and slippage.

The application does not implement transaction construction, execution routing, retries, gas management, RPC interactions, oracle integrations, or cross-chain messaging.

Mimic handles execution by abstracting:
- Transaction execution and routing
- Solver selection and competition
- Execution retries and failure handling
- Gas payment and native token management

As a result, the application focuses exclusively on expressing user intent and delegates all execution complexity to Mimic.

## Scope

This example uses Ethereum as the reference execution environment.

While Ethereum is used for clarity and familiarity, Mimic supports execution across multiple chains. The same application model can be applied to other supported networks without changes to execution orchestration.

## Setup

To set up this project you'll need [git](https://git-scm.com) and [yarn](https://classic.yarnpkg.com) installed.

From your command line:

```bash
# Clone the repository
git clone https://github.com/mimic-fi/ethereum-swap-app-with-mimic

# Enter the repository
cd ethereum-swap-app-with-mimic

# Install dependencies
yarn
```

## License

MIT

---

> Website [mimic.fi](https://mimic.fi) &nbsp;&middot;&nbsp;
> Docs [docs.mimic.fi](https://docs.mimic.fi) &nbsp;&middot;&nbsp;
> GitHub [@mimic-fi](https://github.com/mimic-fi) &nbsp;&middot;&nbsp;
> Twitter [@mimicfi](https://twitter.com/mimicfi) &nbsp;&middot;&nbsp;
> Discord [mimic](https://discord.mimic.fi)
