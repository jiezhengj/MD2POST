> Language / 言語: [English](./README.en.md) | [中文](./README.zh.md) | **日本語**

# MD2POST

**ライトグレード Markdown 長編画像レンダリングエンジン · Agent Skill**

> 本プロジェクトは初期検証段階にあり、十分なテストはまだ行われていません。コミュニティによる継続的なテスト・改善・自由な改変を歓迎します。

---

## プロジェクト背景

AI 支援コンテンツ制作が普及する中、大規模言語モデルは高品質なコンテンツを生成できますが、「テキスト」から「ソーシャルメディア向け高解像度長編画像」への変換には、複雑な組版・フォーマット工程が存在します。

MD2POST はこの課題から生まれました。AI Agent が直接呼び出せる**確定的・高精度・無人介入**のレンダリングエンジンを構築し、整理済みの Markdown コンテンツを X/Twitter・微博などのプラットフォーム配信基準に適合した長編画像へと自動変換します。

設計思想は「脳と筋肉の分業」です。大規模モデルがコンテンツの意思決定を担い、MD2POST が確定的な物理組版実行を担います。

---

## 主な特徴

### 二段階容量ヒューズ機構
エンジンには独立した二重防御ラインが内蔵されています：
- **Phase 1（ミリ秒レベル推定）**：AST解析段階で保守的な高さ推定アルゴリズムを用いて全文をスキャン。プラットフォームのピクセル上限を超えると予想される場合、即座に拒否しブラウザ起動のコストを回避します。
- **Phase 2（精密ヒューズ）**：Chromium での実際のレンダリング後、DOM の物理的な高さを二次確認します。

### セマンティック認識スマート分割アルゴリズム
コンテンツが長くなり複数枚の画像に分割する必要がある場合、単純にピクセル高でコンテンツを「強制切断」しません。ヘッドレスブラウザに JS プローブを注入してすべての DOM 要素の正確な座標を取得し、見出し前・段落間隔などの「安全な隙間」でカットします。テキストが途中で切断されることはありません。

### 越境デッドロック解除戦略
超大型要素（巨大な挿入画像・大型テーブルなど）によって予定スペース内での分割が不可能な極端なケースに対しては、三段階の降級戦略（上方退避 → 下方延伸 → 強制ハードカット）を実施し、処理が止まることはありません。

### バックエンド同期 Mermaid レンダリング
Mermaid フローチャートには、AST 解析段階で `beautiful-mermaid` を同期的に呼び出して高忠実度の SVG ベクター画像を生成します。フロントエンドの非同期レンダリングによる競合状態を回避し、長編画像のテーマ配色を自然に継承します。

### 3種類の精調ビジュアルテーマ
完全な CSS Design Token システムにより、3種類のテーマを内蔵。Agent 呼び出し時に1つのパラメータを渡すだけで全配色が切り替わります。

### 厳格な挿入画像セキュリティポリシー
- HTTP リモート画像を禁止（ネットワーク I/O によるパイプライン遅延・停止を防止）
- 「縮小のみ、拡大なし」原則に従った画像処理
- `image-size` によるミリ秒レベルの画像ヘッダー読み取りと精密な高さ推定

---

## サポートする Markdown 記法

| カテゴリ | サポート状況 |
|---------|------------|
| 見出し H1-H6 | 完全サポート（字サイズ・間隔精細調整済み） |
| 順序付き / 順序なしリスト・インデント | 完全サポート |
| 太字・斜体・取り消し線 | 完全サポート |
| インラインコード・コードブロック | 完全サポート（等幅フォント＋ダーク背景） |
| テーブル | 完全サポート（ヘッダー背景色付き） |
| 引用ブロック | 完全サポート（左側装飾バー付き） |
| ローカル画像（相対パス） | 完全サポート |
| `==ハイライト==` | サポート（`markdown-it-mark`） |
| `^上付き^` / `~下付き~` | サポート（`markdown-it-sup` / `markdown-it-sub`） |
| `- [ ] タスクリスト` | サポート（`markdown-it-task-lists`）、丸角チェックボックス |
| Mermaid フローチャート | サポート（`beautiful-mermaid`）、バックエンド同期 SVG |

---

## クイックスタート

### 1. 依存関係のインストール

```bash
cd MD2POST
npm install
npx playwright install chromium
```

### 1.1 Vendor ビルド (beautiful-mermaid fork)

