# Natural Space

Automatically add proper spacing between CJK (Chinese, Japanese, Korean) and Latin characters, fix punctuation width, and normalize whitespace — following [Chinese Copywriting Guidelines](https://github.com/sparanoid/chinese-copywriting-guidelines).

For example:

```diff
-今天,我和Mike 出去买菜花了 5000元，还买了两本书，一本是《资治通鉴》，另一本是《Vision，the key to the future》.
+今天，我和 Mike 出去买菜花了 5000 元，还买了两本书，一本是《资治通鉴》，另一本是《Vision, the key to the future》。
```

## Usage

1. Select text in any application.
2. Trigger Raycast and run **Format Selected Text**.
3. If the text is in an editable field, the formatted result is pasted back in place. Otherwise it is copied to your clipboard.

If you encounter an unexpected result, use the **Report Issue** command to file a bug report directly from Raycast.

## Preferences

| Preference | Description |
|---|---|
| Use straight quotes for CJK | Format as `「文本」` instead of `"文本"` |
