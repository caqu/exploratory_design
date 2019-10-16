import { writable, readable, derived } from "svelte/store";

export const my_design = writable("./images/shoe0.png");

export const buyButton_visible = writable(false);

export function getUID() {
  return uid++;
}
let uid = 1;

let deselected_target = -1;
export const getTarget = () => deselected_target;
export const setTarget = index => {
  deselected_target = index;
};
//
export const recommendation_list = writable([]);
// TODO rename positions_for_recommendations to recommendation_positions
export const positions_for_recommendations = writable({});

export const placed_recommendations = derived(
  [positions_for_recommendations, recommendation_list],
  ([$positions_for_recommendations, $recommendation_list], set) => {
    let _placed_recommendations = [];
    $recommendation_list.length &&
      Object.keys($positions_for_recommendations).forEach((key, index) => {
        const coords = $positions_for_recommendations[`area${index}`]; // iffy
        if (!coords) return;
        let { top, left, width, height } = coords || {};
        _placed_recommendations[index] = {
          ...$recommendation_list[index],
          top,
          left,
          width,
          height
        };
      });
    set(_placed_recommendations);
  }
);
