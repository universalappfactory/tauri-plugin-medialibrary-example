# Media Library Browser Example

This is a simple example application using the tauri-plugin-medialibrary plugin.

https://github.com/universalappfactory/tauri-plugin-medialibrary

It uses vue, tailwindcss and daisyui

## Install

```
git clone https://github.com/universalappfactory/tauri-plugin-medialibrary.git
cd tauri-plugin-medialibrary
yarn
cargo tauri dev

# or for android
cargo tauri android dev
```

## Interesting files:

- `src/components/media_library_browser.ts`: Makes all the plugin calls
- `src-tauri/capabilities/*.json`: Desktop and Android configuration
- `src/lib.rs`: Plugin setup.
