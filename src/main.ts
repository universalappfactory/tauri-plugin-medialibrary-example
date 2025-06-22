import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { invoke } from "@tauri-apps/api/core";

createApp(App).mount("#app");
invoke("");
