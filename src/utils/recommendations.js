import { getUID, getTarget, recommendation_list } from "../app_state.js";
import {
  isPreloaded,
  addImageToPreloadQueue
} from "../utils/sequential_image_loader.js";

let currentRecommendationSetId = 0;
/**
 * Get recommendations from API server
 */
async function getRecommendations() {
  currentRecommendationSetId = (currentRecommendationSetId + 1) % 3; // fake it till you make it!!
  const res = await fetch(
    `/api/v0/recommendations_${currentRecommendationSetId}.json`
  );
  const text = await res.text();
  if (res.ok) {
    reduceRecommendations(JSON.parse(text));
  } else {
    throw new Error(text);
  }
}
// This reducer augments the recommendations data with a local UID,
// shifts recommendation to leave a gap for the deselected item (if needed)
// and enqueues images for preloading.
// TODO The reducer shouldn't be responsible for
// handling side-effects like loading images. Move it out when appropriate.
function reduceRecommendations(recommendationsObject) {
  recommendation_list.update(updated_list => {
    const deselected_target = getTarget();
    let _shift = 0;
    recommendationsObject.recommendation_list.forEach(
      (recommendation, index) => {
        // leave a gap for the deselected target
        if (index === deselected_target) {
          _shift = 1;
        }
        const _index = index + _shift;
        const _isPreloaded = isPreloaded(recommendation.src);
        updated_list[_index] = {
          ...recommendation,
          id: getUID(),
          skipEntrance: false,
          imageLoaded: _isPreloaded
        };
        if (!_isPreloaded) {
          // and enqueue images for preloading
          addImageToPreloadQueue({
            url: recommendation.src,
            next: () => {
              recommendation_list.update(old_list => {
                const new_list = [...old_list];
                new_list[index] = {
                  ...new_list[index],
                  imageLoaded: true
                };
                return new_list;
              });
            }
          });
        }
      }
    );
    return updated_list;
  });
}
export { getRecommendations };
