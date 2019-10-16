<script>
  /*
    This is a prototype for a decision support system. 
    And so it is optimized and organized for ease of editing and 
    rapidly trying out concepts as they would be seen by customers. 
    
    An ideal production-ready app will use Redux to manage state using the 
    principles described in this book https://read.reduxbook.com
    
    As an example, the Layout component uses CSS and the DOM to calculate the 
    positions of recommendations. 
    This is unnecessary overhead for a production-ready application, but quite
    useful for experimenting with new layouts using declarative CSS.
  */
  import { onMount, beforeUpdate, tick } from "svelte";
  import { quintOut } from "svelte/easing";
  import { crossfade } from "svelte/transition";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";

  import { enqueueImage } from "./utils/sequential_image_loader.js";
  import { blank_gif } from "./utils/blank_gif.js";
  import Layout from "./layout/grid_16.svelte";
  import Error from "./Error.svelte";
  import BuyButton from "./BuyButton.svelte";

  const lazyLoadedImages = new Map();
  function lazy(node, data) {
    if (lazyLoadedImages.has(data.src)) {
      node.setAttribute("src", data.src);
    } else {
      const img = new Image();
      img.src = data.src;
      img.onload = () => {
        lazyLoadedImages.set(data.src, true);
        node.setAttribute("src", data.src);
      };
    }
    return {
      destroy() {} // no-op
    };
  }
  function spin(node, { delay, duration, index }) {
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
  }
  const transition_styles = [
    eased => `opacity: ${eased};transform: scale(${eased})`
    // Spin clockwise, 70's Batman style!
    // (eased => `opacity: ${eased};transform: scale(${eased}) rotate(${eased * 720}deg)`),
    // Spin counter-clockwise, 70's Batman style!
    // (eased => `opacity: ${eased};transform: scale(${eased}) rotate(${eased * -720}deg)`)
  ];
  let deselectedTarget;
  // Animations for Recommendation-to-Selection action
  const [send, receive] = crossfade({
    duration: d => Math.sqrt(d * 400)
  });
  let isLayoutVisible = true;
  const SELECTED = "mine";
  let currentRecommendationSetId = 0;
  let uid = 1;
  let dimensions = {}; // = { mine: { width: 122, height: 122, top: 50, left: 50 } };
  $: dimension_mine = dimensions[SELECTED] ? dimensions[SELECTED] : 0;
  let recommendation_listPromise;
  /**
   * Set Dimensions draws a CSS grid, captures the bounding rectangles.
   */
  async function setDimensions(dimensionsObject) {
    await tick();
    dimensions = { ...dimensionsObject };
    dimensions[SELECTED] = dimensionsObject[SELECTED];
    isLayoutVisible = false;
    // This waits to fetch recommendations until the dimensions were calculated.
    // It's good enough for a prototype.
    // This should be parallelized in a production-ready application. Like:
    // Promise.all([getDimensions, getRecommendations]).then(...)
    recommendation_listPromise = getRecommendations({
      recommendationSetId: currentRecommendationSetId
    });
  }
  let selected = [];
  const initialImageURL = "./images/shoe0.png";
  let recommendation_list = [];
  /**
   * Get recommendations from API server
   */
  async function getRecommendations({ recommendationSetId, skipIndex }) {
    const res = await fetch(
      `/api/v0/recommendations_${recommendationSetId}.json`
    );
    const text = await res.text();
    if (res.ok) {
      const parsedData = JSON.parse(text);
      // Augment recommendations object with a local UID and a screen position
      parsedData.recommendation_list.forEach((recommendation, index) => {
        if (index === skipIndex) {
          // Skip. The previous selection is going to land here.
          deselectedTarget = skipIndex;
        } else {
          let dimensions_of_area_for_recommendation = dimensions[`area${index}`];
          recommendation_list[index] = {
            ...parsedData.recommendation_list[index],
            id: uid++,
            skipEntrance: false,
            imageLoaded: false,
            top: dimensions_of_area_for_recommendation.top,
            left: dimensions_of_area_for_recommendation.left,
            width: dimensions_of_area_for_recommendation.width,
            height: dimensions_of_area_for_recommendation.height
          };
          enqueueImage({
            url: parsedData.recommendation_list[index].src,
            next: () => {
              recommendation_list[index] = {
                ...recommendation_list[index],
                imageLoaded: true
              };
            }
          });
        }
      });
      return parsedData;
    } else {
      throw new Error(text);
    }
  }
  onMount(() => {
    // TODO addEventListenerResize, reset dom, tick.
    selected = [{ id: uid++, src: blank_gif, imageLoaded: false }];
    enqueueImage({
      url: initialImageURL,
      next: () => {
        selected = [
          {
            ...selected[0],
            src: initialImageURL,
            imageLoaded: true
          }
        ];
      }
    });
  });
  beforeUpdate(() => {
    //
  });
  //
  let buyButton_visible = false;
  function selectRecommendation(recommendation, index) {
    buyButton_visible = true;
    // Hold onto a reference of what's currently selected
    let current = selected[0];
    // Put the chosen Recommendation into the Selected spot
    selected = [recommendation];
    // To give Customers an "undo" path, move the old selection into the chosen Recommendation's old spot
    recommendation_list[index] = {
      ...current,
      skipEntrance: true,
      top: recommendation.top,
      left: recommendation.left,
      width: recommendation.width,
      height: recommendation.height
    };
    // Fetch new recommendations
    currentRecommendationSetId = (currentRecommendationSetId + 1) % 3; // fake it till you make it!!
    getRecommendations({
      recommendationSetId: currentRecommendationSetId,
      skipIndex: index
    });
  }
