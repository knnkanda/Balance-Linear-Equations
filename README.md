# Balance｜天秤で解ける一次方程式

スマートフォン向けの数学ゲームです。左右の天秤に同じ操作をして、一次方程式の `x` をひとりにします。

## MVPの内容

- LEVEL 1：数字の分銅を取り除いてから、係数で割る
- LEVEL 2：少し大きな数の一次方程式
- LEVEL 3：左右にあるX箱を片側へ集める
- 数式、天秤、分銅、次の操作が同じゲーム状態からリアルタイムに更新
- スマートフォン幅に対応したタップ中心のUI
- ヒント、リセット、次の問題、正解トースト

## 起動方法

```bash
npm install
npm run dev
```

ブラウザで表示されたローカルURLを開いてください。

## ビルド確認

```bash
npm run build
```

## 技術構成

- React
- TypeScript
- Vite
- lucide-react

## GitHubへ登録する例

GitHubで空のリポジトリを作成したあと、プロジェクトのフォルダで実行します。

```bash
git init
git add .
git commit -m "Create balance equation game MVP"
git branch -M main
git remote add origin https://github.com/ユーザー名/リポジトリ名.git
git push -u origin main
```

`ユーザー名`と`リポジトリ名`は、ご自身のGitHubの値に置き換えてください。
