import type { Configuration } from "electron-builder";

const config: Configuration = {
  appId: "com.todayschooltimetable.desktop",
  productName: "오늘시간표",
  directories: {
    output: "release",
  },
  files: ["dist/**/*", "resources/**/*"],
  mac: {
    target: ["dmg"],
    category: "public.app-category.education",
  },
  win: {
    target: ["nsis"],
  },
};

export default config;
