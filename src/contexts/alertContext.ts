import type Alert from '$components/base/Alert.svelte';
import { createContext } from '$lib/context';

export const alertContext = createContext<() => Alert>();
