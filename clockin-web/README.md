# clockin-web

Frontend Angular 18 (standalone) do **Clockin** — sistema de registro de ponto.

## Stack

- Angular 18 (standalone components, signals, lazy routes)
- Angular Material 18
- ngx-translate (English / Português)
- Reactive Forms

## Rodar

Requer **Node 20+** e **npm**.

```bash
npm install
npm start
```

App em `http://localhost:4200`. O proxy (`proxy.conf.json`) repassa `/api` → `http://localhost:8080`.

## Variáveis

Edite `src/environments/environment.ts` se a API estiver em outro host.

## Estrutura

```
src/app/
├── core/
│   ├── auth/      (AuthService, guards, JWT interceptor)
│   └── http/      (error interceptor)
├── layout/shell/  (toolbar + sidenav + lang switch)
└── features/
    ├── login/
    ├── home/
    ├── users/      (admin only)
    ├── holidays/   (admin only)
    ├── entries/    (time clock entries)
    └── report/     (grouped report + PDF download)
```

## i18n

Traduções em `src/assets/i18n/{en,pt-BR}.json`. Trocar idioma pelo botão 🌐 no toolbar; preferência persiste em `localStorage`.
