# BarberPro Mobile (React Native)

Aplicativo mobile em React Native (Expo) para operação do barbeiro.

## Requisitos

- Node.js 18+
- Expo Go no celular ou emulador Android/iOS
- API backend rodando (padrão: `http://localhost:3001/api`)

## Configuração

1. Defina a API da sua rede local:

```bash
# PowerShell
$env:EXPO_PUBLIC_API_URL="http://SEU_IP_LOCAL:3001/api"
```

Exemplo Android Emulator: `http://10.0.2.2:3001/api`

2. Rodar app:

```bash
npm run start
```

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