</script>

<style>
  .immovable_container {
    position: relative;
  }
  /* .immovable_container.selected { */
  /* background: radial-gradient( 
      closest-side,
      rgb(255, 255, 255, 0.5),
      rgb(255, 255, 255, 0)
    ); */
  /* } */
  .immovable_container.recommendations {
    /* background: #d39; */
    background: #f1f2ed;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .movable {
    position: absolute;
    display: flex;
  }
  .movable > img {
    margin: auto;
  }
</style>

{#if isLayoutVisible}
  <Layout {setDimensions} />
{/if}
{#await recommendation_listPromise}
  <!-- <div>One moment please...</div> -->
{:then}
  <div class="immovable_container recommendations">
    {#each recommendation_list as recommendation, index (recommendation.id)}
      <div
        class="movable"
        data-id={recommendation.id}
        style="top:{recommendation.top}px;left:{recommendation.left}px;width:{recommendation.width}px;height:{recommendation.height}px"
        on:click={() => selectRecommendation(recommendation, index)}
        in:receive={{ key: recommendation.id }}
        out:send={{ key: recommendation.id }}>
        {#if recommendation.imageLoaded}
          <img
            src={recommendation.src}
            data-id={recommendation.id}
            alt="alt"
            in:spin={{ delay: 500, duration: 600, index }}
            out:fade={{ duration: 200 }}
            data-skipentrance={recommendation.skipEntrance}
            style="max-width:{recommendation.width}px;max-height:{recommendation.height}px" />
        {/if}
      </div>
    {/each}
  </div>
  {#if buyButton_visible}
    <BuyButton
      dimensionMine={dimension_mine}
      on:click={() => alert('This is just a prototype. Sorry.')} />
  {/if}
{:catch error}
  <Error {error} />
{/await}

<!-- My Selection -->
<div
  class="immovable_container selected"
  style="top:{dimension_mine.top}px;left:{dimension_mine.left}px;width:{dimension_mine.width}px;height:{dimension_mine.height}px">
  {#each selected as recommendation, index (recommendation.id)}
    <div
      class="movable"
      data-id={recommendation.id}
      style="width:{dimension_mine['width']}px;height:{dimension_mine['height']}px"
      in:receive={{ key: recommendation.id }}
      out:send={{ key: recommendation.id }}>
      {#if recommendation.imageLoaded}
        <img
          src={recommendation.src}
          alt={recommendation.name}
          in:fade
          style="max-width:{dimension_mine.width}px;max-height:{dimension_mine.height}px" />
      {/if}
    </div>
  {/each}
</div>
{#if buyButton_visible}
  <BuyButton
    dimensionMine={dimension_mine}
    on:click={() => alert('This is just a prototype. Sorry.')} />
{/if}
