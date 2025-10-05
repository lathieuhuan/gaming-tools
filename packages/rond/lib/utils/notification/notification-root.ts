import ReactDOM from "react-dom/client";

const location = document.createElement("div");
location.className = "absolute top-0 z-100 w-full flex justify-center";
document.body.append(location);

const notifRoot = ReactDOM.createRoot(location);

export { location, notifRoot };
