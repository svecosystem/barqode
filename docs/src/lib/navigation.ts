import { createNavigation } from "@svecodocs/kit";
import ChalkboardTeacher from "phosphor-svelte/lib/ChalkboardTeacher";
import RocketLaunch from "phosphor-svelte/lib/RocketLaunch";
import Tag from "phosphor-svelte/lib/Tag";
import { getAllDocs } from "./utils.js";

const allDocs = getAllDocs();

const components = allDocs
	.filter((doc) => doc.section === "Components")
	.map((doc) => ({
		title: doc.title,
		href: `/docs/${doc.slug}`,
	}));

const demos = allDocs
	.filter((doc) => doc.section === "Demos")
	.map((doc) => ({
		title: doc.title,
		href: `/docs/${doc.slug}`,
	}));

export const navigation = createNavigation({
	anchors: [
		{
			title: "Introduction",
			href: "/docs",
			icon: ChalkboardTeacher,
		},
		{
			title: "Getting Started",
			href: "/docs/getting-started",
			icon: RocketLaunch,
		},
		{
			title: "Releases",
			href: "https://github.com/svecosystem/barqode/releases",
			icon: Tag,
		},
	],
	sections: [
		{
			title: "Components",
			items: components.sort((a, b) => {
				if (a.title === "BarqodeStream") return -1;
				if (b.title === "BarqodeStream") return 1;
				return a.title.localeCompare(b.title);
			}),
		},
		{
			title: "Demos",
			items: demos,
		},
	],
});
