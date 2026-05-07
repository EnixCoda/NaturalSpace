# Natural Space

Write freely — Natural Space takes care of the formatting.

A Raycast extension for anyone who writes in both CJK (Chinese, Japanese, Korean) and Latin scripts. It automatically adds proper spacing at script boundaries, corrects punctuation width, and normalizes whitespace, following the [Chinese Copywriting Guidelines](https://github.com/sparanoid/chinese-copywriting-guidelines).

## What it fixes

```diff
# Spacing between CJK and Latin / numbers
-我和Mike出去买菜花了5000元
+我和 Mike 出去买菜花了 5000 元

# Punctuation width
-今天,天气很好.我们去公园了
+今天，天气很好。我们去公园了

# Mixed sentence
-今天,我和Mike 出去买菜花了 5000元，还买了两本书，一本是《资治通鉴》，另一本是《Vision，the key to the future》.
+今天，我和 Mike 出去买菜花了 5000 元，还买了两本书，一本是《资治通鉴》，另一本是《Vision, the key to the future》。

# @mentions and #hashtags
-請@vinta吃飯，討論#開源項目
+請 @vinta 吃飯，討論 #開源項目

# Code spans and abbreviations
-运行`npm install`安装依赖，参考U.S.A.官方文档
+运行 `npm install` 安装依赖，参考 U.S.A. 官方文档
```

## Usage

1. Select text in any application.
2. Open Raycast and run **Format Selected Text**.
3. The formatted text is pasted back in place. If the app doesn't support paste, it's copied to your clipboard instead.

**Tip:** Assign a hotkey to the command in Raycast Preferences → Extensions for one-keystroke formatting.

## Commands

| Command | Description |
|---|---|
| Format Selected Text | Format the currently selected text |
| Report Issue | Open a GitHub issue to report an unexpected result |

## Preferences

| Preference | Description |
|---|---|
| Use straight quotes for CJK | Format as `「文本」` instead of `"文本"` |
