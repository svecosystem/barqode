---
title: Getting Started
description: A quick guide to get started using barqode
section: Overview
---

The following guide will walk you through installing and setting up the barqode components in your Svelte project.

## Installation

Install the package using your preferred package manager:

```bash
npm install barqode
```

## Basic Usage

The simplest way to use the library is with the `BarqodeStream` component for live scanning:

```svelte
<script lang="ts">
	import { BarqodeStream, type DetectedBarcode } from "barqode";

	function onDetect(detectedCodes: DetectedBarcode[]) {
		console.log(detectedCodes.map((detectedCode) => detectedCode.rawValue));
	}
</script>

<div class="scanner">
	<BarqodeStream {onDetect} />
</div>

<style>
	.scanner {
		width: 100%;
		max-width: 600px;
		aspect-ratio: 4/3;
	}
</style>
```

For detailed information about each component's capabilities and options, refer to their respective API documentation pages.
