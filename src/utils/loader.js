import { writable } from "svelte/store";

const loadedImages = {};

function fetchNextImage() {
  // if we've got 'em all, stop
  if (imageQueue.length === 0) return;
  // grab the first one
  const { url, next } = imageQueue[0];
  imageLoader.src = url;
  imageLoader.onload = () => {
    // Remember that this url loaded successfully
    loadedImages.set(url, true);
    // Take the next step requested by the parent context
    next.apply();
    // Remove the image we just loaded from the queue
    imageQueue.shift();
    // If there are more images in the queue, get the next one
    if (imageQueue.length > 0) {
      fetchNextImage();
    }
  };
  imageLoader.onerror = () => {
    // Remove the image that failed from the queue
    imageQueue.shift();
    // If there are more images in the queue, get the next one
    if (imageQueue.length > 0) {
      fetchNextImage();
    }
  };
}
function createLoader() {
  const { subscribe, set, update } = writable([]);
  return {
    subscribe,
    enqueue: (url, next) => {
      update(arr => [...arr, { url }]);
    },
    dequeue: () => {}
  };
}
export const loader = createLoader();
