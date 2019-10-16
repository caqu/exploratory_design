<script>
  /*
    This is a prototype for a decision support system. 
    And so it is optimized and organized for ease of editing and 
    rapidly trying out concepts as they would be seen by customers. 

    As an example, the Layout component uses CSS and the DOM to calculate the 
    positions of recommendations. 
    This is unnecessary overhead for a production-ready application, but quite
    useful for experimenting with new layouts using declarative CSS.
  */
  import { onMount, tick, onDestroy } from "svelte";
  import { crossfade } from "svelte/transition";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";

  import { preloadImage } from "./utils/sequential_image_loader.js";
  import { blank_gif } from "./utils/blank_gif.js";
  import { recommendationEntrance } from "./utils/animation_functions.js";

  import { getUID, my_design, buyButton_visible } from "./app_state.js";
  import Layout from "./layout/grid_16.svelte";
  import Error from "./Error.svelte";
  import BuyButton from "./BuyButton.svelte";

  // Animations for Recommendation-to-Selection action
  const [send, receive] = crossfade({
    duration: d => Math.sqrt(d * 400)
  });
  const SELECTED = "mine";
  let currentRecommendationSetId = 0;
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
    // This waits to fetch recommendations until the dimensions are calculated.
    // It's good enough for a prototype.
    // This should be parallelized in a production-ready application. Like:
    // Promise.all([getDimensions, getRecommendations]).then(...)
    recommendation_listPromise = getRecommendations({
      recommendationSetId: currentRecommendationSetId
    });
  }
  let selected = [];
  let initialImageURL = $my_design;
  let recommendation_list = [];
  let deselectedTarget;
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
          let { top, left, width, height } = dimensions[`area${index}`];
          recommendation_list[index] = {
            ...parsedData.recommendation_list[index],
            id: getUID(),
            skipEntrance: false,
            imageLoaded: false,
            top,
            left,
            width,
            height
          };
          preloadImage({
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
    //
    selected = [{ id: getUID(), src: blank_gif, imageLoaded: false }];
    preloadImage({
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
  function selectRecommendation(recommendation, index) {
    buyButton_visible.set(true);
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
  .immovable_container.selected {
    position: fixed;
    /* background: radial-gradient( 
      closest-side,
      rgb(255, 255, 255, 0.5),
      rgb(255, 255, 255, 0)
    ); */
  }
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

<Layout {setDimensions} />

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
            in:recommendationEntrance={{ delay: 500, duration: 600, index, deselectedTarget }}
            out:fade={{ duration: 200 }}
            data-skipentrance={recommendation.skipEntrance}
            style="max-width:{recommendation.width}px;max-height:{recommendation.height}px" />
        {/if}
      </div>
    {/each}
  </div>
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
{#if $buyButton_visible}
  <BuyButton
    dimensionMine={dimension_mine}
    handleClick={() => {
      alert('This is just a prototype. Sorry. Sending you to the real site!');
      window.open('https://www.vans.com/customizer.slip-on-classic.html', '_blank');
    }} />
{/if}
