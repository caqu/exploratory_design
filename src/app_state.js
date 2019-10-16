import { writable, readable } from "svelte/store";

export const my_design = writable("./images/shoe0.png");

export const buyButton_visible = writable(false);

export function getUID() {
  return uid++;
}
let uid = 1;
