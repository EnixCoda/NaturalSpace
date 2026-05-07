# Natural Space Changelog

## [Improvements] - 2026-05-07

- Fix spacing around backtick code spans adjacent to CJK characters
- Fix spacing for `@mention` and `#hashtag` tokens adjacent to CJK characters
- Fix spacing for Greek letters and Roman numerals at CJK boundaries
- Fix half-width punctuation conversion near full-width brackets
- Improve URL preservation when formatting mixed-language text
- Significant performance improvement (~34% faster pipeline)

## [Initial Release] - 2023-05-25

- Format selected text by adding proper spacing between CJK and Latin characters
- Convert punctuation to appropriate full/half width based on context
- Paste formatted text back in place when in editable fields, otherwise copy to clipboard
- Preference to use straight quotes (`「」`) instead of curly quotes (`""`) for CJK text
