// lib/pocketbase.ts
import PocketBase from "pocketbase";

//const pb = new PocketBase("https://33cd-105-103-251-166.ngrok-free.app");
//process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
const pb = new PocketBase("http://127.0.0.1:8090" || "http://127.0.0.1:8090");

pb.autoCancellation(false);
export default pb;
