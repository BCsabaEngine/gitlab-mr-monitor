<script lang="ts">
	import { Badge } from 'flowbite-svelte';

	let visible: boolean = false;
	let _text: string;
	let _iserror: boolean;

	export const show = (text: string, isError: boolean, timeout = 2500) => {
		_text = text;
		_iserror = isError;
		visible = true;
		setTimeout(() => (visible = false), timeout);
	};
	export const hide = () => (visible = false);
</script>

{#if visible}
	<Badge border large color={_iserror ? 'red' : 'green'}>{_text}</Badge>
{/if}
