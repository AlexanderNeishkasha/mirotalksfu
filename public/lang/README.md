# In-room UI translations

Bodrik FM uses human-maintained Russian and English translations. Google Translate
and machine-translation modes are not used.

## Runtime behavior

- [I18n.js](../js/I18n.js) defaults to Russian and loads [ru.json](ru.json).
- Settings → Language switches between Russian and English without reloading.
- The browser preference is stored as `uiLanguageOverride` in localStorage;
  selecting Russian removes the override. Unsupported saved languages are ignored.
- English displays the original source strings. [en.json](en.json) is the English
  translation reference, not a runtime dependency for English mode.
- Missing Russian translations remain English; dictionaries are not shared across
  namespaces.
- `UI_LANGUAGE` and `UI_TRANSLATION_MODE` do not control this fork's language picker.
  Adding another JSON file alone does not enable another language.

## Maintaining strings

Keep English source keys and translated values in the same namespace in both
`en.json` and `ru.json`. Keys must match the UI source, including punctuation and
casing; surrounding whitespace is ignored. Preserve placeholders such as `{name}`
and `{count}`.

| Namespace | UI context |
| --- | --- |
| `tooltips` | Tippy help and hover hints |
| `buttons` | Button text and attributes inside buttons |
| `labels` | Other text, headings, dropdown labels and attributes |
| `dialogs` | SweetAlert dialog text and buttons |
| `toasts` | Notifications |

For example, a dropdown label outside a button belongs in `labels`, even if the
same English text already exists in `buttons`.

Exclude content from DOM translation with `class="notranslate"`, `translate="no"`
or `data-i18n-skip`. Chat messages, participant names and other user content should
not be translated. These dictionaries cover the meeting UI, not the main frontend
or documentation.

## Extraction helper

From the fork root (`mirotalk/source`):

```sh
node app/src/scripts/extract-ui-lang.js
```

This helper rewrites `en.json` from detected source strings and synchronizes the
other dictionaries. It preserves translations for detected keys, adds missing
keys with English values and removes keys it did not detect.

Extraction is heuristic: review the diff before accepting it, especially strings
in dynamic menus, shared helpers and microphone help. Restore any valid keys the
scanner missed; do not treat the generated result as authoritative.

Run the maintained checks after changing translations:

```sh
npm run lint
npm run format:check
npm run test:bodrik
```

Also verify the affected UI in both languages, including dynamic dropdowns and
already-open tooltips.