本プロジェクトには [Issue #83](https://github.com/lukilabs/beautiful-mermaid/issues/83) 修正（TD/TB レイアウト反転バグ）を含む `beautiful-mermaid` ローカルフォークが含まれます。クローン後に追加ビルドが必要です：

```bash
cd vendor/beautiful-mermaid
npm install
npm run build
cd ../..
```

### 2. 実行

```bash
npx tsx src/index.ts -i ./example.md -t tech -l ja
```

プロジェクトには全高度機能を網羅した[サンプルファイル](./example.md)が含まれています。完全なパラメータ説明は **[SKILL.ja.md](./SKILL.ja.md)**（Agent 専用インターフェースドキュメント）を参照してください。

### 3. 出力の確認

生成された画像は `./out/` ディレクトリに出力されます。`debug_phase1.html` はブラウザで開いて組版効果をプレビューできます。

---

## ドキュメント索引

| ドキュメント | 対象読者 | 説明 |
|------------|---------|------|
| **[SKILL.ja.md](./SKILL.ja.md)** | AI Agent | 完全呼び出しインターフェース仕様・パラメータ表・エラー処理・統合ガイド |
| **[長編画像組版ベストプラクティス](./docs/best-practices.ja.md)** | 開発者 / Agent | 文字サイズ・配色・分割戦略などの組版規則を定義 |
| **[技術アーキテクチャ方案](./docs/architecture.ja.md)** | 開発者 | レンダリングパイプライン・ヒューズ機構・セマンティック分割アルゴリズムの技術説明 |

---

## テスト状況について

本プロジェクトは現在**プロトタイプ検証段階**にあり、コアレンダリングパイプラインのエンドツーエンドデバッグは完了していますが、以下の面での十分なテストはまだ行われていません：

- 大量の実コンテンツによるエッジケース網羅
- クロスOS（Linux / Windows）互換性検証
- 中日英以外の言語での組版表現
- より多くの Mermaid 図表タイプのレンダリング品質
- 極端な状況でのパフォーマンス（64MB 以上の PNG 出力など）

**テストの継続・Issue の提出・自身のニーズに合わせた改変を歓迎します。** このエンジンの設計思想は完全にオープンであり、すべてのコアアルゴリズムに詳細なコメントが付いています。

---

## 謝辞

本プロジェクトの実現は、以下の優れたオープンソースプロジェクトに依存しています：

| ライブラリ | 用途 | リンク |
|-----------|------|--------|
| **Playwright** | ヘッドレス Chromium 自動化、高精度スクリーンショット駆動 | [microsoft/playwright](https://github.com/microsoft/playwright) |
| **Sharp** | 高性能 Node.js 画像処理、PNG 分割エクスポート | [lovell/sharp](https://github.com/lovell/sharp) |
| **markdown-it** | 高品質 Markdown パーサー、プロジェクトの AST 基盤 | [markdown-it/markdown-it](https://github.com/markdown-it/markdown-it) |
| **beautiful-mermaid** | ゼロ依存・同期・高度カスタマイズ可能な Mermaid SVG レンダラー | [lukilabs/beautiful-mermaid](https://github.com/lukilabs/beautiful-mermaid) |
| **markdown-it-mark** | `==ハイライト==` 記法拡張 | [markdown-it/markdown-it-mark](https://github.com/markdown-it/markdown-it-mark) |
| **markdown-it-sup** | `^上付き^` 記法拡張 | [markdown-it/markdown-it-sup](https://github.com/markdown-it/markdown-it-sup) |
| **markdown-it-sub** | `~下付き~` 記法拡張 | [markdown-it/markdown-it-sub](https://github.com/markdown-it/markdown-it-sub) |
| **markdown-it-task-lists** | `- [ ]` タスクリスト記法拡張 | [revin/markdown-it-task-lists](https://github.com/revin/markdown-it-task-lists) |
| **image-size** | 画像ヘッダーのミリ秒レベル読み取り（完全デコード不要） | [image-size/image-size](https://github.com/image-size/image-size) |
| **Commander.js** | CLI パラメータ解析 | [tj/commander.js](https://github.com/tj/commander.js) |
| **Zod** | TypeScript ファーストのランタイムパラメータ検証 | [colinhacks/zod](https://github.com/colinhacks/zod) |

---

## ライセンス

MIT
