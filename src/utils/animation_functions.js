import { quintOut } from "svelte/easing";

export const recommendationEntrance = function recommendationEntrance(
  node,
  { delay, duration, index, deselectedTarget }
) {
  if (node.dataset.skipentrance === "true") return {};
  const animateSoonerAfterDeselectedTarget = index > deselectedTarget ? 1 : 0;
  const delayBetweenRecommendations = 50;
  const randomIndex = Math.floor(Math.random() * transition_styles.length);
  return {
    delay:
      delay +
      (index - animateSoonerAfterDeselectedTarget) *
        delayBetweenRecommendations,
    duration,
    css: t => {
      const eased = quintOut(t);
      return transition_styles[randomIndex](eased);
    }
  };
};
const transition_styles = [
  eased => `opacity: ${eased};transform: scale(${eased})`
  // Spin clockwise, 70's Batman style!
  // (eased => `opacity: ${eased};transform: scale(${eased}) rotate(${eased * 720}deg)`),
  // Spin counter-clockwise, 70's Batman style!
  // (eased => `opacity: ${eased};transform: scale(${eased}) rotate(${eased * -720}deg)`)
];
