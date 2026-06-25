// lib/pocketbase.ts
import PocketBase from "pocketbase";

//const pb = new PocketBase("https://33cd-105-103-251-166.ngrok-free.app");
const pb = new PocketBase(
	typeof window === "undefined"
		? process.env.PB_URL
		: process.env.NEXT_PUBLIC_PB_URL,
);

pb.autoCancellation(false);
export default pb;
