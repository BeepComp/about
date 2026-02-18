import { type DirectiveBinding } from 'vue';
import twemoji from 'twemoji';

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    el.innerHTML = twemoji.parse(el.innerHTML, {
      folder: 'svg',
      ext: '.svg',
      ...binding.value,
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
    });
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    el.innerHTML = twemoji.parse(el.innerHTML, {
      folder: 'svg',
      ext: '.svg',
      ...binding.value,
      base: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/'
    });
  },
};