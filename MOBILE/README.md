# BarberPro Mobile (React Native)

Aplicativo mobile em React Native (Expo) para operação do barbeiro.

## Requisitos

- Node.js 18+
- Expo Go atualizado no celular ou emulador Android/iOS
- Dependencias instaladas com `npm install`
- API backend disponivel em `EXPO_PUBLIC_API_URL` ou fallback para producao (`https://barberpro-api-v4kj.onrender.com/v1`)

## Configuração

1. Instale as dependencias:

```bash
npm install
```

2. Se for usar backend local, defina a API da sua rede local:

```bash
# PowerShell
$env:EXPO_PUBLIC_API_URL="http://SEU_IP_LOCAL:3000/v1"
```

Exemplo Android Emulator: `http://10.0.2.2:3000/v1`

3. Rodar app:

```bash
npm run start
```

Se o Expo Go mostrar `Failed to download remote update`, tente:

```bash
npm run start:clear
```

ou:

```bash
npm run start:tunnel
```

## Troubleshooting rapido

- Atualize o Expo Go para uma versao compativel com SDK 55
- Use `npm run start:tunnel` se o celular nao estiver acessando a rede local/porta do Metro
- Desative VPN e permita Node.js/Expo no firewall do Windows
- Remova a sessao antiga do app no Expo Go e escaneie o QR novamente
- Se o bundle abrir, mas login/API falhar, revise `EXPO_PUBLIC_API_URL`

## Funcionalidades entregues

- Login mobile com API real (`/auth/login`)
- Dashboard com agenda do dia
- Agenda completa com ação "Marcar atendido"
- Remoção automática de atendimentos expirados/atendidos
- Tela de disponibilidade com atualização via API (`/availability`)
- Fluxo cliente no app mobile:
	- Cadastro local de cliente (nome/telefone/email)
	- Agendamento público real via API (`/appointments/public`)
	- Seleção de barbeiro carregada de `/barbers`

## Estrutura

- `src/lib/api.ts` - cliente Axios
- `src/stores/useAuthStore.ts` - autenticação persistida
- `src/stores/useAgendaStore.ts` - agenda e status de atendimento
- `src/screens/*` - telas mobile
- `src/navigation/AppNavigator.tsx` - navegação por abas (barbeiro autenticado)
- `src/navigation/AuthNavigator.tsx` - navegação pública (cliente/login)
