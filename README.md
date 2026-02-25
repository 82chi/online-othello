# online-othello
オンライン対戦オセロゲーム / Online Othello Game

## 概要 / Overview

ブラウザ上で2人がオンライン対戦できるオセロゲームです。ログイン不要、URLシェアで対戦相手を招待できます。

An online Othello game where two players can battle in real-time via browser. No login required – invite opponents by sharing a URL.

## 技術スタック / Tech Stack

- **フロントエンド**: Nuxt 3 + TypeScript + Tailwind CSS
- **リアルタイム通信**: PartyKit（メモリ上でゲーム状態管理）
- **i18n**: @nuxtjs/i18n（日本語・英語対応）
- **デプロイ**: Vercel（フロント） + PartyKit（サーバー）

## 機能 / Features

- 🎮 リアルタイムオンライン対戦 / Real-time online multiplayer
- 🌐 日本語・英語対応 / Japanese & English support
- 📋 URLシェアで招待 / Invite by sharing URL
- 💬 インゲームチャット / In-game chat
- 🔄 再戦機能 / Rematch feature
- 📱 レスポンシブデザイン / Responsive design (mobile, tablet, PC)
- 🛡️ セキュリティ対策 / XSS protection & rate limiting

## ゲームルール / Game Rules

- 黒が先手 / Black goes first
- 置ける場所がない場合は自動パス / Auto-pass when no valid moves
- 両者ともパスになった場合ゲーム終了 / Game ends when both players pass consecutively
- 盤面が埋まった場合ゲーム終了 / Game ends when board is full
- 片方の駒が0になった場合即時終了 / Game ends immediately if one player has 0 pieces
- 駒数が多い方の勝ち / Player with more pieces wins

## 開発手順 / Development Setup

### 前提条件 / Prerequisites

- Node.js 18+
- npm

### インストール / Installation

```bash
npm install
```

### 環境変数 / Environment Variables

```bash
cp .env.example .env
```

`.env` ファイルを編集して PartyKit ホストを設定します。

### 開発サーバー起動 / Start Dev Servers

**ターミナル1 (PartyKit):**
```bash
npm run dev:party
```

**ターミナル2 (Nuxt):**
```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスします。

### ビルド / Build

```bash
npm run build
```

## デプロイ / Deployment

### Vercel (フロントエンド)

1. Vercel にプロジェクトを接続
2. 環境変数 `PARTYKIT_HOST` を設定（例: `online-othello.username.partykit.dev`）
3. デプロイ

### PartyKit (バックエンド)

```bash
npx partykit deploy
```

## ディレクトリ構成 / Directory Structure

```
online-othello/
├── nuxt.config.ts         # Nuxt設定
├── partykit.json          # PartyKit設定
├── vercel.json            # Vercel設定
├── .env.example           # 環境変数サンプル
├── party/
│   └── index.ts           # PartyKitサーバー（ゲーム状態管理）
├── app/
│   ├── app.vue            # ルートコンポーネント
│   ├── pages/
│   │   ├── index.vue      # トップ（ルーム作成）
│   │   └── room/
│   │       └── [id].vue   # ゲーム画面
│   ├── components/
│   │   ├── Board.vue      # 盤面
│   │   ├── Cell.vue       # マス（ハイライト含む）
│   │   ├── Piece.vue      # 駒
│   │   ├── ScoreBoard.vue # スコア・ターン表示
│   │   ├── Chat.vue       # チャット
│   │   └── GameResult.vue # 終了画面
│   ├── composables/
│   │   ├── useOthello.ts  # ゲームロジック
│   │   ├── usePartykit.ts # PartyKit接続
│   │   └── useRoom.ts     # ルーム管理
│   ├── types/
│   │   └── game.ts        # TypeScript型定義
│   └── locales/           # (i18n/localesと同期)
├── i18n/
│   └── locales/
│       ├── ja.json        # 日本語
│       └── en.json        # 英語
└── package.json
```

## プレイ方法 / How to Play

1. トップページで名前と色（黒/白）を選択
2. 「ルームを作成」ボタンをクリック
3. 表示されたURLを対戦相手にシェア
4. 対戦相手がURLにアクセスすると自動的にゲーム開始
5. 自分のターンになると置けるマスが明るい緑でハイライト表示
6. ハイライトされたマスをクリックして駒を置く
7. チャットで対戦相手とコミュニケーション
8. ゲーム終了後に再戦も可能
