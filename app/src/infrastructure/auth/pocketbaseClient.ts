import PocketBase from "pocketbase";

const pb = new PocketBase("http://192.168.1.10:8090");
//const pb = new PocketBase('http://127.0.0.1:8090');

export default pb;
