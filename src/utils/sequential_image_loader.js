const loadedImages = new Map();
const imageQueue = new Array();
const imageLoader = new Image();
// This loads one image at a time.
// TODO update to batch 2, 3, or 4 at a time.
// TODO this could be improved with a cache for offline use if the network drops temporarily
// Here just a quick queue for the prototype.
export function isPreloaded(url) {
  return loadedImages.has(url);
}
function addImageToPreloadQueue({ url, next }) {
  if (loadedImages.has(url)) {
    next();
  } else {
    imageQueue.push({ url, next });
    if (imageQueue.length === 1) {
      // (re)start the sequence
      fetchNextImage();
    }
  }
}
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
    next();
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
export { addImageToPreloadQueue };
