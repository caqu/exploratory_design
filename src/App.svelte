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

  import Layout from "./layout/grid_16.svelte";
  import Error from "./Error.svelte";
  import BuyButton from "./BuyButton.svelte";

  let buyButton_visible = false;
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
    // (eased => `opacity: ${eased};transform: scale(${eased}) rotate(${eased * 720}deg)`),
    // (eased => `opacity: ${eased};transform: scale(${eased}) rotate(${eased * -720}deg)`)
  ];
  let deselectedTarget;
  // Animations for Suggestion-to-Selection action
  const [send, receive] = crossfade({
    duration: d => Math.sqrt(d * 400)
  });
  let isLayoutVisible = true;
  const MINE = "mine";
  let currentRecommendationSetId = 0;
  let uid = 1;
  let dimensions = {}; // = { mine: { width: 122, height: 122, top: 50, left: 50 } };
  $: dimension_mine = dimensions[MINE] ? dimensions[MINE] : 0;
  let suggestion_listPromise;
  /**
   * Set Dimensions draws a CSS grid, captures the bounding rectangles.
   */
  async function setDimensions(dimensionsObject) {
    await tick();
    dimensions = { ...dimensionsObject };
    dimensions[MINE] = dimensionsObject[MINE];
    isLayoutVisible = false;
    // This waits to fetch recommendations until the dimensions were calculated.
    // It's good enough for a prototype. 
    // This should be parallelized in a production-ready application. Like:
    // Promise.all([getDimensions, getRecommendations]).then(...)
    suggestion_listPromise = getSuggestions({
      recommendationSetId: currentRecommendationSetId
    });
  }
  let selected = [{ id: uid++, src: "./images/shoe0.png" }];
  let suggestion_list = [];
  /**
   * Get suggestions from API server
   */
  async function getSuggestions({ recommendationSetId, skipIndex }) {
    const res = await fetch(
      `/api/v0/suggestion_list_${recommendationSetId}.json`
    );
    const text = await res.text();
    if (res.ok) {
      const parsedData = JSON.parse(text);
      // Augment suggestions object with a local UID and a screen position
      parsedData.suggestion_list.forEach((suggestion, index) => {
        if (index === skipIndex) {
          // Skip. The previous selection is going to land here.
          deselectedTarget = skipIndex;
        } else {
          let dimensions_of_area_for_suggestion = dimensions[`area${index}`];
          suggestion_list[index] = {
            ...parsedData.suggestion_list[index],
            id: uid++,
            skipEntrance: false,
            top: dimensions_of_area_for_suggestion.top,
            left: dimensions_of_area_for_suggestion.left,
            width: dimensions_of_area_for_suggestion.width,
            height: dimensions_of_area_for_suggestion.height
          };
        }
      });
      return parsedData;
    } else {
      throw new Error(text);
    }
  }
  onMount(() => {
    // TODO addEventListenerResize, reset dom, tick.
  });
  beforeUpdate(() => {
    //
  });
  function selectSuggestion(suggestion, index) {
    buyButton_visible = true;
    // Hold onto a reference of what's currently selected
    let current = selected[0];
    // Put the chosen Suggestion into the Selected spot
    selected = [suggestion];
    // To give Customers an "undo" path, move the old selection into the chosen Suggestion's old spot
    suggestion_list[index] = {
      ...current,
      skipEntrance: true,
      top: suggestion.top,
      left: suggestion.left,
      width: suggestion.width,
      height: suggestion.height
    };
    // Fetch new recommendations
    currentRecommendationSetId = (currentRecommendationSetId + 1) % 3; // fake it till you make it!!
    getSuggestions({
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
  .immovable_container.suggestions {
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
{#await suggestion_listPromise}
  <!-- <div>One moment please...</div> -->
{:then}
  <div class="immovable_container suggestions">
    {#each suggestion_list as suggestion, index (suggestion.id)}
      <div
        class="movable"
        data-id={suggestion.id}
        style="top:{suggestion.top}px;left:{suggestion.left}px;width:{suggestion.width}px;height:{suggestion.height}px"
        on:click={() => selectSuggestion(suggestion, index)}
        in:receive={{ key: suggestion.id }}
        out:send={{ key: suggestion.id }}>
        <img
          src={suggestion.src}
          data-id={suggestion.id}
          alt="alt"
          in:spin={{ delay: 500, duration: 600, index }}
          out:fade={{ duration: 200 }}
          data-skipentrance={suggestion.skipEntrance}
          style="max-width:{suggestion.width}px;max-height:{suggestion.height}px" />
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
      <img
        src={recommendation.src}
        alt={recommendation.name}
        in:fade
        style="max-width:{dimension_mine.width}px;max-height:{dimension_mine.height}px" />
    </div>
  {/each}
</div>
{#if buyButton_visible}
  <BuyButton
    dimensionMine={dimension_mine}
    on:click={() => alert('This is just a prototype. Sorry.')} />
{/if}
