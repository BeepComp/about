import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import paragraphComp from "./block-components/paragraph.vue"
import bulleted_list_itemComp from "./block-components/bulleted_list_item.vue"
import heading_2Comp from "./block-components/heading_2.vue"
import heading_3Comp from "./block-components/heading_3.vue"
import equationComp from "./block-components/equation.vue"
import heading_1Comp from "./block-components/heading_1.vue"

const app = createApp(App)

app.component("paragraph", paragraphComp)
app.component("bulleted_list_item", bulleted_list_itemComp)
app.component("heading_2", heading_2Comp)
app.component("heading_3", heading_3Comp)
app.component("equation", equationComp)
app.component("heading_1", heading_1Comp)

app.mount('#app')
