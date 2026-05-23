import type { Configuration } from "electron-builder";

const config: Configuration = {
  appId: "com.todayschooltimetable.desktop",
  productName: "오늘시간표",
  copyright: "Copyright © 2026 오늘시간표",
  directories: {
    output: "release",
  },
  publish: {
    provider: "github",
    owner: "sys208",
    repo: "onetimetable-desktop",
  },
  files: [
    "dist/**/*",
    "resources/**/*",
    "node_modules/better-sqlite3/**/*",
    "node_modules/bindings/**/*",
    "node_modules/file-uri-to-path/**/*",
    "node_modules/comcigan-parser/**/*",
    "node_modules/iconv-lite/**/*",
    "node_modules/cheerio/**/*",
    "node_modules/htmlparser2/**/*",
    "node_modules/dom-serializer/**/*",
    "node_modules/domhandler/**/*",
    "node_modules/domutils/**/*",
    "node_modules/entities/**/*",
    "node_modules/css-select/**/*",
    "node_modules/css-what/**/*",
    "node_modules/boolbase/**/*",
    "node_modules/nth-check/**/*",
    "node_modules/parse5/**/*",
    "node_modules/parse5-htmlparser2-tree-adapter/**/*",
    "node_modules/safer-buffer/**/*",
  ],
  asar: true,
  asarUnpack: [
    "node_modules/better-sqlite3/**/*",
  ],
  mac: {
    target: ["dmg"],
    category: "public.app-category.education",
  },
  dmg: {
    title: "오늘시간표",
  },
  win: {
    target: [{ target: "nsis", arch: ["x64"] }],
  },
  nsis: {
    oneClick: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "오늘시간표",
    uninstallDisplayName: "오늘시간표",
    deleteAppDataOnUninstall: false,
    runAfterFinish: true,
  },
  linux: {
    target: ["AppImage"],
  },
};

export default config;
