import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import paragraphComp from "./block-components/paragraph.vue"
import bulleted_list_itemComp from "./block-components/bulleted_list_item.vue"
import heading_2Comp from "./block-components/heading_2.vue"
import heading_3Comp from "./block-components/heading_3.vue"
import equationComp from "./block-components/equation.vue"
import paragraph_equationComp from "./block-components/paragraph_equation.vue"
import heading_1Comp from "./block-components/heading_1.vue"

import VueMobileDetection from "vue-mobile-detection";
import VueLatex from 'vatex'

const app = createApp(App)
app.use(VueMobileDetection);

app.component("paragraph", paragraphComp)
app.component("bulleted_list_item", bulleted_list_itemComp)
app.component("heading_1", heading_1Comp)
app.component("heading_2", heading_2Comp)
app.component("heading_3", heading_3Comp)
app.component("equation", equationComp)
app.component("paragraph_equation", paragraph_equationComp)

app.use(VueLatex)

import { isMobile } from "./modules/is_mobile";
function mobileCheck() {
  isMobile.value = (app.config.globalProperties as any).$isMobile()
  if (isMobile.value) {
    document.body.style.setProperty("--is-mobile", "1")
    document.body.style.setProperty("--scr-width", (window.innerWidth * 2) + "px")
    document.body.style.setProperty("--scr-height", (window.innerHeight * 2) + "px")
    document.body.style.setProperty("zoom", "0.5")
    document.body.style.setProperty("display", "standalone")
    // window.scrollTo(0, 1);
  } else {
    document.body.style.setProperty("--is-mobile", "0")
    document.body.style.setProperty("--scr-width", "100vw")
    document.body.style.setProperty("--scr-height", "100vh")
    document.body.style.setProperty("zoom", "1.0")
    document.body.style.removeProperty("display")
  }

  // print("css: ", document.body.style)
}
mobileCheck()
window.addEventListener("DOMContentLoaded", e => {
  mobileCheck()
})
window.addEventListener("resize", e => {
  mobileCheck()
})

app.mount('#app')
